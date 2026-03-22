<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth Routes - KoonSystem
|--------------------------------------------------------------------------
*/

// 1. Login SIN middleware 'guest' para evitar el Redireccionamiento (302)
Route::post('/login', [LoginController::class, 'login'])->name('login');

// 2. Rutas para invitados reales (Registro y Recuperación)
Route::middleware('guest')->group(function () {
    Route::post('/register', [RegisterController::class, 'register'])
        ->name('register');

    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::post('/reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

// 3. Rutas que requieren estar logueado (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])
        ->name('logout');
});
