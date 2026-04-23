<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\SinergyService;
use App\Models\PaymentPlan;
use Illuminate\Support\Facades\Log;

class CashPaymentController extends Controller
{
    protected $sinergy;

    public function __construct(SinergyService $sinergy)
    {
        $this->sinergy = $sinergy;
    }

    public function generateReference(Request $request)
    {
        $user = $request->user();

        try {
            // 1. Buscamos el plan con estados flexibles para asegurar que encuentre algo
            $plan = PaymentPlan::where('user_id', $user->id)
                ->whereIn('estado', ['pendiente', 'atrasado', 'parcial'])
                ->first();

            if (!$plan) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No se encontró un plan de pago pendiente (revisa la tabla payment_plans para el user_id: ' . $user->id . ')'
                ], 400);
            }

            // 2. Forzamos el cálculo y aseguramos que sean números
            $normal = (float) ($plan->monto_normal_final ?? 0);
            $mora   = (float) ($plan->moratoria ?? 0);
            $pagado = (float) ($plan->monto_pagado_acumulado ?? 0);

            $montoCalculado = ($normal + $mora) - $pagado;

            // Log para debug interno (revisa storage/logs/laravel.log)
            Log::info("Calculando pago para User {$user->id}: ({$normal} + {$mora}) - {$pagado} = {$montoCalculado}");

            if ($montoCalculado < 10) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'El monto calculado ($' . number_format($montoCalculado, 2) . ') es menor al mínimo de $10.00'
                ], 400);
            }

            // 3. Preparar data para Sinergy
            $orderData = [
                'amount'             => (string) number_format($montoCalculado, 2, '.', ''),
                'name'               => $user->name . ' ' . ($user->first_last ?? ''),
                'email'              => $user->email,
                'phone'              => $user->phone ?? '4421234567',
                'expiration_minutes' => "9999",
                'custom_data'        => 'PLAN_' . $plan->id . '_U' . $user->id,
            ];

            $result = $this->sinergy->generateCashReference($orderData);

            if ($result['success']) {
                return response()->json([
                    'status' => 'success',
                    'data'   => $result['data']
                ]);
            }

            // Si falla la API de Sinergy
            return response()->json([
                'status'  => 'error',
                'message' => 'SinergyPay: ' . ($result['message'] ?? 'Error de conexión'),
                'details' => $result['error'] ?? null
            ], 400);
        } catch (\Exception $e) {
            Log::error("Error Crítico: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Excepción: ' . $e->getMessage()
            ], 500);
        }
    }
}
