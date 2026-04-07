<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Routes - Denar
|--------------------------------------------------------------------------
*/

// 1. Login (Sin nombre para evitar colisión con Fortify/Laravel)
Route::post('/login', [LoginController::class, 'login']);

// 2. Rutas para invitados (Sin nombres para evitar duplicidad)
Route::middleware('guest')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);

    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store']);

    // Si tu frontend envía el token para resetear:
    Route::post('/reset-password', [NewPasswordController::class, 'store']);
});

// 3. Rutas con Auth (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::post('/auth/update-first-password', [LoginController::class, 'updateFirstPassword']);
});
