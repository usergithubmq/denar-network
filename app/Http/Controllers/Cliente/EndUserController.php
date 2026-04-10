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
        $user = \Auth::user();

        if (!$user || !$user->cliente) {
            return response()->json(['data' => [], 'message' => 'Sin empresa asociada'], 200);
        }

        try {
            $pagadores = $user->cliente->endUsers()
                ->with(['user', 'paymentPlan'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($endUser) {
                    return [
                        'id'                 => $endUser->id,
                        'user_id'            => $endUser->user_id,
                        'name'               => $endUser->user->name ?? 'N/A',
                        'email'              => $endUser->user->email ?? 'N/A',
                        'clabe_stp'          => $endUser->clabe_stp,
                        'referencia_interna' => $endUser->referencia_interna,
                        'is_active'          => $endUser->is_active,
                        'created_at'         => $endUser->created_at,
                        'payment_plan'       => $endUser->paymentPlan
                    ];
                });

            return response()->json([
                'empresa' => $user->cliente->nombre_comercial ?? 'Mi Empresa',
                'data'    => $pagadores
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en Pagadores: ' . $e->getMessage());
            return response()->json([
                'error'   => 'Error interno',
                'message' => $e->getMessage() // Esto te mostrará el error real en la consola de React
            ], 500);
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

        // 1. VALIDACIÓN: El contrato (referencia_interna) debe ser único globalmente
        $request->validate([
            'referencia_interna' => 'required|unique:end_users,referencia_interna',
            'document_value'     => 'required',
            'email'              => 'required|email',
            'name'               => 'required|string',
        ], [
            'referencia_interna.unique' => 'Este número de contrato ya existe en el sistema.',
            'document_value.required'   => 'El RFC es obligatorio.'
        ]);

        try {
            $resultado = DB::transaction(function () use ($request, $cliente) {
                $rfc = strtoupper(trim($request->document_value));

                // A. Asegurar el Usuario (Persona Fiscal)
                // Si el RFC ya existe, lo recupera. Si no, lo crea.
                $usuario = User::firstOrCreate(
                    ['rfc' => $rfc],
                    [
                        'name'       => $request->name,
                        'first_last' => $request->first_last ?? '',
                        'email'      => $request->email,
                        'password'   => Hash::make($rfc), // RFC como password inicial
                        'role'       => 'cliente_final',
                    ]
                );

                // B. Generar CLABE Única para este Contrato
                // Usamos el conteo global de EndUser para garantizar un consecutivo real
                $tronco = $cliente->clabe_stp_intermedia;
                $totalContratosGlobal = \App\Models\EndUser::count() + 1;
                $consecutivo = str_pad($totalContratosGlobal, 4, '0', STR_PAD_LEFT);

                $clabe17 = $tronco . $consecutivo;
                $clabeCompleta = $clabe17 . $this->calcularDigitoVerificador($clabe17);

                // C. Crear el Registro del Contrato (EndUser)
                // Vinculamos al usuario (nuevo o existente) con una nueva CLABE y Referencia
                $contrato = EndUser::create([
                    'cliente_id'         => $cliente->id,
                    'user_id'            => $usuario->id,
                    'clabe_stp'          => $clabeCompleta,
                    'referencia_interna' => $request->referencia_interna,
                    'is_active'          => true,
                ]);

                return ['usuario' => $usuario, 'contrato' => $contrato];
            });

            // D. Envío de Email de Bienvenida
            try {
                Mail::to($resultado['usuario']->email)
                    ->send(new BienvenidoPagadorMail($resultado['usuario'], $cliente));
            } catch (\Exception $e) {
                Log::error("Error enviando correo de bienvenida a {$resultado['usuario']->email}: " . $e->getMessage());
            }

            // Retornamos la data necesaria para que el Front genere el Plan de Pago
            return response()->json([
                'success' => true,
                'message' => 'Contrato y CLABE generados exitosamente.',
                'data'    => [
                    'user_id'            => $resultado['usuario']->id,
                    'clabe_stp'          => $resultado['contrato']->clabe_stp,
                    'end_user_id'        => $resultado['contrato']->id,
                    'referencia_interna' => $resultado['contrato']->referencia_interna
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error crítico en store EndUser: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error'   => 'No se pudo procesar el registro: ' . $e->getMessage()
            ], 500);
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
