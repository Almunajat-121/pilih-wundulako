<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatusLog extends Model
{
    protected $table = 'status_logs';

    const UPDATED_AT = null;

    protected $fillable = [
        'warga_id',
        'jenis',
        'status_lama',
        'status_baru',
        'aktor_id',
        'alasan'
    ];

    public function warga(): BelongsTo
    {
        return $this->belongsTo(Warga::class);
    }

    public function aktor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'aktor_id');
    }
}
