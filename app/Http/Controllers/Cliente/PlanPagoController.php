<?php

namespace App\Http\Controllers\Cliente;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PaymentPlan;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PlanPagoController extends Controller
{

    public function generarPlan(Request $request)
    {
        $request->validate([
            'user_id'             => 'required|exists:users,id',
            'cuenta_beneficiario' => 'required|string',
            'monto_normal'        => 'required|numeric',
            'moratoria'           => 'required|numeric',
        ]);

        try {
            $plan = \App\Models\PaymentPlan::create([
                'user_id'             => $request->user_id,
                'cuenta_beneficiario' => $request->cuenta_beneficiario,
                'referencia_contrato' => $request->referencia_contrato,

                // Solo almacenamos lo que nos interesa de la mensualidad
                'monto_normal'        => $request->monto_normal,
                'moratoria'           => $request->moratoria,

                // Opcional: puedes dejar las fechas automáticas o quitarlas 
                // ya que ahora son nullable, pero es mejor tener una referencia
                'fecha_vencimiento'   => now()->addDays(30)->format('Y-m-d'),
                'fecha_limite_habil'  => now()->addDays(35)->format('Y-m-d'),

                'estado'              => $request->estado ?? 'pendiente',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Plan de pago generado con éxito',
                'plan'    => $plan
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error en DB: ' . $e->getMessage()], 500);
        }
    }


    // En PlanPagoController.php
    public function obtenerResumen(Request $request)
    {
        $clabe = $request->cuenta_beneficiario;
        $plan = \App\Models\PaymentPlan::where('cuenta_beneficiario', $clabe)->first();

        if (!$plan) {
            return response()->json(['data' => null], 404);
        }

        // Usamos los nombres de tu modelo PaymentPlan
        $acumulado = (float)($plan->monto_pagado_acumulado ?? 0);
        $credito   = (float)($plan->credito ?? 0);
        $moratoria = (float)($plan->moratoria ?? 0);

        // Saldo Total = (Lo que falta de crédito) + moratoria
        $saldoTotal = ($credito - $acumulado) + $moratoria;

        // Progreso
        $progreso = ($credito > 0) ? round(($acumulado / $credito) * 100) : 0;

        return response()->json([
            'data' => [
                'monto_acumulado' => $acumulado, // <--- ANTES DECÍA 'abonado', POR ESO FALLABA
                'moratoria'       => $moratoria,
                'saldo_total'     => $saldoTotal, // <--- ANTES DECÍA 'total_a_pagar'
                'progreso'        => $progreso,
                'referencia'      => $plan->referencia_contrato ?? 'S/R'
            ]
        ]);
    }
}
