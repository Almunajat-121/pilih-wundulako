<?php

namespace App\Exports;

use App\Models\Kandidat;
use App\Models\Vote;
use App\Models\Rw;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RekapSuaraSheet implements FromArray, WithTitle, WithHeadings, WithStyles
{
    public function title(): string
    {
        return 'Rekap Suara';
    }

    public function headings(): array
    {
        return ['Wilayah', 'Kandidat', 'Nomor Urut', 'Jenis', 'Jumlah Suara', 'Persentase'];
    }

    public function array(): array
    {
        $rows = [];

        // Rekap RT
        $kandidatRt = Kandidat::where('jenis', 'RT')
            ->with('rt.rw')
            ->withCount(['votes' => fn($q) => $q->where('status', 'valid')])
            ->orderBy('rt_id')
            ->orderBy('nomor_urut')
            ->get();

        $rtGroups = $kandidatRt->groupBy('rt_id');
        foreach ($rtGroups as $rtId => $group) {
            $totalVotes = $group->sum('votes_count');
            foreach ($group as $k) {
                $wilayah = $k->rt ? "{$k->rt->nama} - {$k->rt->rw->nama}" : '-';
                $persen = $totalVotes > 0 ? round(($k->votes_count / $totalVotes) * 100, 1) . '%' : '0%';
                $rows[] = [$wilayah, $k->nama, $k->nomor_urut, 'RT', $k->votes_count, $persen];
            }
        }

        // Rekap RW
        $kandidatRw = Kandidat::where('jenis', 'RW')
            ->with('rw')
            ->withCount(['votes' => fn($q) => $q->where('status', 'valid')])
            ->orderBy('rw_id')
            ->orderBy('nomor_urut')
            ->get();

        $rwGroups = $kandidatRw->groupBy('rw_id');
        foreach ($rwGroups as $rwId => $group) {
            $totalVotes = $group->sum('votes_count');
            foreach ($group as $k) {
                $wilayah = $k->rw ? $k->rw->nama : '-';
                $persen = $totalVotes > 0 ? round(($k->votes_count / $totalVotes) * 100, 1) . '%' : '0%';
                $rows[] = [$wilayah, $k->nama, $k->nomor_urut, 'RW', $k->votes_count, $persen];
            }
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
