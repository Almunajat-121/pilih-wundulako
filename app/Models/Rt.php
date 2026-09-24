<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rt extends Model
{
    protected $table = 'rt';

    protected $fillable = [
        'rw_id',
        'nama',
        'voting_aktif'
    ];

    protected $casts = [
        'voting_aktif' => 'boolean'
    ];

    public function rw(): BelongsTo
    {
        return $this->belongsTo(Rw::class);
    }

    public function wargas(): HasMany
    {
        return $this->hasMany(Warga::class);
    }

    public function kandidats(): HasMany
    {
        return $this->hasMany(Kandidat::class, 'rt_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_wilayah', 'rt_id', 'user_id')->withTimestamps();
    }
}
