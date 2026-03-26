<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Verificamos si el usuario está autenticado
        // 2. Comparamos su columna 'role' con el parámetro que enviamos en la ruta
        if (!$request->user() || $request->user()->role !== $role) {
            return response()->json([
                'message' => 'Acceso denegado. Se requiere el rol: ' . $role
            ], 403);
        }

        return $next($request);
    }
}
