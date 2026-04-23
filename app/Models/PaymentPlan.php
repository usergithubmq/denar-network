<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

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
        'monto_libre',
        'monto_normal',
        'monto_normal_final',
        'fecha_vencimiento',
        'fecha_limite_habil',
        'moratoria',
        'tipo_moratoria',
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
        'monto_libre'             => 'boolean',
        'monto_normal'            => 'float',
        'monto_normal_final'      => 'float',
        'moratoria'               => 'float',
        'tipo_moratoria'          => 'string',
        'monto_pagado_acumulado'  => 'float',
        'pagos_realizados'        => 'integer',
        'fecha_vencimiento'       => 'date',
        'fecha_limite_habil'      => 'date',
        'fecha_pago_real'         => 'datetime',
        'estado'                  => 'string',
    ];

    protected $appends = ['saldo_total_a_pagar', 'es_pago_libre'];

    /**
     * Lógica de Cobro:
     * - Si es monto_libre: El usuario puede pagar lo que quiera (hasta 20k).
     * - Si no: Se usa monto_normal_final.
     * - Si venció la fecha límite: Se suma moratoria al monto_normal_final.
     */
    public function getSaldoTotalAPagarAttribute()
    {
        // 1. Si es monto libre, no hay un "total" fijo de deuda, devolvemos el límite sugerido
        if ($this->monto_libre) {
            return 20000.00;
        }

        $hoy = Carbon::now()->startOfDay();
        $limiteHabil = $this->fecha_limite_habil ? Carbon::parse($this->fecha_limite_habil)->startOfDay() : null;

        // 2. El monto base SIEMPRE será el final (redondeado por tu cliente)
        $montoBase = $this->monto_normal_final > 0 ? $this->monto_normal_final : $this->monto_normal;

        // 3. Si ya pasó la fecha límite, sumamos la moratoria al redondeado
        if ($limiteHabil && $hoy->greaterThan($limiteHabil)) {
            return (float) ($montoBase + $this->moratoria);
        }

        return (float) $montoBase;
    }

    /**
     * Ayuda al frontend a saber si debe mostrar un input abierto o un monto fijo
     */
    public function getEsPagoLibreAttribute()
    {
        return $this->monto_libre;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
