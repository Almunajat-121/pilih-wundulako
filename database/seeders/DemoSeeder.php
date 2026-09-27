<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rw;
use App\Models\Rt;
use App\Models\User;
use App\Models\Warga;
use App\Models\Kandidat;
use App\Models\Vote;
use App\Models\UserWilayah;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Cari RW 01 dan RT 01
        $rw = Rw::firstOrCreate(['nama' => 'RW 01']);
        $rt = Rt::firstOrCreate(['rw_id' => $rw->id, 'nama' => 'RT 01']);
        $rt2 = Rt::firstOrCreate(['rw_id' => $rw->id, 'nama' => 'RT 02']);

        // 1. Buat Petugas Demo
        $petugas = User::firstOrCreate(['username' => 'petugas_demo'], [
            'nama' => 'Petugas Demo (RT 01)',
            'password' => Hash::make('password123'),
            'role' => 'petugas',
            'is_active' => true
        ]);
        UserWilayah::firstOrCreate(['user_id' => $petugas->id, 'rt_id' => $rt->id]);

        // 2. Buat Kandidat RW 01
        $kanRw1 = Kandidat::firstOrCreate(['rw_id' => $rw->id, 'nomor_urut' => 1, 'jenis' => 'RW'], ['nama' => 'Bapak Budi Santoso', 'visi_misi' => 'RW Aman, Tentram, dan Maju bersama warga.']);
        $kanRw2 = Kandidat::firstOrCreate(['rw_id' => $rw->id, 'nomor_urut' => 2, 'jenis' => 'RW'], ['nama' => 'Ibu Siti Aminah', 'visi_misi' => 'RW Bersih, Hijau, dan Sejahtera.']);

        // 3. Buat Kandidat RT 01
        $kanRt1 = Kandidat::firstOrCreate(['rt_id' => $rt->id, 'nomor_urut' => 1, 'jenis' => 'RT'], ['nama' => 'Agus Yudhoyono', 'visi_misi' => 'Jalanan RT mulus tanpa lubang.']);
        $kanRt2 = Kandidat::firstOrCreate(['rt_id' => $rt->id, 'nomor_urut' => 2, 'jenis' => 'RT'], ['nama' => 'Faisal Basri', 'visi_misi' => 'Keamanan RT 24 Jam Nonstop.']);

        // 4. Buat Warga untuk RT 01 (20 Warga)
        $faker = Faker::create('id_ID');
        for ($i = 1; $i <= 20; $i++) {
            $nik = '740114' . str_pad($i, 10, '0', STR_PAD_LEFT);
            Warga::firstOrCreate(['nik' => $nik], [
                'rt_id' => $rt->id,
                'nama' => $faker->name,
                'alamat' => 'Jl. Wundulako Blok A No. ' . $i,
                'status_vote_rt' => 'belum_dikunjungi',
                'status_vote_rw' => 'belum_dikunjungi',
                'jenis_pemilih' => 'dpt'
            ]);
        }

        // 5. Buat Warga untuk RT 02 (10 Warga)
        for ($i = 21; $i <= 30; $i++) {
            $nik = '740114' . str_pad($i, 10, '0', STR_PAD_LEFT);
            Warga::firstOrCreate(['nik' => $nik], [
                'rt_id' => $rt2->id,
                'nama' => $faker->name,
                'alamat' => 'Jl. Wundulako Blok B No. ' . $i,
                'status_vote_rt' => 'belum_dikunjungi',
                'status_vote_rw' => 'belum_dikunjungi',
                'jenis_pemilih' => 'dpt'
            ]);
        }

        // 6. Simulasikan bbrp Warga (8 orang) sudah divote untuk memunculkan chart di Live Count / Dashboard
        $wargas = Warga::where('rt_id', $rt->id)->where('status_vote_rt', 'belum_dikunjungi')->take(8)->get();
        foreach ($wargas as $index => $warga) {
            // Vote RW
            $kRw = $index % 2 == 0 ? $kanRw1 : $kanRw2;
            Vote::create([
                'warga_id' => $warga->id,
                'kandidat_id' => $kRw->id,
                'user_id' => $petugas->id,
                'jenis' => 'RW',
                'status' => 'valid'
            ]);
            $warga->status_vote_rw = 'sudah_memilih';
            
            // Vote RT
            $kRt = $index % 3 == 0 ? $kanRt1 : $kanRt2;
            Vote::create([
                'warga_id' => $warga->id,
                'kandidat_id' => $kRt->id,
                'user_id' => $petugas->id,
                'jenis' => 'RT',
                'status' => 'valid'
            ]);
            $warga->status_vote_rt = 'sudah_memilih';
            
            $warga->jumlah_kunjungan = 1;
            $warga->save();
        }
    }
}
