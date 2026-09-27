<?php

namespace App\Http\Controllers\Publik;

use App\Http\Controllers\Controller;
use App\Models\VotingConfig;
use App\Models\Kandidat;
use App\Models\Warga;
use App\Models\Vote;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class LiveCountController extends Controller
{
    public function index()
    {
        $config = VotingConfig::first();

        if (!$config || !$config->tampilkan_live_count) {
            return Inertia::render('Publik/LiveCount', [
                'hidden' => true,
                'data' => null
            ]);
        }

        $data = Cache::remember('live_count_data', 60, function () {
            $kandidatRaw = Kandidat::withCount(['votes' => function($q) {
                $q->where('status', 'valid');
            }])->with(['rt.rw', 'rw'])->get();
            
            $kandidatFormatted = $kandidatRaw->map(function($k) use ($kandidatRaw) {
                $totalSuaraWilayah = $kandidatRaw->where('jenis', $k->jenis);
                if ($k->jenis === 'RT') {
                    $totalSuaraWilayah = $totalSuaraWilayah->where('rt_id', $k->rt_id);
                } else {
                    $totalSuaraWilayah = $totalSuaraWilayah->where('rw_id', $k->rw_id);
                }
                
                $total = $totalSuaraWilayah->sum('votes_count');
                $pct = $total > 0 ? ($k->votes_count / $total) * 100 : 0;
                
                return [
                    'id' => $k->id,
                    'nama' => $k->nama,
                    'nomor_urut' => $k->nomor_urut,
                    'jenis' => $k->jenis,
                    'wilayah_nama' => $k->jenis === 'RT' ? ($k->rt->nama ?? '') . ' / ' . ($k->rt->rw->nama ?? '') : ($k->rw->nama ?? ''),
                    'jumlah_suara' => $k->votes_count,
                    'persentase' => $pct
                ];
            });

            return [
                'kandidat' => $kandidatFormatted,
                'total_warga' => Warga::count(),
                'total_sudah_memilih_rt' => Vote::where('jenis', 'RT')->where('status', 'valid')->count(),
                'total_sudah_memilih_rw' => Vote::where('jenis', 'RW')->where('status', 'valid')->count(),
                'terakhir_diperbarui' => now()->toISOString(),
            ];
        });

        return Inertia::render('Publik/LiveCount', [
            'hidden' => false,
            'data' => $data
        ]);
    }
}
