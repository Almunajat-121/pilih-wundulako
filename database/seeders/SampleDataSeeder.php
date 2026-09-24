<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rt;
use App\Models\Kandidat;
use App\Models\Warga;
use Faker\Factory as Faker;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $rts = Rt::with('rw')->get();

        foreach ($rts as $rt) {
            // Buat 2 Kandidat RT untuk tiap RT
            Kandidat::create([
                'nama' => 'Bapak ' . $faker->lastName(),
                'nomor_urut' => 1,
                'jenis' => 'RT',
                'rt_id' => $rt->id,
            ]);
            Kandidat::create([
                'nama' => 'Ibu ' . $faker->lastName(),
                'nomor_urut' => 2,
                'jenis' => 'RT',
                'rt_id' => $rt->id,
            ]);

            // Buat 10 Warga per RT
            for ($i = 0; $i < 10; $i++) {
                Warga::create([
                    'nama' => $faker->name(),
                    'alamat' => $faker->streetAddress(),
                    'rt_id' => $rt->id,
                    'status_vote_rt' => 'belum_dikunjungi',
                    'status_vote_rw' => 'belum_dikunjungi',
                ]);
            }
        }

        // Buat 2 Kandidat RW untuk tiap RW
        $rws = $rts->pluck('rw')->unique('id');
        foreach ($rws as $rw) {
            Kandidat::create([
                'nama' => 'Haji ' . $faker->lastName(),
                'nomor_urut' => 1,
                'jenis' => 'RW',
                'rw_id' => $rw->id,
            ]);
            Kandidat::create([
                'nama' => 'Bapak ' . $faker->lastName(),
                'nomor_urut' => 2,
                'jenis' => 'RW',
                'rw_id' => $rw->id,
            ]);
        }
    }
}
