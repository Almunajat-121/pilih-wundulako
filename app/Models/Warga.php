<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warga extends Model
{
    protected $table = 'warga';

    protected $fillable = [
        'nama',
        'alamat',
        'rt_id',
        'tanggal_lahir',
        'status_vote_rt',
        'status_vote_rw',
        'jumlah_kunjungan',
        'foto_ktp_path',
        'dibuat_oleh'
    ];

    protected $casts = [
        'tanggal_lahir' => 'date'
    ];

    public function rt(): BelongsTo
    {
        return $this->belongsTo(Rt::class);
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(StatusLog::class);
    }
}
