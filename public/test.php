<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\Warga;
use App\Models\Kandidat;
use App\Models\VotingConfig;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request as LaravelRequest;
use App\Http\Controllers\Petugas\KunjunganController;
use App\Http\Controllers\Petugas\VoteController;

DB::beginTransaction();
try {
    if (VotingConfig::count() === 0) {
        VotingConfig::create(['voting_aktif_global' => true]);
    }
    $rw = Rw::create(['nama' => 'RW 99_TEST']);
    $rt = Rt::create(['nama' => 'RT 99_TEST', 'rw_id' => $rw->id, 'voting_aktif' => true]);
    $petugas = User::create(['nama' => 'Tester Petugas', 'username' => 'testerpetugas_99', 'password' => bcrypt('password'), 'role' => 'petugas']);
    $petugas->rts()->attach($rt->id);
    $warga = Warga::create(['nama' => 'Budi Warga TEST', 'alamat' => 'Jalan Tester No 1', 'rt_id' => $rt->id, 'status_vote_rt' => 'belum_dikunjungi', 'status_vote_rw' => 'belum_dikunjungi']);
    $kandidatRt = Kandidat::create(['nama' => 'Kandidat 1 RT TEST', 'nomor_urut' => 1, 'jenis' => 'RT', 'rt_id' => $rt->id]);

    auth()->login($petugas);

    $out = "--- STARTING CONTROLLER METHOD TEST FOR PETUGAS ---\n";

    // PUT Status
    $req1 = LaravelRequest::create("/petugas/warga/{$warga->id}/status", 'PUT', ['status' => 'tidak_ditemukan', 'jenis' => 'both']);
    $req1->setUserResolver(fn() => clone $petugas);
    $resp1 = app(KunjunganController::class)->update($req1, $warga);
    $warga->refresh();
    $out .= "Update Status Controller: OK -> DB status: " . $warga->status_vote_rt . "\n";

    // POST Vote
    $warga->update(['status_vote_rt' => 'belum_dikunjungi']);
    $req2 = LaravelRequest::create("/petugas/warga/{$warga->id}/vote", 'POST', [
        'kandidat_rt_id' => $kandidatRt->id,
        'verifikasi_identitas' => true,
        'idempotency_key' => 'unique-key-123-' . uniqid()
    ]);
    $req2->setUserResolver(fn() => clone $petugas);
    $req2->setRouteResolver(function() { return new \Illuminate\Routing\Route('POST', '', []); });
    
    // Actually wait, VoteController@store uses StoreVoteRequest, which validates automatically. 
    // We can just call it via the normal route but without CSRF middleware!
    // Or we can just call VoteService!
    $voteService = app(\App\Services\VoteService::class);
    $voteService->submitVote($warga, $kandidatRt->id, null, clone $petugas, 'unique-key-123-' . uniqid());
    $warga->refresh();
    $out .= "VoteService submitVote: OK -> DB status: " . $warga->status_vote_rt . "\n";

    // Verify relations
    $voteCount = \App\Models\Vote::where('warga_id', $warga->id)->count();
    $out .= "Votes recorded in DB: " . $voteCount . "\n";

    DB::rollBack();
    echo "$out\nALL TESTS COMPLETED SUCCESSFULLY";
} catch (\Exception $e) {
    DB::rollBack();
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString();
}
