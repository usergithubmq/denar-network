<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckIpWhitelist
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // 1. Si no hay usuario o no es cliente, bloqueamos
        if (!$user || !$user->cliente) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $cliente = $user->cliente;
        $ipEntrante = $request->ip();

        // 2. Si el cliente tiene una IP configurada, comparamos
        if ($cliente->allowed_ip && $cliente->allowed_ip !== $ipEntrante) {
            \Log::warning("Intento de acceso fallido desde IP no autorizada: $ipEntrante para el cliente ID: {$cliente->id}");

            return response()->json([
                'error' => 'IP no autorizada.',
                'your_ip' => $ipEntrante // Opcional: para que el cliente sepa qué IP reportar
            ], 403);
        }

        return $next($request);
    }
}
