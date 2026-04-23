<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StpAbono;
use App\Models\PaymentPlan;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class UserWalletController extends Controller
{
    public function getDashboard(Request $request)
    {
        $user = $request->user();

        // Armamos el nombre completo usando tus campos exactos
        $fullName = trim("{$user->name} {$user->first_last} {$user->second_last}");

        // 1. Obtenemos todos los planes vinculados al usuario
        $planesRaw = PaymentPlan::where('user_id', $user->id)->get();

        if ($planesRaw->isEmpty()) {
            return response()->json([
                'status' => 'empty',
                'data' => [
                    'user_name' => $fullName,
                    'clabe' => 'SIN CUENTA',
                    'saldo_en_cuenta' => 0,
                    'planes' => [],
                    'recent_history' => []
                ]
            ]);
        }

        // 2. Extraemos la CLABE principal y el listado de todas sus CLABEs
        $clabePrincipal = $planesRaw->first()->cuenta_beneficiario;
        $todasLasClabes = $planesRaw->pluck('cuenta_beneficiario')->toArray();

        // 3. Calculamos el saldo total sumando los abonos de TODAS las CLABEs del usuario
        $saldoTotal = (float)StpAbono::whereIn('cuenta_beneficiario', $todasLasClabes)->sum('monto');

        // 4. Obtenemos el historial reciente
        $history = StpAbono::whereIn('cuenta_beneficiario', $todasLasClabes)
            ->select('monto', 'created_at', 'concepto_pago', 'cuenta_beneficiario')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($h) {
                return [
                    'monto' => (float)$h->monto,
                    'fecha_human' => Carbon::parse($h->created_at)->translatedFormat('d M, Y'),
                    'concepto' => $h->concepto_pago ?? 'Abono Recibido',
                    'cuenta_beneficiario' => $h->cuenta_beneficiario
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'user_name' => $fullName, // Nombre para el componente CuentaClabe
                'clabe' => $clabePrincipal,
                'saldo_en_cuenta' => $saldoTotal,
                'recent_history' => $history,
                'planes' => $planesRaw->map(function ($plan) {
                    return [
                        'id' => $plan->id,
                        'cuenta_beneficiario_especifica' => $plan->cuenta_beneficiario,
                        'referencia' => $plan->referencia_contrato,
                        'total_prestado' => (float)$plan->credito,
                        'total_pagado' => (float)$plan->monto_pagado_acumulado,

                        // USAMOS LA LÓGICA DEL MODELO (Redondeo + Moratoria)
                        'pago_pendiente' => (float)$plan->saldo_total_a_pagar,
                        'es_monto_libre' => (bool)$plan->es_pago_libre,

                        'porcentaje_progreso' => $plan->credito > 0
                            ? round(($plan->monto_pagado_acumulado / $plan->credito) * 100)
                            : 0,
                        'vencimiento_human' => $plan->fecha_vencimiento ? $plan->fecha_vencimiento->translatedFormat('d M, Y') : 'N/A',
                        'dias_restantes' => $plan->fecha_vencimiento ? (int)Carbon::now()->startOfDay()->diffInDays($plan->fecha_vencimiento, false) : 0,
                        'estado' => $plan->estado,
                    ];
                }),
                'empresa' => [
                    'nombre' => 'Alianza Nacional Multimarca',
                    'logo_url' => 'logos/I4ofpaKVITY7O2w4TRQkiPiTY4BrG72S4C6pkf3P.png'
                ]
            ]
        ]);
    }

    public function getPaymentHistory(Request $request)
    {
        $user = $request->user();
        $todasLasClabes = PaymentPlan::where('user_id', $user->id)->pluck('cuenta_beneficiario');

        $history = StpAbono::whereIn('cuenta_beneficiario', $todasLasClabes)
            ->select('monto', 'created_at', 'clave_rastreo', 'concepto_pago', 'cuenta_beneficiario')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $history
        ]);
    }
}
