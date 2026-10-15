<?php

namespace App\Imports;

use App\Models\Warga;
use App\Models\Rt;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WargaImport implements ToCollection, WithHeadingRow
{
    protected $rts;
    protected ?int $dibuatOleh;

    public function __construct(?int $dibuatOleh = null)
    {
        $this->dibuatOleh = $dibuatOleh;
        $this->rts = Rt::with('rw')->get();
    }

    public function collection(Collection $rows): void
    {
        $errors = [];
        $wargaToInsert = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2; // Row 1 is the header row in CSV / Excel

            $nama = trim((string)($row['nama'] ?? $row['nama_lengkap'] ?? ''));
            $nama = strip_tags(str_replace("\0", '', $nama));

            $alamat = trim((string)($row['alamat'] ?? ''));
            $alamat = strip_tags(str_replace("\0", '', $alamat));

            $rtVal = trim((string)($row['rt'] ?? $row['nama_rt'] ?? $row['rt_id'] ?? ''));
            $rwVal = trim((string)($row['rw'] ?? $row['nama_rw'] ?? $row['rw_id'] ?? ''));
            $tglVal = $row['tanggal_lahir'] ?? null;

            // Skip row if it is completely empty
            $rawTgl = trim((string)$tglVal);
            if ($nama === '' && $alamat === '' && $rtVal === '' && $rwVal === '' && $rawTgl === '') {
                continue;
            }

            $label = $nama !== '' ? " ({$nama})" : '';

            // 1. Validasi Nama
            if ($nama === '') {
                $errors[] = "Baris {$rowNum}: Kolom 'nama' tidak boleh kosong.";
            } elseif (mb_strlen($nama) > 150) {
                $nama = mb_substr($nama, 0, 150);
            }

            // 2. Validasi Alamat (wajib, tidak ada default dummy)
            if ($alamat === '') {
                $errors[] = "Baris {$rowNum}{$label}: Kolom 'alamat' wajib diisi.";
            } elseif (mb_strlen($alamat) > 255) {
                $alamat = mb_substr($alamat, 0, 255);
            }

            // 3. Validasi RT & RW
            $rtId = null;
            if ($rtVal === '') {
                $errors[] = "Baris {$rowNum}{$label}: Kolom 'rt' wajib diisi.";
            } else {
                // Ekstrak RW jika user menggabungkannya dalam kolom RT (contoh: "RT 01 / RW 02" atau "01/02")
                if ($rwVal === '') {
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

                if ($rwVal !== '' || $rwNum > 0) {
                    // Jika RW terdefinisi, cari RT yang tepat di RW tersebut
                    $matched = $this->rts->first(function ($rt) use ($rtNum, $rwNum, $rtVal, $rwVal) {
                        $targetRtNum = (int) preg_replace('/[^0-9]/', '', $rt->nama);
                        $targetRwNum = (int) preg_replace('/[^0-9]/', '', $rt->rw?->nama ?? '');
                        $rtMatch = ($rtNum > 0 && $targetRtNum === $rtNum) || Str::lower(trim($rt->nama)) === Str::lower($rtVal);
                        $rwMatch = ($rwNum > 0 && $targetRwNum === $rwNum) || Str::lower(trim($rt->rw?->nama ?? '')) === Str::lower($rwVal);
                        return $rtMatch && $rwMatch;
                    });

                    if ($matched) {
                        $rtId = $matched->id;
                    } else {
                        $errors[] = "Baris {$rowNum}{$label}: RT '{$rtVal}' pada RW '{$rwVal}' tidak ditemukan di sistem kelurahan.";
                    }
                } else {
                    // Jika RW tidak diisi:
                    if (is_numeric($rtVal) && $this->rts->contains('id', (int)$rtVal)) {
                        $rtId = (int)$rtVal;
                    } else {
                        $matchingRts = $this->rts->filter(function ($rt) use ($rtNum, $rtVal) {
                            $targetRtNum = (int) preg_replace('/[^0-9]/', '', $rt->nama);
                            return ($rtNum > 0 && $targetRtNum === $rtNum) || Str::lower(trim($rt->nama)) === Str::lower($rtVal);
                        });

                        if ($matchingRts->isEmpty()) {
                            $errors[] = "Baris {$rowNum}{$label}: RT '{$rtVal}' tidak ditemukan di sistem kelurahan.";
                        } elseif ($matchingRts->count() > 1) {
                            $rwNames = $matchingRts->map(fn($r) => $r->rw?->nama ?? ('RW ID ' . $r->rw_id))->unique()->join(', ');
                            $errors[] = "Baris {$rowNum}{$label}: RT '{$rtVal}' terdapat di beberapa RW ({$rwNames}). Harap cantumkan kolom 'rw' agar tidak salah penempatan.";
                        } else {
                            $rtId = $matchingRts->first()->id;
                        }
                    }
                }
            }

            // 4. Validasi Tanggal Lahir (jika diisi)
            $tanggalLahir = null;
            if ($rawTgl !== '' && strtolower($rawTgl) !== 'null' && $rawTgl !== '-') {
                [$parsedDate, $dateError] = $this->parseAndValidateTanggalLahir($rawTgl);
                if ($dateError !== null) {
                    $errors[] = "Baris {$rowNum}{$label}: Tanggal lahir '{$rawTgl}' tidak valid ({$dateError}).";
                } else {
                    $tanggalLahir = $parsedDate;
                }
            }

            if ($nama !== '' && $alamat !== '' && $rtId !== null) {
                $wargaToInsert[] = [
                    'nama' => $nama,
                    'alamat' => $alamat,
                    'rt_id' => $rtId,
                    'tanggal_lahir' => $tanggalLahir,
                    'status_vote_rt' => 'belum_dikunjungi',
                    'status_vote_rw' => 'belum_dikunjungi',
                    'jumlah_kunjungan' => 0,
                    'dibuat_oleh' => $this->dibuatOleh,
                ];
            }
        }

        if (!empty($errors)) {
            $totalErrors = count($errors);
            $shownErrors = array_slice($errors, 0, 15);
            $summary = "Ditemukan {$totalErrors} kesalahan pada file DPT:\n• " . implode("\n• ", $shownErrors);
            if ($totalErrors > 15) {
                $more = $totalErrors - 15;
                $summary .= "\n• ... dan {$more} baris kesalahan lainnya. Silakan periksa dan perbaiki file Anda.";
            }
            throw new \Exception($summary);
        }

        if (empty($wargaToInsert)) {
            throw new \Exception("File yang diunggah tidak memiliki data warga yang valid untuk diimpor.");
        }

        DB::transaction(function () use ($wargaToInsert) {
            $now = now();
            $chunks = array_chunk($wargaToInsert, 250);
            foreach ($chunks as $chunk) {
                Warga::insert(array_map(function ($item) use ($now) {
                    $item['created_at'] = $now;
                    $item['updated_at'] = $now;
                    return $item;
                }, $chunk));
            }
        });
    }

    protected function parseAndValidateTanggalLahir(mixed $value): array
    {
        $raw = trim((string)$value);
        if ($raw === '') {
            return [null, null];
        }

        $currentYear = (int)date('Y');

        // Excel numeric serial date check
        if (is_numeric($raw) && (float)$raw > 1000 && (float)$raw < 100000) {
            try {
                $dt = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float)$raw);
                $y = (int)$dt->format('Y');
                $m = (int)$dt->format('n');
                $d = (int)$dt->format('j');
                if (!checkdate($m, $d, $y)) {
                    return [null, "Nilai tanggal kalender tidak valid"];
                }
                if ($y < 1900 || $y > $currentYear) {
                    return [null, "Tahun lahir ({$y}) tidak wajar (harus antara 1900 - {$currentYear})"];
                }
                return [$dt->format('Y-m-d'), null];
            } catch (\Throwable) {
                return [null, "Format tanggal Excel tidak dapat dibaca"];
            }
        }

        $cleaned = str_replace(['/', '.'], '-', $raw);
        $parts = explode('-', $cleaned);

        if (count($parts) !== 3) {
            return [null, "Gunakan format YYYY-MM-DD"];
        }

        $p0 = trim($parts[0]);
        $p1 = trim($parts[1]);
        $p2 = trim($parts[2]);

        if (!is_numeric($p0) || !is_numeric($p1) || !is_numeric($p2)) {
            return [null, "Tanggal harus berupa angka"];
        }

        // Format YYYY-MM-DD
        if (strlen($p0) === 4) {
            $y = (int)$p0;
            $m = (int)$p1;
            $d = (int)$p2;
        }
        // Format DD-MM-YYYY
        elseif (strlen($p2) === 4) {
            $d = (int)$p0;
            $m = (int)$p1;
            $y = (int)$p2;
        } else {
            return [null, "Tahun harus 4 digit (contoh: 1990)"];
        }

        if ($y < 1900 || $y > $currentYear) {
            return [null, "Tahun lahir ({$y}) tidak wajar (harus antara 1900 - {$currentYear})"];
        }

        if ($m < 1 || $m > 12) {
            return [null, "Bulan ({$m}) tidak valid (harus 1 - 12)"];
        }

        if (!checkdate($m, $d, $y)) {
            return [null, "Kombinasi hari dan bulan tidak valid (misal: 29 Feb di tahun non-kabisat atau 31 Juni)"];
        }

        return [sprintf('%04d-%02d-%02d', $y, $m, $d), null];
    }
}
