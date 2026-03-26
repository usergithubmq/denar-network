<?php

namespace App\Http\Controllers\Cliente;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StpAbono;

use Illuminate\Support\Facades\Auth;

class UserWalletController extends Controller
{
    public function getDashboard(Request $request)
    {
        // 1. Cargamos al usuario con su EndUser (para llegar al Cliente) y su PaymentPlan
        $user = $request->user()->load(['endUser.cliente', 'paymentPlan']);

        // 2. Extraemos la información de la Empresa (Cliente)
        // El EndUser es el vínculo entre el Usuario y la Empresa
        $cliente = $user->endUser->cliente ?? abort(500, "Este usuario no tiene empresa asociada");

        // 3. Extraemos su CLABE asignada del plan de pago
        $clabe = $user->paymentPlan->cuenta_beneficiario ?? 'SIN ASIGNAR';

        // 4. Calculamos el saldo real sumando los abonos de STP
        $saldoReal = 0;
        if ($clabe !== 'SIN ASIGNAR') {
            $saldoReal = StpAbono::where('cuenta_beneficiario', $clabe)->sum('monto');
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'saldo' => (float)$saldoReal,
                'clabe' => $clabe,
                'pago_pendiente' => (float)($user->paymentPlan->monto_pendiente ?? 0.00),
                'proximo_vencimiento' => $user->paymentPlan->fecha_vencimiento ?? 'N/A',
                'empresa' => [
                    'nombre' => $cliente->nombre_comercial ?? $cliente->nombre_legal ?? 'KOONPAY',
                    'logo_url' => $cliente->logo_url ?? null,
                ]
            ]
        ]);
    }

    public function getPaymentHistory(Request $request)
    {
        $user = $request->user()->load('paymentPlan');
        $clabe = $user->paymentPlan->cuenta_beneficiario ?? null;

        if (!$clabe) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        // Traemos los últimos 10 abonos reales que el Gateway procesó para este usuario
        $history = StpAbono::where('cuenta_beneficiario', $clabe)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($abono) {
                return [
                    'id' => $abono->id,
                    'monto' => $abono->monto,
                    'concepto' => $abono->concepto_pago,
                    'fecha' => $abono->created_at->format('d/m/Y H:i'),
                    'rastreo' => $abono->clave_rastreo
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $history
        ]);
    }
}
