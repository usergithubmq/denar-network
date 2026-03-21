<?php

namespace App\Http\Controllers\Cliente;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EndUser;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class EndUserController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Verificamos que el usuario tenga un perfil de cliente asociado
        if (!$user->cliente) {
            return response()->json(['data' => [], 'message' => 'Sin empresa asociada'], 200);
        }

        try {
            // 1. Quitamos 'name' y 'email' del select porque ya no existen en la tabla end_users
            // 2. Cargamos la relación 'user' para obtener esos datos
            $pagadores = $user->cliente->endUsers()
                ->with('user')
                ->select('id', 'user_id', 'cliente_id', 'clabe_stp', 'referencia_interna', 'is_active', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($endUser) {
                    return [
                        'id'                 => $endUser->id,
                        'name'               => $endUser->user->name ?? 'N/A', // Viene de la tabla users
                        'email'              => $endUser->user->email ?? 'N/A', // Viene de la tabla users
                        'clabe_stp'          => $endUser->clabe_stp,
                        'referencia_interna' => $endUser->referencia_interna,
                        'is_active'          => $endUser->is_active,
                        'created_at'         => $endUser->created_at,
                    ];
                });

            return response()->json([
                'empresa'         => $user->cliente->nombre_comercial ?? $user->cliente->nombre_legal ?? 'Mi Empresa',
                'total_pagadores' => $pagadores->count(),
                'data'            => $pagadores
            ]);
        } catch (\Exception $e) {
            Log::error('Error cargando pagadores: ' . $e->getMessage());
            return response()->json(['error' => 'Error al cargar listado: ' . $e->getMessage()], 500);
        }
    }

    public function validatePagador(Request $request)
    {
        // 1. Usa variables de entorno (configúralas en tu .env)
        $user = env('NUBARIUM_USER');
        $pass = env('NUBARIUM_PASS');
        $value = strtoupper(trim($request->value));

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($user . ':' . $pass),
                'Accept'        => 'application/json',
                'Content-Type'  => 'application/json',
            ])->post('https://api.nubarium.com/renapo/v2/valida_curp', [
                'curp'      => $value,
                'documento' => '0'
            ]);

            // 2. Registro de depuración para ver qué dice Nubarium
            if ($response->status() === 403) {
                Log::critical('Nubarium denegó el acceso (403). Cuerpo de respuesta: ' . $response->body());
            }

            // 3. Devolvemos el estatus real
            return response()->json([
                'success' => $response->successful(),
                'status'  => $response->status(),
                'error'   => $response->failed() ? $response->body() : null, // Captura el error real
                'data'    => $response->successful() ? $response->json() : null
            ], $response->status());
        } catch (\Exception $e) {
            Log::error('Error de conexión en validatePagador: ' . $e->getMessage());
            return response()->json(['error' => 'Error interno de conexión'], 500);
        }
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $cliente = $user->cliente;

        if (!$cliente) return response()->json(['error' => 'No tienes una empresa asociada.'], 422);

        // Validación de tronco de CLABE
        $tronco = $cliente->clabe_stp_intermedia;
        if (!$tronco) return response()->json(['error' => 'El cliente no tiene un tronco de CLABE configurado.'], 422);

        // VALIDACIÓN: Aquí es donde salta el 422
        $request->validate([
            'name'  => 'required|string|max:255',
            // Cambiamos unique por una validación más descriptiva o la manejamos en el try
            'email' => 'required|email',
            'referencia_interna' => 'nullable|string|max:50',
            'document_value' => 'required|string'
        ]);

        // Verificar si el email ya existe manualmente para dar un error más claro
        if (\App\Models\User::where('email', $request->email)->exists()) {
            return response()->json(['error' => 'Este correo electrónico ya está registrado en el sistema.'], 422);
        }

        try {
            $resultado = DB::transaction(function () use ($request, $cliente, $tronco) {
                // 1. Crear el usuario de acceso a la APP
                $nuevoAcceso = \App\Models\User::create([
                    'name'     => $request->name,
                    'email'    => $request->email,
                    'password' => Hash::make($request->document_value), // Su CURP es su pass temporal
                    'role'     => 'analista',
                ]);

                // 2. Generar CLABE STP
                $consecutivo = str_pad(($cliente->endUsers()->count() + 1), 4, '0', STR_PAD_LEFT);
                $clabe17 = $tronco . $consecutivo;
                $digitoVerificador = $this->calcularDigitoVerificador($clabe17);
                $clabeCompleta = $clabe17 . $digitoVerificador;

                // 3. Crear el EndUser vinculado
                $endUser = EndUser::create([
                    'cliente_id'         => $cliente->id,
                    'user_id'            => $nuevoAcceso->id,
                    'clabe_stp'          => $clabeCompleta,
                    'referencia_interna' => $request->referencia_interna,
                    'document_value'     => $request->document_value, // Asegúrate de tener esta columna o quítala
                    'is_active'          => true,
                ]);

                return $endUser;
            });

            return response()->json([
                'message' => 'Pagador y Acceso generados con éxito.',
                'pagador' => $resultado,
                'user_id' => $resultado->user_id
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error en Store EndUser: ' . $e->getMessage());
            return response()->json(['error' => 'Error interno: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Algoritmo de Dígito Verificador CLABE (Módulo 10 Ponderado)
     */
    private function calcularDigitoVerificador($clabe17)
    {
        $pesos = [3, 7, 1];
        $suma = 0;
        foreach (str_split($clabe17) as $key => $digito) {
            $suma += ($digito * $pesos[$key % 3]) % 10;
        }
        return (10 - ($suma % 10)) % 10;
    }
}
