<?php

namespace App\Http\Controllers\Stp;

use App\Http\Controllers\Controller;
use App\Models\StpAbono;
use App\Models\PaymentPlan;
use App\Models\Pago;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StpWebhookController extends Controller
{
    public function recibirAbono(Request $request)
    {
        // 1. Mejora la validación de IP o quítala en local
        $allowedIps = ['168.231.75.146', '127.0.0.1', '::1']; // Añadimos IPv6 local

        // Solo validamos IP si estamos en producción real
        if (app()->environment('production')) {
            if (!in_array($request->ip(), $allowedIps)) {
                Log::warning("ACCESO NO AUTORIZADO: Intento desde " . $request->ip());
                return response()->json(['mensaje' => 'devolver', 'causa' => 'IP_NOT_ALLOWED'], 401);
            }
        }

        // 2. Asegúrate de capturar bien el JSON
        $data = $request->all();

        // LOG DE ENTRADA (Para que veas en el log que SÍ llegó)
        Log::info("Denar SaaS: Webhook Recibido", ['clabe' => $data['cuentaBeneficiario'] ?? 'SIN_CLAVE']);

        try {
            // ... (Resto de tu lógica de CODI y Duplicados igual)

            // 3. Modificación en la Transacción para que sea más segura
            return DB::transaction(function () use ($data) {
                $abono = StpAbono::create([
                    'stp_id'                    => $data['id'] ?? $data['stp_id'] ?? null,
                    'fecha_operacion'           => $data['fechaOperacion'] ?? $data['fecha_operacion'] ?? null,
                    'institucion_ordenante'     => $data['institucionOrdenante'] ?? $data['institucion_ordenante'] ?? null,
                    'institucion_beneficiaria'  => $data['institucionBeneficiaria'] ?? $data['institucion_beneficiaria'] ?? null,
                    'clave_rastreo'             => $data['claveRastreo'] ?? $data['clave_rastreo'] ?? null,
                    'monto'                     => $data['monto'] ?? 0,
                    'nombre_ordenante'          => $data['nombreOrdenante'] ?? $data['nombre_ordenante'] ?? 'ND',
                    'tipo_cuenta_ordenante'     => $data['tipoCuentaOrdenante'] ?? $data['tipo_cuenta_ordenante'] ?? null,
                    'cuenta_ordenante'          => $data['cuentaOrdenante'] ?? $data['cuenta_ordenante'] ?? null,
                    'rfc_curp_ordenante'        => $data['rfcCurpOrdenante'] ?? $data['rfc_curp_ordenante'] ?? 'ND',
                    'nombre_beneficiario'       => $data['nombreBeneficiario'] ?? $data['nombre_beneficiario'] ?? 'ND',
                    'tipo_cuenta_beneficiario'  => $data['tipoCuentaBeneficiario'] ?? $data['tipo_cuenta_beneficiario'] ?? null,
                    'cuenta_beneficiario'       => $data['cuentaBeneficiario'] ?? $data['cuenta_beneficiario'] ?? null,
                    'rfc_curp_beneficiario'     => $data['rfcCurpBeneficiario'] ?? $data['rfc_curp_beneficiario'] ?? 'ND',
                    'concepto_pago'             => $data['conceptoPago'] ?? $data['concepto_pago'] ?? 'ND',
                    'referencia_numerica'       => $data['referenciaNumerica'] ?? $data['referencia_numerica'] ?? 0,
                    'empresa'                   => $data['empresa'] ?? 'ND',
                    'tipo_pago'                 => $data['tipoPago'] ?? $data['tipo_pago'] ?? 1,
                    'ts_liquidacion'            => $data['tsLiquidacion'] ?? $data['ts_liquidacion'] ?? '0',
                ]);

                $this->aplicarPagoAlPlan($abono);

                return response()->json(['confirmacion' => 'success'], 200);
            });
        } catch (\Exception $e) {
            Log::error('STP_WEBHOOK_ERROR: ' . $e->getMessage());
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
}
