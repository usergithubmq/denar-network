<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controladores
use App\Http\Controllers\Api\EnrolamientoController;

use App\Http\Controllers\Auth\PhoneVerificationController;
use App\Http\Controllers\Auth\LoginController;

use App\Http\Controllers\Admin\ClientController;

use App\Http\Controllers\Cliente\ProfileController;
use App\Http\Controllers\Cliente\EndUserController;
use App\Http\Controllers\Cliente\PlanPagoController;
use App\Http\Controllers\Cliente\UserWalletController;

use App\Http\Controllers\ReporteController;

use App\Http\Controllers\Onboarding\LivenessController;
use App\Http\Controllers\Onboarding\IneController;

use App\Http\Controllers\Stp\StpWebhookController;

/*
|--------------------------------------------------------------------------
| API Routes - Denar B2B
|--------------------------------------------------------------------------
*/

// 1. IMPORTANTE: Registramos las rutas de login aquí para que sean públicas
// Esto cargará lo que tienes en auth.php
require __DIR__ . '/auth.php';

// --- RUTAS PÚBLICAS ---
Route::post('/stp/webhook/abono', [StpWebhookController::class, 'recibirAbono'])
    ->withoutMiddleware([\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class]);
Route::get('/branding/{slug}', [App\Http\Controllers\PublicBrandingController::class, 'getBranding']);


// --- RUTAS PROTEGIDAS) ---
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        $user = $request->user()->load(['cliente', 'paymentPlan']);

        return response()->json([
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'cuenta_beneficiario' => $user->paymentPlan->cuenta_beneficiario ?? 'SIN ASIGNAR',
            'cliente'    => $user->cliente,
            'plan'       => $user->paymentPlan
        ]);
    });

    Route::post('/enrolar', [EnrolamientoController::class, 'registrar']);

    // 1. DASHBOARD SUPER ADMIN
    Route::prefix('admin')->group(function () {
        Route::get('/check-inventory', [ClientController::class, 'checkInventory']);
        Route::post('/clients', [ClientController::class, 'store']);
        Route::get('/clients', [ClientController::class, 'index']);
    });

    // 2. DASHBOARD CLIENTE (Empresas B2B)
    Route::prefix('client')->group(function () {
        // Gestión de Perfil
        Route::get('/profile', [ClientController::class, 'getProfile']);
        Route::post('/profile-update', [ClientController::class, 'updateProfile']);
        Route::post('/change-password', [ProfileController::class, 'changePassword']);

        // Pagadores Finales
        Route::post('/validate-pagador', [EndUserController::class, 'validatePagador']);
        Route::post('/end-users', [EndUserController::class, 'store']);
        Route::get('/end-users', [EndUserController::class, 'index']);

        // Pagos y Conciliación
        Route::get('/payments', [EndUserController::class, 'getPayments']);
        Route::get('/stp/abonos/{clabe}', function ($clabe) {
            $abonos = \App\Models\StpAbono::where('cuenta_beneficiario', $clabe)
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json(['status' => 'success', 'data' => $abonos]);
        });

        Route::get('/reporte-conciliacion', [ReporteController::class, 'reporteConciliacion']);
        Route::post('/plan-pago/generar', [PlanPagoController::class, 'generarPlan']);
        Route::get('/plan-pago/resumen/{clabe}', [PlanPagoController::class, 'obtenerResumen']);

        Route::post('/consultar-pago', [PlanPagoController::class, 'obtenerResumen']);
    });

    // 3. ONBOARDING (Validaciones)
    Route::prefix('onboarding')->group(function () {
        Route::post('/liveness', [LivenessController::class, 'store']);
        Route::post('/ine/upload', [IneController::class, 'upload']);
        Route::post('/phone/verify', [PhoneVerificationController::class, 'verify']);
    });

    // 4. APP MÓVIL - CLIENTE FINAL (DenarApp)
    Route::middleware(['auth:sanctum', 'role:cliente_final'])->prefix('my')->group(function () {

        // Dashboard Principal: Saldo, CLABE y Estatus
        Route::get('/dashboard', [UserWalletController::class, 'getDashboard']);

        // Finanzas e Historial (Lo que ya tienes en la tabla stp_abonos)
        Route::get('/payments', [UserWalletController::class, 'getPaymentHistory']);

        // Pasarela de Pagos (Para integrar Stripe/Checkout más tarde)
        // Route::post('/generate-checkout', [UserWalletController::class, 'createCheckoutSession']);

        // Perfil y Onboarding (Reutilizando tus controladores de validación)
        Route::get('/profile', [ProfileController::class, 'getProfile']);
        Route::prefix('verification')->group(function () {
            Route::post('/liveness', [LivenessController::class, 'store']);
            Route::post('/ine', [IneController::class, 'upload']);
        });
    });
});
