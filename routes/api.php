<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controladores
use App\Http\Controllers\Api\EnrolamientoController;
use App\Http\Controllers\Api\UserWalletController;

use App\Http\Controllers\Auth\PhoneVerificationController;
use App\Http\Controllers\Auth\LoginController;

use App\Http\Controllers\Admin\ClientController;

use App\Http\Controllers\Cliente\ProfileController;
use App\Http\Controllers\Cliente\EndUserController;
use App\Http\Controllers\Cliente\PlanPagoController;

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
        Route::get('/stp-logs', function (Illuminate\Http\Request $request) {
            // Cargamos la relación 'cliente' (asegúrate de tenerla en el modelo StpAbono)
            $query = \App\Models\StpAbono::with('cliente');

            // 1. Filtro por búsqueda (Rastreo, Ordenante, Concepto)
            if ($request->filled('search')) {
                $s = $request->search;
                $query->where(function ($q) use ($s) {
                    $q->where('clave_rastreo', 'LIKE', "%$s%")
                        ->orWhere('nombre_ordenante', 'LIKE', "%$s%")
                        ->orWhere('concepto_pago', 'LIKE', "%$s%");
                });
            }

            // 2. Filtro por Empresa específica (Para tus cortes de caja mensuales)
            if ($request->filled('cliente_id')) {
                $query->where('cliente_id', $request->cliente_id);
            }

            // 3. Filtro por Método (Para separar Efectivo de Transferencias)
            if ($request->filled('metodo')) {
                $query->where('metodo_pago', $request->metodo);
            }

            // Retornamos los últimos 100 con la data de la empresa incluida
            return $query->orderBy('created_at', 'desc')->take(100)->get();
        });

        Route::get('/dashboard-stats', function () {
            return response()->json([
                'clientes'        => \App\Models\User::where('role', 'cliente')->count(), // O tu lógica de clientes
                'usuarios_activos' => \App\Models\User::count(),
                'ingreso_mensual'  => \App\Models\StpAbono::whereMonth('created_at', now()->month)->sum('monto'),
                'ingreso_total'    => \App\Models\StpAbono::sum('monto'),
                'saldo_actual'     => \App\Models\StpAbono::sum('monto'), // Ajusta según tu lógica de egresos
            ]);
        });
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
        Route::put('/plan-pago/actualizar/{id}', [PlanPagoController::class, 'update']);
        Route::post('/consultar-pago', [PlanPagoController::class, 'obtenerResumen']);
    });

    // 3. ONBOARDING (Validaciones)
    Route::prefix('onboarding')->group(function () {
        Route::post('/liveness', [LivenessController::class, 'store']);
        Route::post('/ine/upload', [IneController::class, 'upload']);
        Route::post('/phone/verify', [PhoneVerificationController::class, 'verify']);
    });

    // 4. APP MÓVIL - CLIENTE FINAL (DenarApp)
    Route::middleware(['auth:sanctum'])->prefix('my')->group(function () {
        // Dashboard Principal: Saldo, CLABE y Estatus
        Route::get('/dashboard', [UserWalletController::class, 'getDashboard']);

        // Finanzas e Historial (Lo que ya tienes en la tabla stp_abonos)
        Route::get('/payments', [UserWalletController::class, 'getPaymentHistory']);
        Route::post('/payment/cash-reference', [StpWebhookController::class, 'generarReferenciaEfectivo']);
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
