<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rw;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class RwController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Wilayah', [
            'rw_list' => Rw::with('rts')->get()->map(function($rw) {
                // frontend expects 'rt' instead of 'rts'
                $rw->rt = $rw->rts; 
                return $rw;
            })
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['nama' => 'required|string|max:50'], ['nama.required' => 'Nama RW wajib diisi.']);
        Rw::create($request->only('nama'));
        Cache::forget('rt_list_with_rw');
        return back()->with('success', 'RW berhasil ditambahkan.');
    }

    public function update(Request $request, Rw $rw)
    {
        $request->validate(['nama' => 'required|string|max:50'], ['nama.required' => 'Nama RW wajib diisi.']);
        $rw->update($request->only('nama'));
        Cache::forget('rt_list_with_rw');
        return back()->with('success', 'RW berhasil diperbarui.');
    }

    public function destroy(Rw $rw)
    {
        if ($rw->rts()->count() > 0) {
            return back()->withErrors(['error' => 'Tidak dapat menghapus RW karena masih memiliki RT.']);
        }
        $rw->delete();
        Cache::forget('rt_list_with_rw');
        return back()->with('success', 'RW berhasil dihapus.');
    }
}