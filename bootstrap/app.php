<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // 1. Indispensable para que las cookies de sesión funcionen entre React y Laravel
        // Al estar en localhost, esto suele causar el 401 si no se maneja la excepción
        $middleware->statefulApi();

        // 2. Excepciones de Cookies
        // Esto evita que Sanctum intente "adivinar" el usuario mediante cookies 
        // cuando el Dispatcher hace la petición desde el mismo servidor.
        $middleware->encryptCookies(except: [
            'api/stp/webhook/abono',
        ]);

        // 3. Excepciones de CSRF
        $middleware->validateCsrfTokens(except: [
            'api/stp/webhook/abono', // Ruta exacta del webhook
            'login',
        ]);

        // 4. Aliases de Middleware
        $middleware->alias([
            'whitelist' => \App\Http\Middleware\CheckIpWhitelist::class,
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
