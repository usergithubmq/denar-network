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
        'role',
        'password',
        'phone',
        'phone_verification_code',
        'phone_verified_at',
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

    /**
     * Un usuario (pagador) tiene un plan de pago.
     */
    public function paymentPlan()
    {
        return $this->hasOne(PaymentPlan::class, 'user_id', 'id');
    }
}
