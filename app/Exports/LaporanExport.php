<?php

namespace App\Exports;

use App\Models\Vote;
use App\Models\Kandidat;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\Warga;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class LaporanExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            'Rekap Suara' => new RekapSuaraSheet(),
            'Progres Kunjungan' => new ProgresKunjunganSheet(),
            'Log Audit' => new LogAuditSheet(),
        ];
    }
}
