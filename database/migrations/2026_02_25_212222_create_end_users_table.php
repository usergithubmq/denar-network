<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('end_users', function (Blueprint $table) {
            $table->id();
            // El Cliente (dueño del SaaS de cobranza) es el dueño de este registro
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Motor STP
            $table->string('clabe_stp', 18)->unique()->index();
            $table->string('referencia_interna')->nullable(); // Ej: Contrato #

            // Estado operativo
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes(); // Para no perder historial de cobranza
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('end_users');
    }
};
