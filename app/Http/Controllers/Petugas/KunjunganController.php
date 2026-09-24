<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Warga;
use App\Services\VoteService;
use Illuminate\Http\Request;

class KunjunganController extends Controller
{
    public function update(Request $request, Warga $warga, VoteService $voteService)
    {
        if (!$request->user()->rts()->where('rt_id', $warga->rt_id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke wilayah ini.');
        }

        $request->validate([
            'status' => 'required|in:tidak_ditemukan,menolak',
            'jenis' => 'required|in:RT,RW,both'
        ], [
            'status.required' => 'Status wajib diisi.',
            'status.in' => 'Status tidak valid.',
            'jenis.required' => 'Jenis wajib diisi.',
            'jenis.in' => 'Jenis tidak valid.'
        ]);

        try {
            $voteService->updateStatusKunjungan(
                $warga->id,
                $request->status,
                $request->jenis,
                $request->user()->id
            );

            return back()->with('success', 'Status kunjungan berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Terjadi kesalahan saat memperbarui status.']);
        }
    }
}