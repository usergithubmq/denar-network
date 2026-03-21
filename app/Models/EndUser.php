<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class EndUser extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cliente_id',
        'user_id',
        'referencia_interna',
        'clabe_stp',
        'is_active',
    ];

    /* ====================
       RELACIONES
       ==================== */

    /**
     * El pagador pertenece a un Cliente específico.
     */
    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    /**
     * El pagador está vinculado a un usuario de autenticación.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
