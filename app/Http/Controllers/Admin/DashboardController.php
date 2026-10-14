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
        $statsRaw = DB::table('warga')
            ->selectRaw("
                COUNT(*) as total_warga,
                SUM(CASE WHEN status_vote_rt = 'sudah_memilih' THEN 1 ELSE 0 END) as sudah_memilih_rt,
                SUM(CASE WHEN status_vote_rw = 'sudah_memilih' THEN 1 ELSE 0 END) as sudah_memilih_rw,
                SUM(CASE WHEN status_vote_rt = 'belum_dikunjungi' AND status_vote_rw = 'belum_dikunjungi' THEN 1 ELSE 0 END) as belum_dikunjungi,
                SUM(CASE WHEN status_vote_rt = 'tidak_ditemukan' THEN 1 ELSE 0 END) as tidak_ditemukan,
                SUM(CASE WHEN status_vote_rt = 'menolak' THEN 1 ELSE 0 END) as menolak
            ")
            ->first();

        $stats = [
            'total_warga' => (int) ($statsRaw->total_warga ?? 0),
            'sudah_memilih_rt' => (int) ($statsRaw->sudah_memilih_rt ?? 0),
            'sudah_memilih_rw' => (int) ($statsRaw->sudah_memilih_rw ?? 0),
            'belum_dikunjungi' => (int) ($statsRaw->belum_dikunjungi ?? 0),
            'tidak_ditemukan' => (int) ($statsRaw->tidak_ditemukan ?? 0),
            'menolak' => (int) ($statsRaw->menolak ?? 0),
        ];
        $total_warga = $stats['total_warga'];

        // Progres per RW (Aggregated in SQL)
        $rwStats = DB::table('warga')
            ->join('rt', 'warga.rt_id', '=', 'rt.id')
            ->selectRaw("
                rt.rw_id,
                COUNT(*) as total,
                SUM(CASE WHEN warga.status_vote_rt = 'sudah_memilih' THEN 1 ELSE 0 END) as sudah_rt,
                SUM(CASE WHEN warga.status_vote_rw = 'sudah_memilih' THEN 1 ELSE 0 END) as sudah_rw
            ")
            ->groupBy('rt.rw_id')
            ->get()
            ->keyBy('rw_id');

        $rws = Rw::orderBy('nama')->get();
        $progres_per_rw = $rws->map(function ($rw) use ($rwStats) {
            $stat = $rwStats->get($rw->id);
            $total = (int) ($stat->total ?? 0);
            $sudah_rt = (int) ($stat->sudah_rt ?? 0);
            $sudah_rw = (int) ($stat->sudah_rw ?? 0);

            return [
                'rw_nama' => 'RW ' . $rw->nama,
                'total' => $total,
                'sudah_rt' => $sudah_rt,
                'sudah_rw' => $sudah_rw,
                'persen_rt' => $total > 0 ? round(($sudah_rt / $total) * 100, 1) : 0,
                'persen_rw' => $total > 0 ? round(($sudah_rw / $total) * 100, 1) : 0,
            ];
        })->values()->all();

        // Kandidat RT & RW (Eager aggregation via withCount)
        $kandidat_rt = Kandidat::where('jenis', 'RT')
            ->with('rt')
            ->withCount(['votes' => fn($q) => $q->where('status', 'valid')])
            ->orderBy('nomor_urut')
            ->get()
            ->map(function($k) use ($total_warga) {
                return [
                    'id' => $k->id,
                    'nama' => $k->nama,
                    'nomor_urut' => $k->nomor_urut,
                    'rt' => $k->rt,
                    'jumlah_suara' => $k->votes_count,
                    'persentase' => $total_warga > 0 ? round(($k->votes_count / $total_warga) * 100, 1) : 0
                ];
            });
        
        $kandidat_rw = Kandidat::where('jenis', 'RW')
            ->with('rw')
            ->withCount(['votes' => fn($q) => $q->where('status', 'valid')])
            ->orderBy('nomor_urut')
            ->get()
            ->map(function($k) use ($total_warga) {
                return [
                    'id' => $k->id,
                    'nama' => $k->nama,
                    'nomor_urut' => $k->nomor_urut,
                    'rw' => $k->rw,
                    'jumlah_suara' => $k->votes_count,
                    'persentase' => $total_warga > 0 ? round(($k->votes_count / $total_warga) * 100, 1) : 0
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