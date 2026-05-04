<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StpAbono extends Model
{
    protected $table = 'stp_abonos';

    // Permitimos que todos estos campos se llenen automáticamente desde el request de STP
    protected $fillable = [
        'stp_id',

        'fecha_operacion',
        'institucion_ordenante',
        'institucion_beneficiaria',
        'clave_rastreo',
        'monto',

        'nombre_ordenante',
        'tipo_cuenta_ordenante',
        'cuenta_ordenante',
        'rfc_curp_ordenante',

        'nombre_beneficiario',
        'tipo_cuenta_beneficiario',
        'cuenta_beneficiario',
        'rfc_curp_beneficiario',

        'nombre_beneficiario2',
        'tipo_cuenta_beneficiario2',
        'cuenta_beneficiario2',

        'concepto_pago',
        'referencia_numerica',
        'empresa',
        'tipo_pago',
        'ts_liquidacion',
        'folio_codi',

        'metodo_pago',
        'cliente_id',
        'comision_denar'
    ];

    public function cliente()
    {
        return $this->belongsTo(\App\Models\User::class, 'cliente_id');
    }
}
