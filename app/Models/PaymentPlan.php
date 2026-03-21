<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentPlan extends Model
{
    use HasFactory;

    protected $table = 'payment_plans';

    protected $fillable = [
        'user_id',
        'cuenta_beneficiario',
        'referencia_contrato',

        'credito',
        'plazo_credito_meses',
        'enganche',

        'numero_pago',
        'total_pagos',
        'monto_normal',
        'moratoria',

        'fecha_vencimiento',
        'fecha_limite_habil',

        'estado',
        'monto_pagado_acumulado',
        'fecha_pago_real'
    ];

    protected $casts = [

        'credito'   => 'float',
        'plazo_credito_meses'    => 'integer',
        'enganche'        => 'float',

        'numero_pago'            => 'integer',
        'total_pagos'            => 'integer',
        'monto_normal'           => 'float',


        'fecha_vencimiento'      => 'date',
        'fecha_limite_habil'     => 'date',

        'estado' => 'string',
        'monto_pagado_acumulado' => 'float',
        'fecha_pago_real'        => 'datetime',
    ];

    /**
     * Relación: Un plan de pago pertenece a un usuario.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
