<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stp_abonos', function (Blueprint $table) {
            $table->id();

            // Identificador único de STP (Capa 1 contra duplicados)
            $table->unsignedBigInteger('stp_id')->unique();

            // Datos de la Operación
            $table->integer('fecha_operacion'); // AAAAMMDD
            $table->integer('institucion_ordenante');
            $table->integer('institucion_beneficiaria');
            $table->string('clave_rastreo', 30);
            $table->decimal('monto', 15, 2);

            // Datos del Ordenante (Quien envía el dinero)
            $table->string('nombre_ordenante', 120)->nullable();
            $table->integer('tipo_cuenta_ordenante')->nullable();
            $table->string('cuenta_ordenante', 20)->nullable();
            $table->string('rfc_curp_ordenante', 18)->nullable();

            // Datos del Beneficiario (Tu cliente/Centro de costos)
            $table->string('nombre_beneficiario', 100);
            $table->integer('tipo_cuenta_beneficiario');
            $table->string('cuenta_beneficiario', 20);
            $table->string('rfc_curp_beneficiario', 18);

            // Datos secundarios / CODI
            $table->string('nombre_beneficiario2', 100)->nullable();
            $table->integer('tipo_cuenta_beneficiario2')->nullable();
            $table->string('cuenta_beneficiario2', 20)->nullable();

            // Referencias y Metadatos de STP
            $table->string('concepto_pago', 40);
            $table->integer('referencia_numerica');
            $table->string('empresa', 20);
            $table->integer('tipo_pago')->default(1);
            $table->string('ts_liquidacion', 25);
            $table->string('folio_codi', 40)->nullable();

            $table->string('metodo_pago')->default('STP'); // STP o EFECTIVO
            $table->foreignId('cliente_id')->nullable()->constrained('users'); // La empresa dueña del dinero
            $table->decimal('comision_denar', 10, 2)->default(0); // Tu ganancia por esa transa

            $table->timestamps();

            // --- SECCIÓN DE ÍNDICES (El motor de búsqueda de Denar) ---

            $table->index('cuenta_beneficiario');
            $table->index('fecha_operacion');
            $table->index(['fecha_operacion', 'clave_rastreo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stp_abonos');
    }
};
