<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Warga;
use App\Models\Kandidat;
use App\Http\Requests\StoreVoteRequest;
use App\Services\VoteService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;

class VoteController extends Controller
{
    public function create(Request $request, Warga $warga)
    {
        $warga->load('rt.rw');
        if (!$request->user()->rts()->where('rt_id', $warga->rt_id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke wilayah ini.');
        }

        $kandidat_rt = Kandidat::where('jenis', 'RT')->where('rt_id', $warga->rt_id)->get();
        $kandidat_rw = Kandidat::where('jenis', 'RW')->where('rw_id', $warga->rt->rw_id)->get();

        return Inertia::render('Petugas/FormVote', [
            'warga' => $warga,
            'kandidat_rt' => $kandidat_rt,
            'kandidat_rw' => $kandidat_rw,
        ]);
    }

    public function store(StoreVoteRequest $request, Warga $warga, VoteService $voteService)
    {
        if (!$request->user()->rts()->where('rt_id', $warga->rt_id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke wilayah ini.');
        }

        try {
            $result = $voteService->submitVote(
                $warga->id,
                $request->kandidat_rt_id,
                $request->kandidat_rw_id,
                $request->user()->id,
                $request->idempotency_key
            );

            return redirect()->route('petugas.wilayah.warga', $warga->rt_id)->with('success', $result['message']);
        } catch (Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}