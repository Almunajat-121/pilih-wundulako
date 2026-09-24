<?php

namespace App\Exports;

use App\Models\Vote;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LogAuditSheet implements FromArray, WithTitle, WithHeadings, WithStyles
{
    public function title(): string
    {
        return 'Log Audit';
    }

    public function headings(): array
    {
        return ['Waktu', 'Petugas', 'Warga', 'Wilayah', 'Kandidat', 'Jenis', 'Status', 'Alasan Void'];
    }

    public function array(): array
    {
        $votes = Vote::with(['warga.rt.rw', 'kandidat', 'petugas'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $votes->map(function ($vote) {
            $wilayah = $vote->warga?->rt
                ? "{$vote->warga->rt->nama} - {$vote->warga->rt->rw->nama}"
                : '-';

            return [
                $vote->created_at->format('d/m/Y H:i'),
                $vote->petugas?->nama ?? '-',
                $vote->warga?->nama ?? '-',
                $wilayah,
                $vote->kandidat?->nama ?? '-',
                $vote->jenis,
                $vote->status === 'valid' ? 'Valid' : 'VOID',
                $vote->alasan_void ?? '',
            ];
        })->toArray();
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
