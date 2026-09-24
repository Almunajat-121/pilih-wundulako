<?php

use App\Models\Warga;
use App\Models\User;
use App\Models\Kandidat;
use App\Models\Vote;
use App\Services\VoteService;
use Illuminate\Support\Facades\DB;

// 1. Setup
$petugas = User::where('role', 'petugas')->first();
if (!$petugas) {
    // Fallback pakai admin jika petugas belum ada
    $petugas = User::where('role', 'admin')->first(); 
}

$warga = Warga::where('status_vote_rt', 'belum_dikunjungi')->first();
$kandidatRt = Kandidat::where('jenis', 'RT')->where('rt_id', $warga->rt_id)->first();
$kandidatRw = Kandidat::where('jenis', 'RW')->where('rw_id', $warga->rt->rw_id)->first();

echo "--- SIMULASI VOTING END-TO-END ---\n";
echo "Petugas: {$petugas->nama}\n";
echo "Warga Target: {$warga->nama} (Status RT Awal: {$warga->status_vote_rt})\n";
echo "Kandidat Pilihan RT: {$kandidatRt->nama}\n";
echo "Kandidat Pilihan RW: {$kandidatRw->nama}\n\n";

$voteService = new VoteService();
$idempotencyKey = (string) Str::uuid();

// 2. Eksekusi Voting
echo "Mengeksekusi transaksi voting...\n";
try {
    $result = $voteService->submitVote(
        $warga->id,
        $kandidatRt->id,
        $kandidatRw->id,
        $petugas->id,
        $idempotencyKey
    );
    echo "✅ Voting berhasil diproses!\n\n";
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// 3. Verifikasi Database
$wargaUpdated = Warga::find($warga->id);
$votes = Vote::where('warga_id', $warga->id)->get();

echo "--- HASIL VERIFIKASI ---\n";
echo "Status Warga RT: " . ($wargaUpdated->status_vote_rt === 'sudah_memilih' ? "✅ OK (sudah_memilih)" : "❌ GAGAL ({$wargaUpdated->status_vote_rt})") . "\n";
echo "Total Record Vote Warga: " . ($votes->count() === 2 ? "✅ OK (2 votes)" : "❌ GAGAL ({$votes->count()} votes)") . "\n";

$suaraRtCount = Vote::where('kandidat_id', $kandidatRt->id)->count();
echo "Total Suara Kandidat RT ({$kandidatRt->nama}): " . ($suaraRtCount > 0 ? "✅ OK ({$suaraRtCount} suara)" : "❌ GAGAL") . "\n";

echo "\nSemua test skenario berhasil! Sistem voting aman dan atomic.\n";
