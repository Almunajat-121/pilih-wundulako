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
    protected $rts;
    protected $dibuatOleh;

    public function __construct(?int $dibuatOleh = null)
    {
        $this->dibuatOleh = $dibuatOleh;
        $this->rts = Rt::with('rw')->get();
    }

    public function model(array $row): Model|array|null
    {
        $nama = trim((string)($row['nama'] ?? $row['nama_lengkap'] ?? ''));
        $nama = strip_tags(str_replace("\0", '', $nama));
        if (empty($nama)) {
            return null;
        }
        $nama = mb_substr($nama, 0, 150);

        $rtVal = trim((string)($row['rt'] ?? $row['nama_rt'] ?? $row['rt_id'] ?? ''));
        $rwVal = trim((string)($row['rw'] ?? $row['nama_rw'] ?? $row['rw_id'] ?? ''));
        $rtId = null;

        // Extract RW if user combined RT and RW into one field (e.g. "RT 01 / RW 02" or "01/02")
        if (empty($rwVal)) {
            if (preg_match('/(?:rw|r\.w)\s*[:.\/-]?\s*([0-9]+)/i', $rtVal, $mRw)) {
                $rwVal = $mRw[1];
            } elseif (str_contains($rtVal, '/') || str_contains($rtVal, '\\')) {
                $parts = explode('/', str_replace('\\', '/', $rtVal));
                if (count($parts) >= 2) {
                    $rtVal = trim($parts[0]);
                    $rwVal = trim($parts[1]);
                }
            }
        }

        $rtNum = (int) preg_replace('/[^0-9]/', '', $rtVal);
        $rwNum = (int) preg_replace('/[^0-9]/', '', $rwVal);

        // 1. Direct match by database ID if numeric and no RW conflict
        if (is_numeric($rtVal) && empty($rwVal)) {
            $directRt = $this->rts->firstWhere('id', (int)$rtVal);
            if ($directRt) {
                $rtId = $directRt->id;
            }
        }

        // 2. Match by both RT number and RW number (most precise)
        if (!$rtId && $rtNum > 0 && $rwNum > 0) {
            $matched = $this->rts->first(function ($rt) use ($rtNum, $rwNum) {
                $targetRtNum = (int) preg_replace('/[^0-9]/', '', $rt->nama);
                $targetRwNum = (int) preg_replace('/[^0-9]/', '', $rt->rw?->nama ?? '');
                return $targetRtNum === $rtNum && $targetRwNum === $rwNum;
            });
            $rtId = $matched?->id;
        }

        // 3. Match by RW number and RT string/name
        if (!$rtId && $rwNum > 0) {
            $matched = $this->rts->first(function ($rt) use ($rtVal, $rwNum) {
                $targetRwNum = (int) preg_replace('/[^0-9]/', '', $rt->rw?->nama ?? '');
                return $targetRwNum === $rwNum && Str::lower(trim($rt->nama)) === Str::lower($rtVal);
            });
            $rtId = $matched?->id;
        }

        // 4. Fallback: match by RT string or RT number only
        if (!$rtId && $rtNum > 0) {
            $matched = $this->rts->first(function ($rt) use ($rtNum) {
                return (int) preg_replace('/[^0-9]/', '', $rt->nama) === $rtNum;
            });
            $rtId = $matched?->id;
        }

        if (!$rtId && !empty($rtVal)) {
            $matched = $this->rts->first(function ($rt) use ($rtVal) {
                return Str::lower(trim($rt->nama)) === Str::lower($rtVal);
            });
            $rtId = $matched?->id;
        }

        // 5. Ultimate fallback to first available RT
        if (!$rtId) {
            $rtId = $this->rts->first()?->id ?? 1;
        }

        $alamat = trim((string)($row['alamat'] ?? ''));
        $alamat = strip_tags(str_replace("\0", '', $alamat));
        if (empty($alamat)) {
            $alamat = 'Kelurahan Wundulako';
        }
        $alamat = mb_substr($alamat, 0, 255);

        $tanggalLahir = null;
        if (!empty($row['tanggal_lahir'])) {
            $rawDate = trim((string)$row['tanggal_lahir']);
            if (is_numeric($rawDate)) {
                try {
                    $tanggalLahir = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float)$rawDate)->format('Y-m-d');
                } catch (\Throwable) {
                    $tanggalLahir = null;
                }
            } else {
                $cleanedDate = str_replace(['/', '.'], '-', $rawDate);
                $time = strtotime($cleanedDate);
                if ($time !== false) {
                    $parsed = date('Y-m-d', $time);
                    $parts = explode('-', $parsed);
                    if (count($parts) === 3) {
                        $y = (int)$parts[0];
                        $m = (int)$parts[1];
                        $d = (int)$parts[2];
                        if ($y >= 1900 && $y <= (int)date('Y') && checkdate($m, $d, $y)) {
                            $tanggalLahir = $parsed;
                        }
                    }
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
