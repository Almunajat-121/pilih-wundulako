<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Carbon\Carbon;

class WargaController extends Controller
{
    public function index(Request $request)
    {
        $query = Warga::with('rt.rw');

        if ($search = $request->input('search')) {
            $query->where('nama', 'like', "%{$search}%");
        }
        
        if ($rt = $request->input('rt_id')) {
            $query->where('rt_id', $rt);
        }

        if ($status = $request->input('status')) {
            $query->where(function($q) use ($status) {
                $q->where('status_vote_rt', $status)->orWhere('status_vote_rw', $status);
            });
        }

        return Inertia::render('Admin/Warga', [
            'warga' => $query->paginate(20)->withQueryString(),
            'rt_list' => \App\Models\Rt::with('rw')->get(),
            'filters' => $request->only('search', 'rt_id', 'status')
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:150',
            'alamat' => 'required|string|max:255',
            'rt_id' => 'required|exists:rt,id',
            'tanggal_lahir' => 'nullable|date',
        ], [
            'nama.required' => 'Nama warga wajib diisi.',
            'alamat.required' => 'Alamat warga wajib diisi.',
            'rt_id.required' => 'Wilayah RT wajib dipilih.',
            'rt_id.exists' => 'Wilayah RT yang dipilih tidak valid.',
        ]);

        Warga::create([
            'nama' => strip_tags(trim($request->nama)),
            'alamat' => strip_tags(trim($request->alamat)),
            'rt_id' => $request->rt_id,
            'tanggal_lahir' => $request->tanggal_lahir ?: null,
            'status_vote_rt' => 'belum_dikunjungi',
            'status_vote_rw' => 'belum_dikunjungi',
            'jumlah_kunjungan' => 0,
            'dibuat_oleh' => $request->user()->id,
        ]);

        return back()->with('success', 'Data warga berhasil ditambahkan.');
    }

    public function update(Request $request, Warga $warga)
    {
        $request->validate([
            'nama' => 'required|string|max:150',
            'alamat' => 'nullable|string|max:255',
            'rt_id' => 'required|exists:rt,id',
            'tanggal_lahir' => 'nullable|date',
        ]);
        $warga->update($request->only('nama', 'alamat', 'rt_id', 'tanggal_lahir'));
        return back()->with('success', 'Data warga berhasil diperbarui.');
    }

    public function destroy(Warga $warga)
    {
        if ($warga->votes()->count() > 0) {
            return back()->withErrors(['error' => 'Tidak dapat menghapus warga yang sudah memiliki data suara.']);
        }

        if ($warga->foto_ktp_path && \Illuminate\Support\Facades\Storage::disk('local')->exists($warga->foto_ktp_path)) {
            \Illuminate\Support\Facades\Storage::disk('local')->delete($warga->foto_ktp_path);
        }

        if ($warga->foto_bukti_hadir_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($warga->foto_bukti_hadir_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($warga->foto_bukti_hadir_path);
        }

        $warga->delete();
        return back()->with('success', 'Warga berhasil dihapus.');
    }

    public function showFoto(Warga $warga)
    {
        if (!$warga->foto_ktp_path) {
            abort(404);
        }
        $url = URL::temporarySignedRoute(
            'admin.warga.foto.view', now()->addMinutes(5), ['path' => $warga->foto_ktp_path]
        );
        return response()->json(['url' => $url]);
    }

    public function viewFoto(Request $request)
    {
        if (!$request->hasValidSignature()) {
            abort(403);
        }
        $path = $request->query('path');
        if (!\Illuminate\Support\Facades\Storage::disk('local')->exists($path)) {
            abort(404);
        }
        return response()->file(\Illuminate\Support\Facades\Storage::disk('local')->path($path));
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv,txt|max:10240',
        ], [
            'file.required' => 'File Excel atau CSV wajib diunggah.',
            'file.mimes' => 'Format file harus berupa Excel (.xlsx, .xls) atau CSV (.csv).',
            'file.max' => 'Ukuran file maksimal 10 MB.',
        ]);

        try {
            \Maatwebsite\Excel\Facades\Excel::import(
                new \App\Imports\WargaImport($request->user()->id),
                $request->file('file')
            );
            return back()->with('success', 'Data DPT warga berhasil diimpor.');
        } catch (\Throwable $e) {
            return back()->withErrors(['file' => $e->getMessage()]);
        }
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="template_import_dpt.csv"',
        ];

        $csvData = "nama,alamat,rt,rw,tanggal_lahir\n"
                 . "Contoh Warga 1,Jl. Protokol No. 10,RT 01,RW 01,1990-05-15\n"
                 . "Contoh Warga 2,Jl. Mawar No. 4,RT 02,RW 01,1985-11-20\n"
                 . "Contoh Warga 3,Jl. Melati No. 8,RT 01,RW 02,1992-08-12\n";

        return response($csvData, 200, $headers);
    }
}