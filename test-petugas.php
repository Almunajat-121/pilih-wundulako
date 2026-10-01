use App\Models\User;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\Warga;
use App\Models\Kandidat;
use App\Models\VotingConfig;
use Illuminate\Http\Request;

echo "\n--- STARTING API TEST FOR PETUGAS ---\n";

DB::beginTransaction();
try {
    // 1. Setup Data
    if (VotingConfig::count() === 0) {
        VotingConfig::create(['voting_aktif_global' => true]);
    }
    $rw = Rw::create(['nama' => 'RW 99_TEST']);
    $rt = Rt::create(['nama' => 'RT 99_TEST', 'rw_id' => $rw->id, 'voting_aktif' => true]);
    $petugas = User::create(['nama' => 'Tester Petugas', 'username' => 'testerpetugas_99', 'password' => bcrypt('password'), 'role' => 'petugas']);
    $petugas->rts()->attach($rt->id);
    $warga = Warga::create(['nama' => 'Budi Warga TEST', 'alamat' => 'Jalan Tester No 1', 'rt_id' => $rt->id, 'status_vote_rt' => 'belum_dikunjungi', 'status_vote_rw' => 'belum_dikunjungi']);
    $kandidatRt = Kandidat::create(['nama' => 'Kandidat 1 RT TEST', 'nomor_urut' => 1, 'jenis' => 'RT', 'rt_id' => $rt->id]);

    Auth::login($petugas);

    // TEST GET /petugas/dashboard
    echo "Testing GET /petugas/dashboard... ";
    $request = Request::create('/petugas/dashboard', 'GET');
    $response = app()->handle($request);
    echo $response->status() == 200 ? "OK (200)\n" : "FAIL (" . $response->status() . ")\n";

    // TEST GET /petugas/wilayah/{rt}
    echo "Testing GET /petugas/wilayah/{$rt->id}... ";
    $request = Request::create("/petugas/wilayah/{$rt->id}", 'GET');
    $response = app()->handle($request);
    echo $response->status() == 200 ? "OK (200)\n" : "FAIL (" . $response->status() . ")\n";

    // TEST POST /petugas/warga/{warga}/status (Update Status)
    echo "Testing PUT /petugas/warga/{$warga->id}/status... ";
    $request = Request::create("/petugas/warga/{$warga->id}/status", 'PUT', [
        'status' => 'tidak_ditemukan',
        'jenis' => 'both'
    ]);
    $response = app()->handle($request);
    echo $response->isRedirect() ? "OK (Redirect)\n" : "FAIL (" . $response->status() . ")\n";
    $warga->refresh();
    echo "   -> DB status_vote_rt: " . $warga->status_vote_rt . "\n";

    // TEST GET /petugas/warga/{warga}/vote
    echo "Testing GET /petugas/warga/{$warga->id}/vote... ";
    $request = Request::create("/petugas/warga/{$warga->id}/vote", 'GET');
    $response = app()->handle($request);
    echo $response->status() == 200 ? "OK (200)\n" : "FAIL (" . $response->status() . ")\n";

    // TEST POST /petugas/warga/{warga}/vote
    $warga->update(['status_vote_rt' => 'belum_dikunjungi', 'status_vote_rw' => 'belum_dikunjungi']);
    echo "Testing POST /petugas/warga/{$warga->id}/vote... ";
    $request = Request::create("/petugas/warga/{$warga->id}/vote", 'POST', [
        'kandidat_rt_id' => $kandidatRt->id,
        'verifikasi_identitas' => true,
        'idempotency_key' => 'unique-key-123'
    ]);
    $response = app()->handle($request);
    echo $response->isRedirect() ? "OK (Redirect)\n" : "FAIL (" . $response->status() . ")\n";
    $warga->refresh();
    echo "   -> DB status_vote_rt: " . $warga->status_vote_rt . "\n";

    DB::rollBack();
    echo "\n--- ALL TESTS COMPLETED & ROLLED BACK ---\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "\nERROR: " . $e->getMessage() . "\n";
}
