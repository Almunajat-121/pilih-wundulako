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
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $rw = Rw::firstOrCreate(['nama' => 'RW 01']);
        $rt = Rt::firstOrCreate(['rw_id' => $rw->id, 'nama' => 'RT 01']);
        $rt2 = Rt::firstOrCreate(['rw_id' => $rw->id, 'nama' => 'RT 02']);

        $petugas = User::firstOrCreate(['username' => 'petugas_demo'], [
            'nama' => 'Petugas Demo (RT 01)',
            'password' => Hash::make('password123'),
            'role' => 'petugas',
            'is_active' => true
        ]);
        UserWilayah::firstOrCreate(['user_id' => $petugas->id, 'rt_id' => $rt->id]);

        $kanRw1 = Kandidat::firstOrCreate(['rw_id' => $rw->id, 'nomor_urut' => 1, 'jenis' => 'RW'], ['nama' => 'Bapak Budi Santoso', 'visi_misi' => 'RW Aman, Tentram, dan Maju bersama warga.']);
        $kanRw2 = Kandidat::firstOrCreate(['rw_id' => $rw->id, 'nomor_urut' => 2, 'jenis' => 'RW'], ['nama' => 'Ibu Siti Aminah', 'visi_misi' => 'RW Bersih, Hijau, dan Sejahtera.']);

        $kanRt1 = Kandidat::firstOrCreate(['rt_id' => $rt->id, 'nomor_urut' => 1, 'jenis' => 'RT'], ['nama' => 'Agus Yudhoyono', 'visi_misi' => 'Jalanan RT mulus tanpa lubang.']);
        $kanRt2 = Kandidat::firstOrCreate(['rt_id' => $rt->id, 'nomor_urut' => 2, 'jenis' => 'RT'], ['nama' => 'Faisal Basri', 'visi_misi' => 'Keamanan RT 24 Jam Nonstop.']);

        $names = ['Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gita', 'Hadi', 'Iwan', 'Joko', 'Kiki', 'Lestari', 'Mira', 'Nina', 'Oki', 'Putri', 'Qori', 'Rina', 'Siti', 'Tono'];
        for ($i = 1; $i <= 20; $i++) {
            Warga::firstOrCreate(['nama' => $names[$i-1] . ' Wundulako', 'rt_id' => $rt->id], [
                'alamat' => 'Jl. Wundulako Blok A No. ' . $i,
                'status_vote_rt' => 'belum_dikunjungi',
                'status_vote_rw' => 'belum_dikunjungi',
            ]);
        }

        $names2 = ['Umar', 'Vina', 'Wawan', 'Xaverius', 'Yani', 'Zainal', 'Rizky', 'Fajar', 'Dian', 'Tuti'];
        for ($i = 21; $i <= 30; $i++) {
            Warga::firstOrCreate(['nama' => $names2[$i-21] . ' Wundulako', 'rt_id' => $rt2->id], [
                'alamat' => 'Jl. Wundulako Blok B No. ' . $i,
                'status_vote_rt' => 'belum_dikunjungi',
                'status_vote_rw' => 'belum_dikunjungi',
            ]);
        }

        $wargas = Warga::where('rt_id', $rt->id)->where('status_vote_rt', 'belum_dikunjungi')->take(8)->get();
        foreach ($wargas as $index => $warga) {
            $kRw = $index % 2 == 0 ? $kanRw1 : $kanRw2;
            Vote::create([
                'warga_id' => $warga->id,
                'kandidat_id' => $kRw->id,
                'petugas_id' => $petugas->id,
                'jenis' => 'RW',
                'status' => 'valid',
                'idempotency_key' => Str::random(32)
            ]);
            $warga->status_vote_rw = 'sudah_memilih';
            
            $kRt = $index % 3 == 0 ? $kanRt1 : $kanRt2;
            Vote::create([
                'warga_id' => $warga->id,
                'kandidat_id' => $kRt->id,
                'petugas_id' => $petugas->id,
                'jenis' => 'RT',
                'status' => 'valid',
                'idempotency_key' => Str::random(32)
            ]);
            $warga->status_vote_rt = 'sudah_memilih';
            
            $warga->jumlah_kunjungan = 1;
            $warga->save();
        }
    }
}
