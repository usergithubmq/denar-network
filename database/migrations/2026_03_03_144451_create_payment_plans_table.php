<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_plans', function (Blueprint $table) {
            $table->id();

            // Relaciones y Seguimiento
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('cuenta_beneficiario');
            $table->string('referencia_contrato')->nullable();

            // Datos de Originación
            $table->decimal('credito', 15, 2)->nullable();
            $table->integer('plazo_credito_meses')->nullable();
            $table->decimal('enganche', 15, 2)->default(0);

            // Datos de la Mensualidad
            $table->integer('numero_pago')->nullable();
            $table->integer('total_pagos')->nullable();
            $table->decimal('monto_normal', 15, 2)->nullable();
            $table->decimal('moratoria', 15, 2)->nullable();

            // Fechas
            $table->date('fecha_vencimiento')->nullable();
            $table->date('fecha_limite_habil')->nullable();

            // Estado y Control de Pagos
            // ANTES TENÍA UN PUNTO (.), AHORA LA FLECHA (->) CORRECTA:
            $table->enum('estado', ['pendiente', 'pagado', 'atrasado', 'parcial'])->default('pendiente');

            $table->decimal('monto_pagado_acumulado', 15, 2)->default(0);
            $table->timestamp('fecha_pago_real')->nullable();

            $table->timestamps();

            $table->index('cuenta_beneficiario');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_plans');
    }
};
