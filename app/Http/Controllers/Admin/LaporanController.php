<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Vote;
use App\Models\Warga;
use App\Models\Kandidat;
use App\Exports\LaporanExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanController extends Controller
{
    public function index()
    {
        $totalWarga = Warga::count();
        $totalSuaraRt = Vote::where('status', 'valid')->where('jenis', 'RT')->count();
        $totalSuaraRw = Vote::where('status', 'valid')->where('jenis', 'RW')->count();

        return Inertia::render('Admin/Laporan', [
            'stats' => [
                'total_warga' => $totalWarga,
                'total_suara_rt' => $totalSuaraRt,
                'total_suara_rw' => $totalSuaraRw,
                'sudah_memilih_rt' => Warga::where('status_vote_rt', 'sudah_memilih')->count(),
                'sudah_memilih_rw' => Warga::where('status_vote_rw', 'sudah_memilih')->count(),
                'belum_dikunjungi' => Warga::where('status_vote_rt', 'belum_dikunjungi')
                    ->where('status_vote_rw', 'belum_dikunjungi')->count(),
                'persen_rt' => $totalWarga > 0 ? round(($totalSuaraRt / $totalWarga) * 100, 1) : 0,
                'persen_rw' => $totalWarga > 0 ? round(($totalSuaraRw / $totalWarga) * 100, 1) : 0,
            ],
        ]);
    }

    public function exportExcel()
    {
        $filename = 'Laporan_Pemilihan_RTRW_Wundulako_' . now()->format('Y-m-d_His') . '.xlsx';
        return Excel::download(new LaporanExport(), $filename);
    }

    public function exportPdf()
    {
        $kandidatRt = Kandidat::where('jenis', 'RT')
            ->with('rt.rw')
            ->withCount(['votes' => fn($q) => $q->where('status', 'valid')])
            ->orderBy('rt_id')
            ->orderBy('nomor_urut')
            ->get();

        $kandidatRw = Kandidat::where('jenis', 'RW')
            ->with('rw')
            ->withCount(['votes' => fn($q) => $q->where('status', 'valid')])
            ->orderBy('rw_id')
            ->orderBy('nomor_urut')
            ->get();

        $pdf = Pdf::loadView('exports.rekap-suara', [
            'kandidat_rt' => $kandidatRt,
            'kandidat_rw' => $kandidatRw,
            'total_warga' => Warga::count(),
            'tanggal' => now()->format('d F Y'),
        ]);

        $filename = 'Rekap_Suara_Wundulako_' . now()->format('Y-m-d') . '.pdf';
        return $pdf->download($filename);
    }
}