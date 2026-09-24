<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VotingConfig extends Model
{
    protected $table = 'voting_configs';

    protected $fillable = [
        'voting_aktif_global',
        'tampilkan_live_count',
        'updated_by'
    ];

    protected $casts = [
        'voting_aktif_global' => 'boolean',
        'tampilkan_live_count' => 'boolean'
    ];

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
