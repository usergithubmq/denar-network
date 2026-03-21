<?php

namespace App\Http\Controllers\Stp;

use App\Http\Controllers\Controller;
use App\Models\StpAbono;
use App\Models\PaymentPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StpWebhookController extends Controller
{
    public function recibirAbono(Request $request)
    {
        // SEGURIDAD: Solo permitimos peticiones de nuestro propio servidor
        $allowedIps = ['168.231.75.146', '127.0.0.1'];

        if (!in_array($request->ip(), $allowedIps) && config('app.env') === 'production') {
            Log::warning("ACCESO NO AUTORIZADO: Intento desde " . $request->ip());
            return response()->json(['confirmacion' => 'error', 'causa' => 'Unauthorized'], 401);
        }

        Log::info('--- NUEVA PETICIÓN RECIBIDA ---');
        Log::info('METODO: ' . $request->method());
        Log::info('CONTENT_TYPE: ' . $request->header('Content-Type'));
        Log::info('BODY_RAW: ' . $request->getContent());
        Log::info('BODY_ARRAY:', $request->all());

        // 1. Extracción y Log de entrada
        $data = $request->json()->all();
        if (empty($data)) {
            $data = $request->all();
        }

        Log::info('STP_WEBHOOK_DATA_RECEIVED:', $data);

        try {
            // 2. Validación de CODI (Validación de cuenta operativa)
            if (($data['institucionOrdenante'] ?? '') == '90903' && ($data['nombreOrdenante'] ?? '') == 'CODI VALIDA') {
                Log::info('STP_CODI_VALIDATION_SUCCESS');
                return response()->json(['confirmacion' => 'success'], 200);
            }

            // 3. Verificación de duplicados
            $existe = StpAbono::where('clave_rastreo', $data['claveRastreo'] ?? '')
                ->where('fecha_operacion', $data['fechaOperacion'] ?? '')
                ->exists();

            if ($existe) {
                Log::warning("STP_DUPLICADO_IGNORADO: " . ($data['claveRastreo'] ?? 'SIN_CLAVE'));
                return response()->json(['confirmacion' => 'success'], 200);
            }
            Log::info('DEBUG_ID_VAL:', ['id' => $data['id'] ?? 'NO_HAY_ID']);
            Log::info('DEBUG_FULL_DATA:', $data);

            // 4. Guardado con Mapeo y Transacción
            DB::transaction(function () use ($data) {
                StpAbono::create([
                    'stp_id'                    => $data['id'] ?? null,
                    'fecha_operacion'           => $data['fechaOperacion'] ?? null,
                    'institucion_ordenante'     => $data['institucionOrdenante'] ?? null,
                    'institucion_beneficiaria'  => $data['institucionBeneficiaria'] ?? null,
                    'clave_rastreo'             => $data['claveRastreo'] ?? null,
                    'monto'                     => $data['monto'] ?? 0,
                    'nombre_ordenante'          => $data['nombreOrdenante'] ?? 'ND',
                    'tipo_cuenta_ordenante'     => $data['tipoCuentaOrdenante'] ?? null,
                    'cuenta_ordenante'          => $data['cuentaOrdenante'] ?? null,
                    'rfc_curp_ordenante'        => $data['rfcCurpOrdenante'] ?? 'ND',
                    'nombre_beneficiario'       => $data['nombreBeneficiario'] ?? 'ND',
                    'tipo_cuenta_beneficiario'  => $data['tipoCuentaBeneficiario'] ?? null,
                    'cuenta_beneficiario'       => $data['cuentaBeneficiario'] ?? null,
                    'rfc_curp_beneficiario'     => $data['rfcCurpBeneficiario'] ?? 'ND',
                    'nombre_beneficiario2'      => $data['nombreBeneficiario2'] ?? 'ND',
                    'tipo_cuenta_beneficiario2' => $data['tipoCuentaBeneficiario2'] ?? null,
                    'cuenta_beneficiario2'      => $data['cuentaBeneficiario2'] ?? null,
                    'concepto_pago'             => $data['conceptoPago'] ?? 'ND',
                    'referencia_numerica'       => $data['referenciaNumerica'] ?? 0,
                    'empresa'                   => $data['empresa'] ?? 'ND',
                    'tipo_pago'                 => $data['tipoPago'] ?? 1,
                    'ts_liquidacion'            => $data['tsLiquidacion'] ?? '0',
                    'folio_codi'                => $data['folioCodi'] ?? null,
                ]);

                $this->aplicarPagoAlPlan($data['cuentaBeneficiario'] ?? '', $data['monto'] ?? 0);
            });

            return response()->json(['confirmacion' => 'success'], 200);
        } catch (\Exception $e) {
            Log::error('STP_ERROR: ' . $e->getMessage(), [
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            return response()->json([
                'confirmacion' => 'error',
                'causa' => $e->getMessage()
            ], 500);
        }
    }

    private function aplicarPagoAlPlan($clabe, $montoRecibido)
    {
        if (empty($clabe)) return;

        // Buscamos el plan solo por CLABE para asegurar que lo encuentre
        $plan = PaymentPlan::where('cuenta_beneficiario', $clabe)->first();

        if ($plan) {
            $montoRecibido = (float) $montoRecibido;

            // Sumamos al acumulado que ya existe en la DB
            $nuevoAcumulado = (float)$plan->monto_pagado_acumulado + $montoRecibido;

            // Determinamos el estado: 
            // Si lo que ha pagado ya cubre el Crédito + la Moratoria, lo marcamos como pagado.
            $deudaTotal = (float)$plan->credito + (float)$plan->moratoria;
            $nuevoEstado = ($nuevoAcumulado >= ($deudaTotal - 0.01)) ? 'pagado' : 'parcial';

            $plan->update([
                'monto_pagado_acumulado' => $nuevoAcumulado,
                'estado'                 => $nuevoEstado,
                'fecha_pago_real'        => now(),
            ]);

            Log::info("KoonSystem - PAGO_EXITOSO: CLABE {$clabe} acumuló {$nuevoAcumulado}. Estado: {$nuevoEstado}");
        } else {
            Log::warning("KoonSystem - ERROR: Se recibió pago de {$montoRecibido} para CLABE {$clabe} pero la CLABE no existe en payment_plans.");
        }
    }
}
