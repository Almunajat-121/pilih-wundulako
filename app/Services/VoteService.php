<?php

namespace App\Services;

use App\Models\Vote;
use App\Models\Warga;
use App\Models\StatusLog;
use App\Models\Rt;
use App\Models\VotingConfig;
use Illuminate\Support\Facades\DB;
use Exception;

class VoteService
{
    /**
     * Submit vote secara atomic dengan transaction + row lock.
     * Ini adalah bagian PALING KRITIS dari seluruh aplikasi.
     *
     * @throws Exception jika vote gagal (sudah memilih, voting ditutup, dll)
     */
    public function submitVote(
        int $wargaId,
        ?int $kandidatRtId,
        ?int $kandidatRwId,
        int $petugasId,
        string $idempotencyKey,
    ): array {
        return DB::transaction(function () use ($wargaId, $kandidatRtId, $kandidatRwId, $petugasId, $idempotencyKey) {

            // 1. Cek idempotency key — mencegah dobel submit akibat retry
            $existingVote = Vote::where('idempotency_key', $idempotencyKey)->first();
            if ($existingVote) {
                return ['status' => 'already_submitted', 'message' => 'Suara sudah tercatat sebelumnya.'];
            }

            // 2. Lock row warga — mencegah race condition
            $warga = Warga::lockForUpdate()->find($wargaId);
            if (!$warga) {
                throw new Exception('Warga tidak ditemukan.');
            }

            // 3. Cek voting masih aktif (global)
            $config = VotingConfig::first();
            if (!$config || !$config->voting_aktif_global) {
                throw new Exception('Voting sudah ditutup untuk seluruh kelurahan.');
            }

            // 4. Cek voting masih aktif (per RT)
            $rt = Rt::find($warga->rt_id);
            if (!$rt || !$rt->voting_aktif) {
                throw new Exception("Voting sudah ditutup untuk wilayah {$rt->nama}.");
            }

            $results = [];

            // 5. Proses vote RT
            if ($kandidatRtId !== null) {
                if ($warga->status_vote_rt === 'sudah_memilih') {
                    throw new Exception('Warga sudah memilih Ketua RT sebelumnya.');
                }

                Vote::create([
                    'warga_id' => $wargaId,
                    'kandidat_id' => $kandidatRtId,
                    'jenis' => 'RT',
                    'petugas_id' => $petugasId,
                    'status' => 'valid',
                    'idempotency_key' => $idempotencyKey . '_RT',
                ]);

                $statusLama = $warga->status_vote_rt;
                $warga->status_vote_rt = 'sudah_memilih';

                StatusLog::create([
                    'warga_id' => $wargaId,
                    'jenis' => 'RT',
                    'status_lama' => $statusLama,
                    'status_baru' => 'sudah_memilih',
                    'aktor_id' => $petugasId,
                ]);

                $results[] = 'RT';
            }

            // 6. Proses vote RW
            if ($kandidatRwId !== null) {
                if ($warga->status_vote_rw === 'sudah_memilih') {
                    throw new Exception('Warga sudah memilih Ketua RW sebelumnya.');
                }

                Vote::create([
                    'warga_id' => $wargaId,
                    'kandidat_id' => $kandidatRwId,
                    'jenis' => 'RW',
                    'petugas_id' => $petugasId,
                    'status' => 'valid',
                    'idempotency_key' => $idempotencyKey . '_RW',
                ]);

                $statusLama = $warga->status_vote_rw;
                $warga->status_vote_rw = 'sudah_memilih';

                StatusLog::create([
                    'warga_id' => $wargaId,
                    'jenis' => 'RW',
                    'status_lama' => $statusLama,
                    'status_baru' => 'sudah_memilih',
                    'aktor_id' => $petugasId,
                ]);

                $results[] = 'RW';
            }

            // 7. Simpan perubahan status warga
            $warga->save();

            return [
                'status' => 'success',
                'message' => 'Suara berhasil dicatat untuk: ' . implode(' dan ', $results),
                'voted' => $results,
            ];
        });
    }

    /**
     * Void vote oleh admin — reset status warga, catat log.
     */
    public function voidVote(int $voteId, int $adminId, string $alasan): void
    {
        DB::transaction(function () use ($voteId, $adminId, $alasan) {
            $vote = Vote::lockForUpdate()->findOrFail($voteId);

            if ($vote->status === 'void') {
                throw new Exception('Vote ini sudah di-void sebelumnya.');
            }

            // Void vote
            $vote->update([
                'status' => 'void',
                'alasan_void' => $alasan,
            ]);

            // Reset status warga
            $warga = Warga::lockForUpdate()->findOrFail($vote->warga_id);
            $field = $vote->jenis === 'RT' ? 'status_vote_rt' : 'status_vote_rw';
            $statusLama = $warga->$field;
            $warga->$field = 'belum_dikunjungi';
            $warga->save();

            // Catat status log
            StatusLog::create([
                'warga_id' => $warga->id,
                'jenis' => $vote->jenis,
                'status_lama' => $statusLama,
                'status_baru' => 'belum_dikunjungi',
                'aktor_id' => $adminId,
                'alasan' => "VOID: {$alasan}",
            ]);
        });
    }

    /**
     * Update status kunjungan warga (tidak_ditemukan / menolak).
     */
    public function updateStatusKunjungan(
        int $wargaId,
        string $statusBaru,
        string $jenis, // 'RT' atau 'RW' atau 'both'
        int $petugasId,
    ): void {
        DB::transaction(function () use ($wargaId, $statusBaru, $jenis, $petugasId) {
            $warga = Warga::lockForUpdate()->findOrFail($wargaId);

            $jenisArr = $jenis === 'both' ? ['RT', 'RW'] : [$jenis];

            foreach ($jenisArr as $j) {
                $field = $j === 'RT' ? 'status_vote_rt' : 'status_vote_rw';
                $statusLama = $warga->$field;

                // Hanya bisa update jika masih belum_dikunjungi atau tidak_ditemukan
                if (!in_array($statusLama, ['belum_dikunjungi', 'tidak_ditemukan'])) {
                    continue;
                }

                $warga->$field = $statusBaru;

                StatusLog::create([
                    'warga_id' => $wargaId,
                    'jenis' => $j,
                    'status_lama' => $statusLama,
                    'status_baru' => $statusBaru,
                    'aktor_id' => $petugasId,
                ]);
            }

            // Increment jumlah_kunjungan jika tidak_ditemukan
            if ($statusBaru === 'tidak_ditemukan') {
                $warga->jumlah_kunjungan += 1;
            }

            $warga->save();
        });
    }
}
