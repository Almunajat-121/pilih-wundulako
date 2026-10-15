<?php

namespace App\Imports;

use App\Models\Warga;
use App\Models\Rt;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class WargaImport implements ToModel, WithHeadingRow
{
    protected $rtMap;
    protected $dibuatOleh;

    public function __construct(?int $dibuatOleh = null)
    {
        $this->dibuatOleh = $dibuatOleh;
        $this->rtMap = Rt::all()->keyBy(function ($rt) {
            return Str::lower(trim($rt->nama));
        });
    }

    public function model(array $row): Model|array|null
    {
        $nama = trim($row['nama'] ?? $row['nama_lengkap'] ?? '');
        if (empty($nama)) {
            return null;
        }

        $rtVal = trim($row['rt'] ?? $row['rt_id'] ?? $row['nama_rt'] ?? '');
        $rtId = null;

        if (is_numeric($rtVal) && Rt::where('id', (int)$rtVal)->exists()) {
            $rtId = (int)$rtVal;
        } else {
            $matched = $this->rtMap->get(Str::lower($rtVal));
            if (!$matched) {
                $num = preg_replace('/[^0-9]/', '', $rtVal);
                if ($num) {
                    $matched = $this->rtMap->first(function ($item) use ($num) {
                        return preg_replace('/[^0-9]/', '', $item->nama) === $num;
                    });
                }
            }
            $rtId = $matched?->id;
        }

        if (!$rtId) {
            $rtId = Rt::first()?->id ?? 1;
        }

        $alamat = trim($row['alamat'] ?? 'Kelurahan Wundulako');

        $tanggalLahir = null;
        if (!empty($row['tanggal_lahir'])) {
            if (is_numeric($row['tanggal_lahir'])) {
                try {
                    $tanggalLahir = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float)$row['tanggal_lahir'])->format('Y-m-d');
                } catch (\Throwable $e) {
                    $tanggalLahir = null;
                }
            } else {
                $time = strtotime((string)$row['tanggal_lahir']);
                if ($time !== false) {
                    $tanggalLahir = date('Y-m-d', $time);
                }
            }
        }

        return new Warga([
            'nama' => $nama,
            'alamat' => $alamat,
            'rt_id' => $rtId,
            'tanggal_lahir' => $tanggalLahir,
            'status_vote_rt' => 'belum_dikunjungi',
            'status_vote_rw' => 'belum_dikunjungi',
            'jumlah_kunjungan' => 0,
            'dibuat_oleh' => $this->dibuatOleh,
        ]);
    }
}
