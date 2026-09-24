<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Warga;
use App\Models\Kandidat;
use App\Models\Rw;
use App\Models\Rt;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $total_warga = Warga::count();
        $sudah_memilih_rt = Warga::where('status_vote_rt', 'sudah_memilih')->count();
        $sudah_memilih_rw = Warga::where('status_vote_rw', 'sudah_memilih')->count();
        $belum_dikunjungi = Warga::where('status_vote_rt', 'belum_dikunjungi')->where('status_vote_rw', 'belum_dikunjungi')->count();
        $tidak_ditemukan = Warga::where('status_vote_rt', 'tidak_ditemukan')->count();
        $menolak = Warga::where('status_vote_rt', 'menolak')->count();

        $stats = [
            'total_warga' => $total_warga,
            'sudah_memilih_rt' => $sudah_memilih_rt,
            'sudah_memilih_rw' => $sudah_memilih_rw,
            'belum_dikunjungi' => $belum_dikunjungi,
            'tidak_ditemukan' => $tidak_ditemukan,
            'menolak' => $menolak,
        ];

        // Progres per RW
        $progres_per_rw = [];
        $rws = Rw::with('rts.wargas')->get();
        foreach ($rws as $rw) {
            $total = 0;
            $sudah_rt = 0;
            $sudah_rw = 0;
            
            foreach ($rw->rts as $rt) {
                $total += $rt->wargas->count();
                $sudah_rt += $rt->wargas->where('status_vote_rt', 'sudah_memilih')->count();
                $sudah_rw += $rt->wargas->where('status_vote_rw', 'sudah_memilih')->count();
            }
            
            $progres_per_rw[] = [
                'rw_nama' => 'RW ' . $rw->nama,
                'total' => $total,
                'sudah_rt' => $sudah_rt,
                'sudah_rw' => $sudah_rw,
                'persen_rt' => $total > 0 ? ($sudah_rt / $total) * 100 : 0,
                'persen_rw' => $total > 0 ? ($sudah_rw / $total) * 100 : 0,
            ];
        }

        // Kandidat RT & RW
        $kandidat_rt = Kandidat::where('jenis', 'RT')->with('rt')->get()->map(function($k) use ($total_warga) {
            $suara = $k->votes()->where('status', 'valid')->count();
            return [
                'id' => $k->id,
                'nama' => $k->nama,
                'rt' => $k->rt,
                'jumlah_suara' => $suara,
                'persentase' => $total_warga > 0 ? ($suara / $total_warga) * 100 : 0
            ];
        });
        
        $kandidat_rw = Kandidat::where('jenis', 'RW')->with('rw')->get()->map(function($k) use ($total_warga) {
            $suara = $k->votes()->where('status', 'valid')->count();
            return [
                'id' => $k->id,
                'nama' => $k->nama,
                'rw' => $k->rw,
                'jumlah_suara' => $suara,
                'persentase' => $total_warga > 0 ? ($suara / $total_warga) * 100 : 0
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'progres_per_rw' => $progres_per_rw,
            'kandidat_rt' => $kandidat_rt,
            'kandidat_rw' => $kandidat_rw,
        ]);
    }
}