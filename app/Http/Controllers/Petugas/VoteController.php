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
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class VoteController extends Controller
{
    public function create(Request $request, Warga $warga)
    {
        $warga->load('rt.rw');
        if (!$request->user()->rts()->where('rt.id', $warga->rt_id)->exists()) {
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
        if (!$request->user()->rts()->where('rt.id', $warga->rt_id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke wilayah ini.');
        }

        try {
            $fotoBuktiPath = null;
            if ($request->hasFile('foto_bukti')) {
                $file = $request->file('foto_bukti');
                
                $manager = new ImageManager(new Driver());
                $image = $manager->decode($file);
                
                // Compress and scale down to 800px width
                $image->scaleDown(width: 800);
                
                // Ensure storage directory exists
                $directory = storage_path('app/public/bukti_hadir');
                if (!file_exists($directory)) {
                    mkdir($directory, 0755, true);
                }
                
                $filename = 'bukti_' . uniqid() . '.jpg';
                $image->save($directory . '/' . $filename, 75);
                
                $fotoBuktiPath = 'bukti_hadir/' . $filename;
            }

            $result = $voteService->submitVote(
                $warga->id,
                $request->kandidat_rt_id,
                $request->kandidat_rw_id,
                $request->user()->id,
                $request->idempotency_key,
                $fotoBuktiPath
            );

            return redirect()->route('petugas.wilayah.warga', $warga->rt_id)->with('success', $result['message']);
        } catch (Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
