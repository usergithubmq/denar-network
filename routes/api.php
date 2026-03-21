<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controladores
use App\Http\Controllers\Api\EnrolamientoController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\PhoneVerificationController;
use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Cliente\EndUserController;
use App\Http\Controllers\Cliente\PlanPagoController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\Onboarding\LivenessController;
use App\Http\Controllers\Onboarding\IneController;
use App\Http\Controllers\Stp\StpWebhookController;

/*
|--------------------------------------------------------------------------
| API Routes - KoonSystem B2B
|--------------------------------------------------------------------------
*/

// Webhook externo (Sin Auth)
Route::post('/stp/webhook/abono', [StpWebhookController::class, 'recibirAbono']);

// Autenticación
Route::post('/login', [LoginController::class, 'login']);
Route::post('/register', [RegisterController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/enrolar', [EnrolamientoController::class, 'registrar']);

    // 1. DASHBOARD SUPER ADMIN
    Route::prefix('admin')->group(function () {
        Route::post('/clients', [ClientController::class, 'store']);
        Route::get('/clients', [ClientController::class, 'index']);
    });

    // 2. DASHBOARD CLIENTE (Empresas B2B)
    Route::prefix('client')->group(function () {
        // Gestión de Perfil
        Route::get('/profile', [ClientController::class, 'getProfile']);
        Route::post('/profile-update', [ClientController::class, 'updateProfile']);

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

    Route::get('/user', function (Request $request) {
        return $request->user()->load(['cliente']);
    });

    Route::post('/logout', [LoginController::class, 'logout']);
});
