<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ClientController extends Controller
{
    public function index()
    {
        // Solo traemos clientes que realmente tengan un usuario asociado
        $clientes = Cliente::has('user')
            ->with('user:id,email')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($clientes);
    }

    /**
     * Registra un nuevo Centro de Costos (Cliente) vinculado a un Usuario Administrador.
     */
    public function store(Request $request)
    {
        // 1. Validación estricta
        $request->validate([
            'nombre_comercial'     => 'required|string|max:255',
            'email'                => 'required|email|unique:users,email',
            'clabe_stp_intermedia' => 'required|string|size:13|unique:clientes,clabe_stp_intermedia',
            'rfc'                  => 'nullable|string|max:13',
            'tipo_cliente'          => 'required|string|in:empresa,fisica',
        ]);

        try {
            $resultado = DB::transaction(function () use ($request) {

                // 1. Crear el Usuario
                $user = User::create([
                    'name'     => $request->nombre_comercial,
                    'email'    => $request->email,
                    'password' => Hash::make('password123'),
                    'active'   => true,
                    'role'     => 'cliente',
                    'must_change_password' => true
                ]);

                // 2. Lógica de CLABE de 18 dígitos
                $tronco = $request->clabe_stp_intermedia;
                $clabeParcial = $tronco . "0000";
                $digitoVerificador = $this->calcularDigitoVerificador($clabeParcial);
                $clabeFinal = $clabeParcial . $digitoVerificador;

                // 3. Generar Slug
                $slug = Str::slug($request->nombre_comercial) . '-' . Str::random(5);

                // 4. Crear el Cliente - Mapeamos el tipo de persona
                $cliente = Cliente::create([
                    'user_id'              => $user->id,
                    'nombre_comercial'     => $request->nombre_comercial,
                    'nombre_legal'         => $request->nombre_comercial,
                    'tipo_cliente'         => $request->tipo_cliente,
                    'clabe_stp_intermedia' => $tronco,
                    'clabe_stp'            => $clabeFinal,
                    'rfc'                  => $request->rfc,
                    'slug'                 => $slug,
                    'is_active'            => true,
                ]);

                return $cliente;
            });

            return response()->json([
                'status'  => 'success',
                'message' => 'Infraestructura Denar provisionada correctamente.',
                'data'    => $resultado
            ], 201);
        } catch (\Exception $e) {
            Log::error("Error en Registro Denar: " . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo aprovisionar el nodo.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Devuelve la disponibilidad de troncos (Opcional para tu menú desplegable)
     */
    public function checkInventory()
    {
        // Extrae los últimos 3 dígitos de la clabe_stp_intermedia
        $ocupados = Cliente::pluck('clabe_stp_intermedia')
            ->map(function ($clabe) {
                return substr($clabe, -3);
            })
            ->filter() // Elimina nulos por si acaso
            ->values()
            ->toArray();

        return response()->json($ocupados);
    }

    public function getProfile(Request $request)
    {
        $user = $request->user();
        $cliente = $user->cliente;

        if (!$cliente) {
            return response()->json(['error' => 'Perfil no encontrado'], 404);
        }

        return response()->json([
            'nombre_comercial' => $cliente->nombre_comercial,
            'nombre_legal'     => $cliente->nombre_legal,
            'logo_url'         => $cliente->logo_url,
            'rfc'              => $cliente->rfc,
            'slug'             => $cliente->slug,
            'primary_color'    => $cliente->primary_color,
            'login_slogan'     => $cliente->login_slogan,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'logo'             => 'nullable|file|max:2048',
            'nombre_comercial' => 'nullable|string',
            'nombre_legal'     => 'nullable|string',
            'rfc'              => 'nullable|string',
            'slug'             => 'nullable|string',
            'primary_color'    => 'nullable|string',
            'login_slogan'     => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $cliente = $user->cliente;

        try {
            if ($request->hasFile('logo')) {
                $path = $request->file('logo')->store('logos', 'public');
                $cliente->logo_url = $path;
            }

            // Actualizamos permitiendo los nuevos campos de branding
            $cliente->fill($request->only([
                'nombre_comercial',
                'nombre_legal',
                'rfc',
                'slug',
                'primary_color',
                'login_slogan'
            ]));

            $cliente->save();

            return response()->json([
                'success' => true,
                'cliente' => $cliente // Devolvemos el cliente actualizado
            ]);
        } catch (\Exception $e) {
            \Log::error('Error de servidor: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
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
