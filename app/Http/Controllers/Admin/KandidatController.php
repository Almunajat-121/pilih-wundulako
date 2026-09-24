<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kandidat;
use App\Models\Rw;
use App\Models\Rt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KandidatController extends Controller
{
    public function index(Request $request)
    {
        $query = Kandidat::with(['rt', 'rw']);
        
        if ($jenis = $request->input('jenis')) {
            $query->where('jenis', $jenis);
        }
        
        return Inertia::render('Admin/Kandidat', [
            'kandidat' => $query->paginate(10),
            'rw_list' => Rw::with('rts')->get()->map(function($rw) {
                $rw->rt = $rw->rts;
                return $rw;
            }),
            'rt_list' => Rt::all(),
            'filters' => $request->only(['jenis', 'wilayah'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:150',
            'nomor_urut' => 'required|integer',
            'jenis' => 'required|in:RT,RW',
            'rt_id' => 'required_if:jenis,RT|nullable|exists:rt,id',
            'rw_id' => 'nullable|exists:rw,id', // Make rw_id always validatable if present, since we now send it for RT as well
            'foto' => 'nullable|string',
            'visi_misi' => 'nullable|string'
        ]);

        Kandidat::create($request->all());
        return back()->with('success', 'Kandidat berhasil ditambahkan.');
    }

    public function update(Request $request, Kandidat $kandidat)
    {
        $request->validate([
            'nama' => 'required|string|max:150',
            'nomor_urut' => 'required|integer',
            'visi_misi' => 'nullable|string'
        ]);
        $kandidat->update($request->only('nama', 'nomor_urut', 'visi_misi'));
        return back()->with('success', 'Kandidat berhasil diperbarui.');
    }

    public function destroy(Kandidat $kandidat)
    {
        $kandidat->delete();
        return back()->with('success', 'Kandidat berhasil dihapus.');
    }
}