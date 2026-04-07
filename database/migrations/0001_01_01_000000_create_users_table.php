<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('first_last')->nullable();
            $table->string('second_last')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();

            // --- IDENTIFICACIÓN FISCAL (NUBARIUM) ---
            $table->string('rfc')->nullable()->unique()->index(); // RAZR811011KI1
            $table->string('curp')->nullable()->unique(); // RIZT811011HVZMJB03
            $table->string('cif')->nullable(); // 17070152364
            $table->date('fecha_nacimiento')->nullable();
            $table->string('situacion_contribuyente')->nullable(); // REACTIVADO

            // --- DATOS DE UBICACIÓN SAT ---
            $table->string('cp', 10)->nullable(); // 11460
            $table->string('entidad_federativa')->nullable(); // CIUDAD DE MEXICO
            $table->string('municipio_delegacion')->nullable(); // MIGUEL HIDALGO
            $table->string('colonia')->nullable(); // LOS MANZANOS
            $table->string('calle')->nullable(); // LAGO COMO
            $table->string('num_exterior')->nullable(); // 128
            $table->string('num_interior')->nullable(); // C 502

            // --- ONBOARDING BIOMÉTRICO Y DOCUMENTOS ---
            $table->boolean('liveness_verified')->default(false);
            $table->string('ine_front')->nullable();
            $table->string('ine_back')->nullable();
            $table->boolean('ine_verified')->default(false);
            $table->string('address_selfie')->nullable();
            $table->boolean('address_verified')->default(false);
            $table->enum('onboarding_status', [
                'pending_liveness',
                'pending_ine',
                'pending_address',
                'completed'
            ])->default('pending_liveness');

            $table->string('phone')->nullable();
            $table->string('phone_verification_code')->nullable();
            $table->timestamp('phone_verified_at')->nullable();

            // Roles: admin (tú), cliente (la empresa/persona), cliente_final
            $table->enum('role', ['cliente', 'cliente_final', 'admin'])->default('cliente');

            $table->string('password');
            $table->boolean('must_change_password')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
