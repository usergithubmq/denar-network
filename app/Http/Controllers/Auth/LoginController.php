<?php

namespace App\Http\Controllers\Auth;

// Importamos el controlador base que me acabas de mostrar
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Http\JsonResponse; // 👈 Esto quita el error rojo de la imagen

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
            ]
        ]);
    }
    public function logout(Request $request)
    {
        // Elimina el token actual de la base de datos
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Token eliminado, sesión cerrada']);
    }
}
