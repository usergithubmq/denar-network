<?php

namespace App\Http\Controllers\Cliente;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaymentPlan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PlanPagoController extends Controller
{
    /**
     * Genera un nuevo plan de pago con la lógica de Denar Network.
     */
    public function generarPlan(Request $request)
    {
        // 1. Convertimos explícitamente el monto_libre a booleano antes de validar
        // porque Axios a veces lo envía como string "true"/"false"
        if ($request->has('monto_libre')) {
            $request->merge([
                'monto_libre' => filter_var($request->monto_libre, FILTER_VALIDATE_BOOLEAN)
            ]);
        }

        $validated = $request->validate([
            'user_id'             => 'required',
            'cuenta_beneficiario' => 'required|string',
            'referencia_contrato' => 'nullable|string',
            'valor_factura'       => 'nullable|numeric',
            'credito'             => 'required|numeric',
            'enganche'            => 'nullable|numeric',
            'plazo_credito_meses' => 'nullable|integer',
            'monto_libre'         => 'required|boolean',
            'monto_normal'        => 'nullable|numeric',
            'monto_normal_final'  => 'nullable|numeric',
            'fecha_vencimiento'   => 'nullable',
            'fecha_limite_habil'  => 'nullable',
            'moratoria'           => 'nullable|numeric',
            'tipo_moratoria'      => 'required|string',
            'estado'              => 'nullable|string'
        ]);

        try {
            return DB::transaction(function () use ($validated) {

                // Si es monto_libre, ignoramos las fechas del front y ponemos default
                $esLibre = $validated['monto_libre'];

                $plan = PaymentPlan::create([
                    'user_id'             => $validated['user_id'],
                    'cuenta_beneficiario' => $validated['cuenta_beneficiario'],
                    'referencia_contrato' => $validated['referencia_contrato'] ?? 'S/R',
                    'valor_factura'       => $validated['valor_factura'] ?? 0,
                    'credito'             => $validated['credito'],
                    'enganche'            => $validated['enganche'] ?? 0,
                    'plazo_credito_meses' => $validated['plazo_credito_meses'] ?? 1,
                    'plazo_remanente_credito' => $validated['plazo_credito_meses'] ?? 1,
                    'saldo_restante'      => $validated['credito'],
                    'monto_libre'         => $esLibre,
                    'monto_normal'        => $validated['monto_normal'] ?? 0,
                    'monto_normal_final'  => $validated['monto_normal_final'] ?? ($validated['monto_normal'] ?? 0),

                    // Lógica de fechas segura: si es libre o viene nulo, ponemos una fecha lejana o hoy
                    'fecha_vencimiento'   => (!$esLibre && $validated['fecha_vencimiento'])
                        ? Carbon::parse($validated['fecha_vencimiento'])
                        : now()->addYears(1), // Para monto libre, no vence pronto

                    'fecha_limite_habil'  => (!$esLibre && $validated['fecha_limite_habil'])
                        ? Carbon::parse($validated['fecha_limite_habil'])
                        : now()->addYears(1)->addDays(5),

                    'moratoria'           => $validated['moratoria'] ?? 0,
                    'tipo_moratoria'      => $validated['tipo_moratoria'] ?? 'fijo',
                    'estado'              => $validated['estado'] ?? 'pendiente',
                    'monto_pagado_acumulado' => 0,
                    'pagos_realizados'    => 0,
                ]);

                return response()->json([
                    'success' => true,
                    'plan'    => $plan
                ], 201);
            });
        } catch (\Exception $e) {
            Log::error("DENAR_ERROR: " . $e->getMessage());
            return response()->json([
                'error' => 'Error interno',
                'debug' => $e->getMessage() // Esto te dirá el error real en el alert del Front
            ], 500);
        }
    }

    /**
     * Obtiene el resumen financiero del plan.
     */
    public function obtenerResumen(Request $request)
    {
        $plan = PaymentPlan::where('cuenta_beneficiario', $request->cuenta_beneficiario)
            ->first();

        if (!$plan) {
            return response()->json(['data' => null], 404);
        }

        return response()->json([
            'data' => [
                'credito'         => (float)$plan->credito,
                'monto_mensual'   => (float)$plan->monto_normal,
                'monto_acumulado' => (float)$plan->monto_pagado_acumulado,
                'moratoria'       => (float)$plan->moratoria,
                'saldo_total'     => (float)$plan->saldo_restante,
                'progreso'        => ($plan->credito > 0) ? min(100, round(($plan->monto_pagado_acumulado / $plan->credito) * 100)) : 0,
                'referencia'      => $plan->referencia_contrato ?? 'S/R',
                'estado'          => $plan->estado,
                'monto_libre'     => (bool)$plan->monto_libre
            ]
        ]);
    }
    public function update(Request $request, $id)
    {
        $plan = \App\Models\PaymentPlan::find($id);

        if (!$plan) {
            return response()->json([
                'success' => false,
                'message' => 'El plan de pago no existe.'
            ], 404);
        }

        // 1. Validación
        $request->validate([
            'monto_normal'       => 'required|numeric',
            'monto_normal_final' => 'nullable|numeric',
            'moratoria'          => 'required|numeric',
            'fecha_vencimiento'  => 'required|date',
            'fecha_limite_habil' => 'nullable|date',
        ]);

        try {
            // 2. Lógica de fecha límite
            $fechaLimite = $request->fecha_limite_habil
                ? $request->fecha_limite_habil
                : \Carbon\Carbon::parse($request->fecha_vencimiento)->addDays(5)->format('Y-m-d');

            // --- LÓGICA ALTERNA AQUÍ ---
            // Si el monto_normal_final es mayor a 0, el plan es FIJO (monto_libre = 0).
            // Si es 0 o vacío, el plan es LIBRE (monto_libre = 1).
            $montoAjuste = (float) $request->monto_normal_final;
            $montoLibreStatus = ($montoAjuste > 0) ? 0 : 1;

            // 3. Actualización
            $plan->update([
                'monto_normal'       => (float) $request->monto_normal,
                'monto_normal_final' => $montoAjuste,
                'moratoria'          => (float) $request->moratoria,
                'fecha_vencimiento'  => $request->fecha_vencimiento,
                'fecha_limite_habil' => $fechaLimite,
                'monto_libre'        => $montoLibreStatus, // Ya no es 0 fijo, ahora es dinámico
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Plan actualizado correctamente',
                'data'    => $plan->fresh()
            ], 200);
        } catch (\Exception $e) {
            \Log::error("Error actualizando plan ID {$id}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error interno: ' . $e->getMessage()
            ], 500);
        }
    }
}
