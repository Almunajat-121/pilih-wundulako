<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Models\Rt;
use App\Models\Warga;
use App\Http\Requests\StoreWargaRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class WargaController extends Controller
{
    public function index(Request $request, Rt $rt)
    {
        if (!$request->user()->rts()->where('rt_id', $rt->id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke wilayah ini.');
        }

        $query = Warga::where('rt_id', $rt->id);

        if ($search = $request->input('search')) {
            $query->where('nama', 'like', "%{\$search}%");
        }

        if ($status = $request->input('status')) {
            $query->where('status_vote_rt', $status)->orWhere('status_vote_rw', $status);
        }

        $warga = $query->paginate(20)->withQueryString();

        return Inertia::render('Petugas/DaftarWarga', [
            'warga' => $warga,
            'rt' => $rt->load('rw'),
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function create(Request $request, Rt $rt)
    {
        if (!$request->user()->rts()->where('rt_id', $rt->id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke wilayah ini.');
        }

        return Inertia::render('Petugas/TambahWarga', [
            'rt' => $rt->load('rw')
        ]);
    }

    public function store(StoreWargaRequest $request, Rt $rt)
    {
        if (!$request->user()->rts()->where('rt_id', $rt->id)->exists()) {
            abort(403, 'Anda tidak memiliki akses ke wilayah ini.');
        }

        $path = $request->file('foto_ktp')->store('ktp', 'local');

        $warga = Warga::create([
            'nama' => $request->nama,
            'alamat' => $request->alamat,
            'rt_id' => $rt->id,
            'foto_ktp_path' => $path,
            'dibuat_oleh' => $request->user()->id,
            'status_vote_rt' => 'belum_dikunjungi',
            'status_vote_rw' => 'belum_dikunjungi',
            'jumlah_kunjungan' => 0,
        ]);

        return redirect()->route('petugas.warga.vote', $warga)->with('success', 'Warga berhasil didaftarkan.');
    }
}