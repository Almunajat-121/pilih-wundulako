<?php

namespace App\Exports;

use App\Models\Rt;
use App\Models\Warga;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProgresKunjunganSheet implements FromArray, WithTitle, WithHeadings, WithStyles
{
    public function title(): string
    {
        return 'Progres Kunjungan';
    }

    public function headings(): array
    {
        return [
            'RW', 'RT', 'Total Warga',
            'Sudah Memilih RT', '% RT',
            'Sudah Memilih RW', '% RW',
            'Tidak Ditemukan', 'Menolak', 'Belum Dikunjungi', '% Belum'
        ];
    }

    public function array(): array
    {
        $rows = [];

        $rtList = Rt::with('rw')
            ->withCount([
                'warga',
                'warga as sudah_rt' => fn($q) => $q->where('status_vote_rt', 'sudah_memilih'),
                'warga as sudah_rw' => fn($q) => $q->where('status_vote_rw', 'sudah_memilih'),
                'warga as tidak_ditemukan' => fn($q) => $q->where('status_vote_rt', 'tidak_ditemukan')
                    ->orWhere('status_vote_rw', 'tidak_ditemukan'),
                'warga as menolak' => fn($q) => $q->where('status_vote_rt', 'menolak')
                    ->orWhere('status_vote_rw', 'menolak'),
                'warga as belum' => fn($q) => $q->where('status_vote_rt', 'belum_dikunjungi')
                    ->where('status_vote_rw', 'belum_dikunjungi'),
            ])
            ->orderBy('rw_id')
            ->orderBy('nama')
            ->get();

        foreach ($rtList as $rt) {
            $total = $rt->warga_count ?: 1;
            $rows[] = [
                $rt->rw->nama,
                $rt->nama,
                $rt->warga_count,
                $rt->sudah_rt,
                round(($rt->sudah_rt / $total) * 100, 1) . '%',
                $rt->sudah_rw,
                round(($rt->sudah_rw / $total) * 100, 1) . '%',
                $rt->tidak_ditemukan,
                $rt->menolak,
                $rt->belum,
                round(($rt->belum / $total) * 100, 1) . '%',
            ];
        }

        return $rows;
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
