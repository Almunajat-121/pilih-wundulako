<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rw extends Model
{
    protected $table = 'rw';
    
    protected $fillable = ['nama'];

    public function rts(): HasMany
    {
        return $this->hasMany(Rt::class);
    }

    public function kandidats(): HasMany
    {
        return $this->hasMany(Kandidat::class, 'rw_id');
    }
}
