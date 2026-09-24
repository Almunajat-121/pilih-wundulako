<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $rts = $request->user()->rts()->with('rw')->get();

        $wilayah = $rts->map(function ($rt) {
            $total_warga = \App\Models\Warga::where('rt_id', $rt->id)->count();
            $sudah_memilih_rt = \App\Models\Warga::where('rt_id', $rt->id)->where('status_vote_rt', 'sudah_memilih')->count();
            $sudah_memilih_rw = \App\Models\Warga::where('rt_id', $rt->id)->where('status_vote_rw', 'sudah_memilih')->count();
            
            $progres_rt = $total_warga > 0 ? round((($sudah_memilih_rt + $sudah_memilih_rw) / ($total_warga * 2)) * 100, 2) : 0;

            return [
                'id' => $rt->id,
                'nama' => $rt->nama,
                'rw' => $rt->rw,
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