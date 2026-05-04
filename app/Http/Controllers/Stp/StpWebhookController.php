<?php

namespace App\Http\Controllers\Stp;

use App\Http\Controllers\Controller;
use App\Models\StpAbono;
use App\Models\PaymentPlan;
use App\Models\Pago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class StpWebhookController extends Controller
{
    public function recibirAbono(Request $request)
    {
        // 1. Seguridad: Solo validamos IP en producción
        $allowedIps = ['168.231.75.146', '127.0.0.1', '::1'];
        if (app()->environment('production')) {
            if (!in_array($request->ip(), $allowedIps)) {
                \Log::warning("ACCESO NO AUTORIZADO: " . $request->ip());
                return response()->json(['mensaje' => 'devolver', 'causa' => 'IP_NOT_ALLOWED'], 401);
            }
        }

        // 2. Captura de datos segura (usando input() para evitar "Undefined array key")
        $clabeDestino = $request->input('cuentaBeneficiario');
        $monto = $request->input('monto', 0);

        // LOG DE ENTRADA para depuración
        \Log::info("Webhook STP Recibido", ['clabe' => $clabeDestino, 'monto' => $monto]);

        try {
            return \DB::transaction(function () use ($request, $clabeDestino, $monto) {

                // 3. IDENTIFICACIÓN: Buscamos a quién le pertenece esta CLABE
                // Ajusta el nombre del modelo según tu proyecto (ej. PlanPago o Cliente)
                $plan = \App\Models\PaymentPlan::where('cuenta_beneficiario', $clabeDestino)->first();
                // 4. CREACIÓN DEL REGISTRO (Usando los nombres exactos del JSON de STP)
                $abono = new \App\Models\StpAbono();

                // Datos de la Operación
                $abono->stp_id                    = $request->input('id');
                $abono->fecha_operacion           = $request->input('fechaOperacion');
                $abono->institucion_ordenante     = $request->input('institucionOrdenante');
                $abono->institucion_beneficiaria  = $request->input('institucionBeneficiaria');
                $abono->clave_rastreo             = $request->input('claveRastreo');
                $abono->monto                     = $request->input('monto');
                $abono->tipo_pago                 = $request->input('tipoPago', 1);

                // Datos del Ordenante (Los que faltaban)
                $abono->nombre_ordenante          = $request->input('nombreOrdenante');
                $abono->tipo_cuenta_ordenante     = $request->input('tipoCuentaOrdenante');
                $abono->cuenta_ordenante          = $request->input('cuentaOrdenante');
                $abono->rfc_curp_ordenante        = $request->input('rfcCurpOrdenante', 'ND');

                // Datos del Beneficiario
                $abono->nombre_beneficiario       = $request->input('nombreBeneficiario');
                $abono->tipo_cuenta_beneficiario  = $request->input('tipoCuentaBeneficiario');
                $abono->cuenta_beneficiario       = $clabeDestino;
                $abono->rfc_curp_beneficiario     = $request->input('rfcCurpBeneficiario', 'ND');

                // Metadata y Control
                $abono->concepto_pago             = $request->input('conceptoPago');
                $abono->referencia_numerica       = $request->input('referenciaNumerica');
                $abono->empresa                   = $request->input('empresa');
                $abono->ts_liquidacion            = $request->input('tsLiquidacion');

                // 5. LÓGICA DE NEGOCIO (Asignación de dueño y comisión)
                if ($plan) {
                    $abono->cliente_id = $plan->user_id; // Aquí sabemos de qué empresa es
                    $abono->metodo_pago = 'STP';

                    // Ejemplo: Cobras 1% de comisión por procesar el pago
                    $abono->comision_denar = $monto * 0.01;
                } else {
                    \Log::warning("Cuenta no asignada en sistema: " . $clabeDestino);
                    // Si la cuenta no existe, podrías decidir no guardar o marcar como 'huérfano'
                    $abono->cliente_id = null;
                    $abono->comision_denar = 0;
                }

                $abono->save();

                // 6. Aplicar lógica extra (ej. actualizar saldos)
                if (method_exists($this, 'aplicarPagoAlPlan')) {
                    $this->aplicarPagoAlPlan($abono);
                }

                return response()->json(['confirmacion' => 'success'], 200);
            });
        } catch (\Exception $e) {
            \Log::error('STP_WEBHOOK_ERROR: ' . $e->getMessage());
            return response()->json(['confirmacion' => 'error', 'causa' => $e->getMessage()], 500);
        }
    }

    private function aplicarPagoAlPlan($abono)
    {
        $clabe = $abono->cuenta_beneficiario;
        $montoRecibido = (float)$abono->monto;

        if (empty($clabe)) return;

        $plan = PaymentPlan::where('cuenta_beneficiario', $clabe)->first();

        if ($plan) {
            $nuevoAcumulado = (float)($plan->monto_pagado_acumulado ?? 0) + $montoRecibido;
            $deudaTotal = (float)($plan->monto_normal_final ?? 0) + (float)($plan->moratoria ?? 0);

            // --- NUEVA LÓGICA DE ESTADO ---
            $hoy = now();
            $fechaVenc = \Carbon\Carbon::parse($plan->fecha_vencimiento);

            if ($nuevoAcumulado >= ($deudaTotal - 0.50)) {
                $nuevoEstado = 'pagado';
            } elseif ($hoy->gt($fechaVenc)) {
                $nuevoEstado = 'vencido';
            } else {
                $nuevoEstado = $nuevoAcumulado > 0 ? 'parcial' : 'pendiente';
            }
            // ------------------------------

            $nuevosPagosRealizados = ($plan->pagos_realizados ?? 0) + 1;
            $nuevoPlazoRemanente = ($plan->plazo_remanente_credito > 0) ? ($plan->plazo_remanente_credito - 1) : 0;

            $plan->update([
                'monto_pagado_acumulado'   => $nuevoAcumulado,
                'estado'                   => $nuevoEstado,
                'fecha_pago_real'          => now(),
                'pagos_realizados'         => $nuevosPagosRealizados,
                'plazo_remanente_credito'  => $nuevoPlazoRemanente,
            ]);

            try {
                // ... (Tu código de Pago::create se queda igual, está bien el try/catch)
                Pago::create([
                    'payment_plan_id' => $plan->id,
                    'stp_abono_id'    => $abono->id,
                    'credito_id'      => $plan->credito_id ?? null,
                    'end_user_id'     => $plan->user_id,
                    'cliente_id'      => $plan->cliente_id ?? null,
                    'monto_pago'      => $montoRecibido,
                    'fecha_pago'      => now(),
                    'estatus'         => 'confirmado',
                    'clave_rastreo'   => $abono->clave_rastreo,
                    'metodo_pago'     => 'SPEI',
                    'metadata_stp'    => json_encode([
                        'banco_ordenante' => $abono->institucion_ordenante,
                        'concepto'        => $abono->concepto_pago,
                        'referencia'      => $abono->referencia_numerica
                    ])
                ]);
            } catch (\Exception $e) {
                Log::error("No se pudo crear el registro en la tabla pagos: " . $e->getMessage());
            }

            Log::info("¡PLAN ACTUALIZADO! CLABE {$clabe}: Pago {$nuevosPagosRealizados}/{$plan->plazo_credito_meses}. Estado: {$nuevoEstado}");
        } else {
            Log::error("ERROR CRÍTICO: La CLABE {$clabe} no existe en la tabla payment_plans.");
        }
    }

    public function generarReferenciaEfectivo(Request $request)
    {
        $url = "https://sandbox.sinergypay.mx/v2/cashin/references";
        $apiKey = env('SINERGY_API_KEY');

        $response = Http::withHeaders([
            'User-Agent' => 'DenarSaaS_1.0' // Requerido por SinergyPay
        ])->withBasicAuth($apiKey, '') // Password vacío según manual
            ->post($url, [
                'amount' => $request->monto, // Requerido
                'name'   => $request->nombre ?? 'Cliente Denar',
                'email'  => $request->email ?? 'pago@denar.mx',
                'expiration_minutes' => "1440" // 24 horas[cite: 1]
            ]);

        $res = $response->json();

        // Si Sinergy responde rc: 0, es exitoso[cite: 1]
        if (isset($res['rc']) && $res['rc'] === 0) {
            return response()->json([
                'status' => 'success',
                'data' => $res['data'] // Aquí viene la referencia y monto[cite: 1]
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => $res['message'] ?? 'Error en proveedor de pago'
        ], 400);
    }
}
