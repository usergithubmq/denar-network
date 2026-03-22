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
        $middleware->statefulApi();

        // 2. Solo dejamos excepciones para servicios externos (Webhooks)
        // QUITAMOS 'login', 'register', 'api/*', etc.
        $middleware->validateCsrfTokens(except: [
            'api/stp/webhook/abono',
        ]);

        $middleware->alias([
            'whitelist' => \App\Http\Middleware\CheckIpWhitelist::class,
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {})->create();
