<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tipo_cliente',
        'logo_url',
        'rfc',
        'nombre_legal',
        'nombre_comercial',
        'allowed_ip',

        'phone',
        'phone_verification_code',
        'phone_verified_at',

        'liveness_verified',
        'ine_front_path',
        'ine_back_path',
        'ine_verified',

        'ine_name',
        'ine_curp',
        'ine_clave_elector',
        'ine_vigencia',

        'antiguedad_meses',
        'ingresos_mensuales',
        'sector',

        'clabe_stp',
        'clabe_stp_intermedia',
        'usa_cobranza',
        'estatus',
    ];

    protected $casts = [
        'liveness_verified' => 'boolean',
        'ine_verified' => 'boolean',
        'phone_verified_at' => 'datetime',
        'ingresos_mensuales' => 'decimal:2',
    ];

    /* ====================
       RELACIONES
       ==================== */

    /**
     * El perfil de cliente pertenece a un Usuario único.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * El Cliente (empresa) tiene muchos EndUsers (pagadores/cobranza).
     */
    public function endUsers()
    {
        return $this->hasMany(EndUser::class);
    }
}
