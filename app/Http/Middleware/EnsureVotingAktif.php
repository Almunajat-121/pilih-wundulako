<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Rt;
use App\Models\VotingConfig;

class EnsureVotingAktif
{
    /**
     * Cek apakah voting masih aktif (global DAN per RT).
     * Middleware ini dipakai di route submit vote.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $config = VotingConfig::first();

        if (!$config || !$config->voting_aktif_global) {
            return back()->with('error', 'Voting sudah ditutup untuk seluruh kelurahan.');
        }

        // Cek per RT jika ada rt_id di route atau request
        $rtId = $request->route('rt') ?? $request->input('rt_id');
        if ($rtId) {
            $rt = Rt::find($rtId);
            if ($rt && !$rt->voting_aktif) {
                return back()->with('error', "Voting sudah ditutup untuk wilayah {$rt->nama}.");
            }
        }

        return $next($request);
    }
}
