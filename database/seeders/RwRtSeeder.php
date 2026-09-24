<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rw;
use App\Models\Rt;

class RwRtSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 4; $i++) {
            $rw = Rw::create([
                'nama' => 'RW 0' . $i
            ]);

            for ($j = 1; $j <= 4; $j++) {
                Rt::create([
                    'rw_id' => $rw->id,
                    'nama' => 'RT 0' . $j
                ]);
            }
        }
    }
}
