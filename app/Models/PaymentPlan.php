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
        'valor_factura',
        'credito',
        'plazo_credito_meses',
        'plazo_remanente_credito',
        'enganche',
        'saldo_restante',
        'monto_normal',
        'monto_normal_final',
        'fecha_vencimiento',
        'fecha_limite_habil',
        'moratoria',
        'estado',
        'monto_pagado_acumulado',
        'pagos_realizados',
        'fecha_pago_real'
    ];

    protected $casts = [
        'user_id'                 => 'integer',
        'valor_factura'           => 'float',
        'credito'                 => 'float',
        'plazo_credito_meses'     => 'integer',
        'plazo_remanente_credito' => 'integer',
        'enganche'                => 'float',
        'saldo_restante'          => 'float',
        'monto_normal'            => 'float',
        'monto_normal_final'      => 'float',
        'moratoria'               => 'float',
        'monto_pagado_acumulado'  => 'float',
        'pagos_realizados'        => 'integer',
        'fecha_vencimiento'       => 'date',
        'fecha_limite_habil'      => 'date',
        'fecha_pago_real'         => 'datetime',
        'estado'                  => 'string',
    ];

    /**
     * Relación: Un plan de pago pertenece a un usuario (EndUser/Cliente).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
