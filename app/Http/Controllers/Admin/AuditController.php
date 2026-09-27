<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vote;
use App\Models\StatusLog;
use App\Services\VoteService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditController extends Controller
{
    public function indexVotes(Request $request)
    {
        $query = Vote::with(['warga', 'kandidat', 'petugas']);

        if ($date = $request->input('date')) {
            $query->whereDate('created_at', $date);
        }
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        return Inertia::render('Admin/Audit', [
            'votes' => $query->latest()->paginate(20)->withQueryString(),
            'tab' => 'votes',
            'filters' => $request->only('date', 'status')
        ]);
    }

    public function indexStatusLogs(Request $request)
    {
        $query = StatusLog::with(['warga', 'aktor']);

        return Inertia::render('Admin/Audit', [
            'status_logs' => $query->latest()->paginate(20)->withQueryString(),
            'tab' => 'status_logs',
            'filters' => []
        ]);
    }

    public function voidVote(Request $request, Vote $vote, VoteService $voteService)
    {
        $request->validate(['alasan' => 'required|string|min:10'], [
            'alasan.required' => 'Alasan void wajib diisi.',
            'alasan.min' => 'Alasan void minimal 10 karakter.'
        ]);

        try {
            $voteService->voidVote($vote->id, $request->user()->id, $request->alasan);
            return back()->with('success', 'Vote berhasil di-void.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}