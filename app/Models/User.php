<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'first_last',
        'second_last',
        'email',
        'rfc',
        'curp',
        'cif',
        'fecha_nacimiento',
        'situacion_contribuyente',
        'cp',
        'entidad_federativa',
        'municipio_delegacion',
        'colonia',
        'calle',
        'num_exterior',
        'num_interior',
        'liveness_verified',
        'ine_front',
        'ine_back',
        'ine_verified',
        'address_selfie',
        'address_verified',
        'onboarding_status',
        'phone',
        'phone_verification_code',
        'phone_verified_at',
        'role',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'phone_verification_code',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'fecha_nacimiento'  => 'date',
            'password' => 'hashed',
        ];
    }

    /* ====================
       RELACIONES
       ==================== */

    /**
     * Un Usuario (con rol cliente) tiene un perfil de Cliente.
     */
    public function cliente()
    {
        // Esta es para que el Dashboard sepa a qué empresa pertenece el usuario logueado
        return $this->hasOne(\App\Models\Cliente::class, 'user_id', 'id');
    }

    public function endUser()
    {
        // Un User (con rol cliente_final) tiene un registro en la tabla end_users
        return $this->hasOne(EndUser::class, 'user_id');
    }

    /**
     * Un usuario (pagador) tiene un plan de pago.
     */
    public function paymentPlan()
    {
        return $this->hasOne(PaymentPlan::class, 'user_id', 'id');
    }
}
