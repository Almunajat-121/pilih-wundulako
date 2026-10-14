<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $rts = $request->user()->rts()->with('rw')->get();
        $rtIds = $rts->pluck('id');

        $statsPerRt = DB::table('warga')
            ->whereIn('rt_id', $rtIds)
            ->selectRaw("
                rt_id,
                COUNT(*) as total_warga,
                SUM(CASE WHEN status_vote_rt = 'sudah_memilih' THEN 1 ELSE 0 END) as sudah_memilih_rt,
                SUM(CASE WHEN status_vote_rw = 'sudah_memilih' THEN 1 ELSE 0 END) as sudah_memilih_rw
            ")
            ->groupBy('rt_id')
            ->get()
            ->keyBy('rt_id');

        $wilayah = $rts->map(function ($rt) use ($statsPerRt) {
            $stats = $statsPerRt->get($rt->id);
            $total_warga = (int) ($stats->total_warga ?? 0);
            $sudah_memilih_rt = (int) ($stats->sudah_memilih_rt ?? 0);
            $sudah_memilih_rw = (int) ($stats->sudah_memilih_rw ?? 0);
            
            $progres_rt = $total_warga > 0 ? round((($sudah_memilih_rt + $sudah_memilih_rw) / ($total_warga * 2)) * 100, 2) : 0;

            return [
                'id' => $rt->id,
                'nama' => $rt->nama,
                'rw' => $rt->rw,
                'voting_aktif' => (bool) $rt->voting_aktif,
                'total_warga' => $total_warga,
                'sudah_memilih_rt' => $sudah_memilih_rt,
                'sudah_memilih_rw' => $sudah_memilih_rw,
                'progres_rt' => $progres_rt,
            ];
        });

        return Inertia::render('Petugas/Dashboard', [
            'wilayah' => $wilayah
        ]);
    }
}
