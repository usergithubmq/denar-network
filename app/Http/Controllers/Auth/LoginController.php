<?php

namespace App\Http\Controllers\Auth;

// Importamos el controlador base que me acabas de mostrar
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        error_reporting(E_ALL & ~E_DEPRECATED);

        $request->validate([
            'email'    => 'required|email',
            'password' => 'required'
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        $user = Auth::user();
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'token'   => $token,
            'user'    => [
                'name' => $user->name,
                'role' => $user->role, // 👈 Importante: 'admin' o 'cliente'
                'must_change_password' => (bool) $user->must_change_password,
            ]
        ]);
    }

    public function updateFirstPassword(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string|min:10',
        ]);

        $user = $request->user();

        // Ahora sí, Laravel encontrará la clase Hash aquí:
        $user->password = Hash::make($request->password);
        $user->must_change_password = false;
        $user->save();

        return response()->json([
            'message' => 'Contraseña de Denar actualizada con éxito.',
            'status'  => 'success'
        ]);
    }
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Token eliminado, sesión cerrada']);
    }
}
