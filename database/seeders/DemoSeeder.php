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

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        \ = Rw::firstOrCreate(['nama' => 'RW 01']);
        \ = Rt::firstOrCreate(['rw_id' => \->id, 'nama' => 'RT 01']);
        \ = Rt::firstOrCreate(['rw_id' => \->id, 'nama' => 'RT 02']);

        \ = User::firstOrCreate(['username' => 'petugas_demo'], [
            'nama' => 'Petugas Demo (RT 01)',
            'password' => Hash::make('password123'),
            'role' => 'petugas',
            'is_active' => true
        ]);
        UserWilayah::firstOrCreate(['user_id' => \->id, 'rt_id' => \->id]);

        \ = Kandidat::firstOrCreate(['rw_id' => \->id, 'nomor_urut' => 1, 'jenis' => 'RW'], ['nama' => 'Bapak Budi Santoso', 'visi_misi' => 'RW Aman, Tentram, dan Maju bersama warga.']);
        \ = Kandidat::firstOrCreate(['rw_id' => \->id, 'nomor_urut' => 2, 'jenis' => 'RW'], ['nama' => 'Ibu Siti Aminah', 'visi_misi' => 'RW Bersih, Hijau, dan Sejahtera.']);

        \ = Kandidat::firstOrCreate(['rt_id' => \->id, 'nomor_urut' => 1, 'jenis' => 'RT'], ['nama' => 'Agus Yudhoyono', 'visi_misi' => 'Jalanan RT mulus tanpa lubang.']);
        \ = Kandidat::firstOrCreate(['rt_id' => \->id, 'nomor_urut' => 2, 'jenis' => 'RT'], ['nama' => 'Faisal Basri', 'visi_misi' => 'Keamanan RT 24 Jam Nonstop.']);

        \ = ['Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gita', 'Hadi', 'Iwan', 'Joko', 'Kiki', 'Lestari', 'Mira', 'Nina', 'Oki', 'Putri', 'Qori', 'Rina', 'Siti', 'Tono'];
        for (\ = 1; \ <= 20; \++) {
            \ = '740114' . str_pad(\, 10, '0', STR_PAD_LEFT);
            Warga::firstOrCreate(['nik' => \], [
                'rt_id' => \->id,
                'nama' => \[\-1] . ' Wundulako',
                'alamat' => 'Jl. Wundulako Blok A No. ' . \,
                'status_vote_rt' => 'belum_dikunjungi',
                'status_vote_rw' => 'belum_dikunjungi',
                'jenis_pemilih' => 'dpt'
            ]);
        }

        \ = ['Umar', 'Vina', 'Wawan', 'Xaverius', 'Yani', 'Zainal', 'Rizky', 'Fajar', 'Dian', 'Tuti'];
        for (\ = 21; \ <= 30; \++) {
            \ = '740114' . str_pad(\, 10, '0', STR_PAD_LEFT);
            Warga::firstOrCreate(['nik' => \], [
                'rt_id' => \->id,
                'nama' => \[\-21] . ' Wundulako',
                'alamat' => 'Jl. Wundulako Blok B No. ' . \,
                'status_vote_rt' => 'belum_dikunjungi',
                'status_vote_rw' => 'belum_dikunjungi',
                'jenis_pemilih' => 'dpt'
            ]);
        }

        \ = Warga::where('rt_id', \->id)->where('status_vote_rt', 'belum_dikunjungi')->take(8)->get();
        foreach (\ as \ => \) {
            \ = \ % 2 == 0 ? \ : \;
            Vote::create([
                'warga_id' => \->id,
                'kandidat_id' => \->id,
                'user_id' => \->id,
                'jenis' => 'RW',
                'status' => 'valid'
            ]);
            \->status_vote_rw = 'sudah_memilih';
            
            \ = \ % 3 == 0 ? \ : \;
            Vote::create([
                'warga_id' => \->id,
                'kandidat_id' => \->id,
                'user_id' => \->id,
                'jenis' => 'RT',
                'status' => 'valid'
            ]);
            \->status_vote_rt = 'sudah_memilih';
            
            \->jumlah_kunjungan = 1;
            \->save();
        }
    }
}
