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

use App\Mail\BienvenidoPagadorMail;
use Illuminate\Support\Facades\Mail;

class EndUserController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (!$user->cliente) {
            return response()->json(['data' => [], 'message' => 'Sin empresa asociada'], 200);
        }

        try {
            $pagadores = $user->cliente->endUsers()
                ->with('user')
                ->select('id', 'user_id', 'cliente_id', 'clabe_stp', 'referencia_interna', 'is_active', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($endUser) {
                    return [
                        'id'                 => $endUser->id,
                        'name'               => $endUser->user->name ?? 'N/A',
                        'email'              => $endUser->user->email ?? 'N/A',
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
        try {
            $user = env('NUBARIUM_USER');
            $pass = env('NUBARIUM_PASS');

            if (!$request->value) {
                return response()->json(['success' => false, 'message' => 'RFC no proporcionado'], 400);
            }

            $rfc = strtoupper(trim($request->value));

            // LLAMADA REAL DIRECTA A NUBARIUM (Sin Bypass)
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($user . ':' . $pass),
                'Accept'        => 'application/json',
            ])->post('https://sat.nubarium.com/sat/v1/obtener-razonsocial', [
                'rfc'  => $rfc
            ]);

            $res = $response->json();

            // Si el estatus de Nubarium no es OK o no hay nombre, devolvemos error 422
            if (($res['estatus'] ?? '') !== 'OK' || !isset($res['nombre'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'El RFC no fue localizado en la base de datos del SAT'
                ], 422);
            }

            // Retornamos la data real mapeada para tu React
            return response()->json([
                'success' => true,
                'data'    => [
                    'rfc' => $res['rfc'],
                    'nombre_o_razon_social' => $res['nombre'],
                    'datosIdentificacion' => [
                        'nombres' => $res['nombre'],
                        'situacionContribuyente' => 'VALIDADO'
                    ]
                ]
            ], 200);
        } catch (\Exception $e) {
            Log::error("Error en validatePagador: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Error de comunicación con el servicio SAT'], 500);
        }
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $cliente = $user->cliente;

        try {
            // Ejecutamos la creación en DB
            $resultado = DB::transaction(function () use ($request, $cliente) {
                // A. Crear Usuario
                $nuevoUsuario = User::create([
                    'name'       => $request->name,
                    'first_last' => $request->first_last ?? '',
                    'email'      => $request->email,
                    'password'   => Hash::make($request->document_value), // RFC como pass
                    'role'       => 'cliente_final',
                    'rfc'        => strtoupper($request->document_value),
                ]);

                // B. Generar CLABE
                $tronco = $cliente->clabe_stp_intermedia;
                $consecutivo = str_pad(($cliente->endUsers()->count() + 1), 4, '0', STR_PAD_LEFT);
                $clabe17 = $tronco . $consecutivo;
                $clabeCompleta = $clabe17 . $this->calcularDigitoVerificador($clabe17);

                // C. Crear EndUser (Contrato)
                $contrato = EndUser::create([
                    'cliente_id'         => $cliente->id,
                    'user_id'            => $nuevoUsuario->id,
                    'clabe_stp'          => $clabeCompleta,
                    'referencia_interna' => $request->referencia_interna,
                    'is_active'          => true,
                ]);

                // Retornamos ambos para usarlos en el correo
                return ['usuario' => $nuevoUsuario, 'contrato' => $contrato];
            });

            // --- D. ENVÍO DE EMAIL DE BIENVENIDA (BREVO) ---
            try {
                // Le pasamos el objeto usuario y el objeto cliente (la empresa)
                Mail::to($resultado['usuario']->email)
                    ->send(new BienvenidoPagadorMail($resultado['usuario'], $cliente));
            } catch (\Exception $e) {
                // Logueamos si el correo falló, pero no lanzamos error al front 
                // porque el usuario YA fue creado exitosamente arriba.
                Log::error("Error enviando correo de bienvenida: " . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'data'    => $resultado['contrato']
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error en store EndUser: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function calcularDigitoVerificador($clabe17)
    {
        $pesos = [3, 7, 1];
        $suma = 0;
        foreach (str_split($clabe17) as $key => $digito) {
            if (!is_numeric($digito)) continue;
            $suma += ($digito * $pesos[$key % 3]) % 10;
        }
        return (10 - ($suma % 10)) % 10;
    }
}
