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
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); //ok
            $table->string('cuenta_beneficiario'); //ok
            $table->string('referencia_contrato')->nullable(); //ok

            // Datos de Originación
            $table->decimal('valor_factura', 15, 2)->nullable(); //ok
            $table->decimal('credito', 15, 2)->nullable(); //ok
            $table->integer('plazo_credito_meses')->nullable(); //ok
            $table->integer('plazo_remanente_credito')->nullable(); //ok

            $table->decimal('enganche', 15, 2)->default(0); //ok

            $table->decimal('saldo_restante', 15, 2)->default(0); //ok

            // Datos de la Mensualidad
            $table->boolean('monto_libre')->default(false);
            $table->decimal('monto_normal', 15, 2)->nullable(); //ok
            $table->decimal('monto_normal_final', 15, 2)->nullable(); //ok


            // Fechas
            $table->date('fecha_vencimiento')->nullable();
            $table->date('fecha_limite_habil')->nullable();

            $table->decimal('moratoria', 15, 2)->default(0); //ok
            $table->string('tipo_moratoria')->default('fijo');

            // Estado y Control de Pagos
            // ANTES TENÍA UN PUNTO (.), AHORA LA FLECHA (->) CORRECTA:
            $table->enum('estado', ['pendiente', 'pagado', 'atrasado', 'parcial'])->default('pendiente');

            $table->decimal('monto_pagado_acumulado', 15, 2)->default(0);
            $table->dateTime('fecha_pago_real')->nullable();
            $table->integer('pagos_realizados')->default(0); //ok


            $table->timestamps();

            $table->index('cuenta_beneficiario'); // Para que el Dispatcher vuele al buscar la CLABE
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_plans');
    }
};
