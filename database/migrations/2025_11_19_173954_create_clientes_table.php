<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            // Relación con el User de arriba
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // --- IDENTIDAD FISCAL Y COMERCIAL ---
            $table->string('logo_url')->nullable();
            $table->enum('tipo_cliente', ['persona', 'empresa']);
            $table->string('rfc')->unique()->nullable();
            $table->string('nombre_legal')->nullable();
            $table->string('nombre_comercial')->nullable();
            $table->string('allowed_ip')->nullable();

            // --- COMUNICACIÓN Y VALIDACIÓN TELEFÓNICA ---
            $table->string('phone')->nullable();
            $table->string('phone_verification_code')->nullable();
            $table->timestamp('phone_verified_at')->nullable();

            // --- VERIFICACIÓN DE IDENTIDAD (KYC) ---
            $table->boolean('liveness_verified')->default(false);
            $table->string('ine_front_path')->nullable();
            $table->string('ine_back_path')->nullable();
            $table->boolean('ine_verified')->default(false);

            // Datos OCR de la INE
            $table->string('ine_name')->nullable();
            $table->string('ine_curp')->nullable();
            $table->string('ine_clave_elector')->nullable();
            $table->string('ine_vigencia')->nullable();

            // --- DATOS FINANCIEROS Y LOCALIZACIÓN ---
            $table->unsignedInteger('antiguedad_meses')->nullable();
            $table->decimal('ingresos_mensuales', 15, 2)->nullable();
            $table->string('sector')->nullable();

            // --- ESTATUS OPERATIVO ---
            $table->enum('estatus', ['incompleto', 'en_revision', 'aprobado', 'rechazado'])->default('incompleto');
            $table->string('clabe_stp', 18)->unique()->nullable()->index();
            $table->string('clabe_stp_intermedia', 13)->unique()->nullable();
            $table->boolean('usa_cobranza')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
