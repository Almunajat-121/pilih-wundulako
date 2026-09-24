<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rt;
use Illuminate\Http\Request;

class RtController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:50',
            'rw_id' => 'required|exists:rws,id'
        ], [
            'nama.required' => 'Nama RT wajib diisi.',
            'rw_id.required' => 'RW wajib dipilih.'
        ]);
        Rt::create($request->only('nama', 'rw_id'));
        return back()->with('success', 'RT berhasil ditambahkan.');
    }

    public function update(Request $request, Rt $rt)
    {
        $request->validate(['nama' => 'required|string|max:50'], ['nama.required' => 'Nama RT wajib diisi.']);
        $rt->update($request->only('nama'));
        return back()->with('success', 'RT berhasil diperbarui.');
    }

    public function destroy(Rt $rt)
    {
        if (\App\Models\Warga::where('rt_id', $rt->id)->exists()) {
            return back()->withErrors(['error' => 'Tidak dapat menghapus RT karena masih memiliki warga.']);
        }
        $rt->delete();
        return back()->with('success', 'RT berhasil dihapus.');
    }

    public function toggleVoting(Request $request, Rt $rt)
    {
        $rt->update(['voting_aktif' => !$rt->voting_aktif]);
        $status = $rt->voting_aktif ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Voting RT {$rt->nama} berhasil {$status}.");
    }
}