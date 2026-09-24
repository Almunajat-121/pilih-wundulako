<?php

namespace App\Http\Controllers\Publik;

use App\Http\Controllers\Controller;
use App\Models\VotingConfig;
use App\Models\Kandidat;
use Inertia\Inertia;

class LiveCountController extends Controller
{
    public function index()
    {
        $config = VotingConfig::first();

        if (!$config || !$config->tampilkan_live_count) {
            return Inertia::render('Publik/LiveCount', [
                'hidden' => true
            ]);
        }

        $kandidat = Kandidat::withCount(['votes' => function($q) {
            $q->where('status', 'valid');
        }])->with(['rt', 'rw'])->get();

        return Inertia::render('Publik/LiveCount', [
            'hidden' => false,
            'kandidat' => $kandidat
        ]);
    }
}