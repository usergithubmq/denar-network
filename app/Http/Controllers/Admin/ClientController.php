<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

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

    public function store(Request $request)
    {
        $rules = [
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email',
            'password'    => 'required|min:8',
            'person_type' => 'required|in:fisica,moral',
            'rfc'         => 'required|string|max:13',
        ];

        if ($request->person_type === 'fisica') {
            $rules['first_last'] = 'required|string|max:100';
        }

        $request->validate($rules);

        try {
            return DB::transaction(function () use ($request) {
                // 1. Crear el Usuario Base
                $user = User::create([
                    'name'       => $request->name,
                    'email'      => strtolower($request->email),
                    'password'   => Hash::make($request->password),
                    'role'       => 'cliente',
                    'first_last' => $request->person_type === 'fisica' ? $request->first_last : '',
                    'second_last' => $request->person_type === 'fisica' ? $request->second_last : null,
                ]);

                // 2. LÓGICA DE CLABES STP (KoonSystem Engine)
                $banco = "646";
                $plaza = "180";
                $prefijoEmpresa = "6665";

                // Calculamos el siguiente prefijo de cliente (027, 028, etc.)
                // Si es el primero, empezamos en 27
                $proximoId = (Cliente::max('id') ?? 0) + 06;
                $prefijoCliente = str_pad($proximoId, 3, '0', STR_PAD_LEFT);

                // TRONCO (13 dígitos) para cobranza referenciada
                $tronco = $banco . $plaza . $prefijoEmpresa . $prefijoCliente;

                // CLABE PROPIA (18 dígitos) para que el cliente reciba créditos
                // Usamos el "0000" como cuenta maestra del cliente y calculamos su dígito verificador
                $clabePropia17 = $tronco . "0000";
                $digitoPropio = $this->calcularDigitoVerificador($clabePropia17);
                $clabeCompletaPropia = $clabePropia17 . $digitoPropio;

                // 3. Crear el Perfil de Cliente con sus llaves financieras
                $user->cliente()->create([
                    'rfc'                   => strtoupper($request->rfc),
                    'tipo_cliente'          => ($request->person_type === 'moral') ? 'empresa' : 'persona',
                    'nombre_legal'          => $request->name, // Opcional: ajustar según input
                    'estatus'               => 'aprobado',
                    'clabe_stp'             => $clabeCompletaPropia,    // CLABE Maestra (18)
                    'clabe_stp_intermedia'  => $tronco,                 // Raíz para EndUsers (13)
                    'usa_cobranza'          => true,                    // Habilitado por defecto
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Entidad registrada con éxito en KoonSystem.',
                    'user'    => $user->load('cliente')
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function getProfile(Request $request)
    {
        $user = $request->user();
        $cliente = $user->cliente; // Asegúrate de tener la relación 'cliente' en el modelo User

        if (!$cliente) {
            return response()->json(['error' => 'Perfil no encontrado'], 404);
        }

        return response()->json([
            'nombre_comercial' => $cliente->nombre_comercial,
            'nombre_legal'     => $cliente->nombre_legal,
            'logo_url'         => $cliente->logo_url, // Ruta relativa almacenada
            'rfc'              => $cliente->rfc
        ]);
    }

    public function updateProfile(Request $request)
    {
        // 1. Ver qué recibimos exactamente
        \Log::info('Datos recibidos en request:', $request->all());
        \Log::info('Archivos recibidos:', $request->file());

        // 2. Validación "Relajada" (sin regla 'image')
        $validator = \Validator::make($request->all(), [
            'logo' => 'nullable|file|max:2048', // Quitamos 'image' y 'mimes'
            'nombre_comercial' => 'nullable|string',
            'rfc' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::error('Errores de validación:', $validator->errors()->toArray());
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = auth()->user();
        $cliente = $user->cliente;

        try {
            if ($request->hasFile('logo')) {
                $path = $request->file('logo')->store('logos', 'public');
                $cliente->logo_url = $path;
            }

            $cliente->fill($request->only(['nombre_comercial', 'nombre_legal', 'rfc']));
            $cliente->save();

            return response()->json(['success' => true]);
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
