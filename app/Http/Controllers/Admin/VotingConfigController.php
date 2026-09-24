<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VotingConfig;
use App\Models\Rt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VotingConfigController extends Controller
{
    public function show()
    {
        return Inertia::render('Admin/VotingConfig', [
            'config' => VotingConfig::first() ?? VotingConfig::create(['voting_aktif_global' => true, 'tampilkan_live_count' => true]),
            'rts' => Rt::with('rw')->get()
        ]);
    }

    public function updateGlobal(Request $request)
    {
        $config = VotingConfig::first();
        $config->update([
            'voting_aktif_global' => !$config->voting_aktif_global,
            'updated_by' => $request->user()->id
        ]);
        $status = $config->voting_aktif_global ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Voting global berhasil {$status}.");
    }

    public function updatePerRt(Request $request, Rt $rt)
    {
        $rt->update(['voting_aktif' => !$rt->voting_aktif]);
        $status = $rt->voting_aktif ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Voting wilayah {$rt->nama} berhasil {$status}.");
    }

    public function updateLiveCount(Request $request)
    {
        $config = VotingConfig::first();
        $config->update([
            'tampilkan_live_count' => !$config->tampilkan_live_count,
            'updated_by' => $request->user()->id
        ]);
        $status = $config->tampilkan_live_count ? 'ditampilkan' : 'disembunyikan';
        return back()->with('success', "Live count publik berhasil {$status}.");
    }
}