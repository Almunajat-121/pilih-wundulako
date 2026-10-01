<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\User;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\Warga;
use App\Models\Kandidat;
use App\Models\VotingConfig;

class PetugasEndpointRealDBTest extends TestCase
{
    use DatabaseTransactions;

    protected $petugas;
    protected $rt;
    protected $warga;
    protected $kandidatRt;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure VotingConfig exists
        if (VotingConfig::count() === 0) {
            VotingConfig::create(['voting_aktif_global' => true]);
        }

        // Create RW and RT
        $rw = Rw::create(['nama' => 'RW 99_TEST']);
        $this->rt = Rt::create(['nama' => 'RT 99_TEST', 'rw_id' => $rw->id, 'voting_aktif' => true]);

        // Create Petugas
        $this->petugas = User::create([
            'nama' => 'Tester Petugas',
            'username' => 'testerpetugas_99',
            'password' => bcrypt('password'),
            'role' => 'petugas'
        ]);
        
        // Assign RT to Petugas
        $this->petugas->rts()->attach($this->rt->id);

        // Create Warga
        $this->warga = Warga::create([
            'nama' => 'Budi Warga TEST',
            'alamat' => 'Jalan Tester No 1',
            'rt_id' => $this->rt->id,
            'status_vote_rt' => 'belum_dikunjungi',
            'status_vote_rw' => 'belum_dikunjungi'
        ]);

        // Create Kandidat
        $this->kandidatRt = Kandidat::create([
            'nama' => 'Kandidat 1 RT TEST',
            'nomor_urut' => 1,
            'jenis' => 'RT',
            'rt_id' => $this->rt->id,
        ]);
    }

    public function test_dashboard_endpoint()
    {
        $response = $this->actingAs($this->petugas)->get('/petugas/dashboard');
        $response->assertStatus(200);
    }

    public function test_daftar_warga_endpoint()
    {
        $response = $this->actingAs($this->petugas)->get('/petugas/wilayah/' . $this->rt->id);
        $response->assertStatus(200);
    }

    public function test_tambah_warga_page_endpoint()
    {
        $response = $this->actingAs($this->petugas)->get('/petugas/wilayah/' . $this->rt->id . '/warga/baru');
        $response->assertStatus(200);
    }

    public function test_store_warga_endpoint()
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('ktp.jpg');

        $response = $this->actingAs($this->petugas)->post('/petugas/wilayah/' . $this->rt->id . '/warga', [
            'nama' => 'Warga Baru Tambahan TEST',
            'alamat' => 'Jalan Baru TEST',
            'foto_ktp' => $file
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('warga', [
            'nama' => 'Warga Baru Tambahan TEST'
        ]);
    }

    public function test_form_vote_page_endpoint()
    {
        $response = $this->actingAs($this->petugas)->get('/petugas/warga/' . $this->warga->id . '/vote');
        $response->assertStatus(200);
    }

    public function test_submit_vote_endpoint()
    {
        $response = $this->actingAs($this->petugas)->post('/petugas/warga/' . $this->warga->id . '/vote', [
            'kandidat_rt_id' => $this->kandidatRt->id,
            'verifikasi_identitas' => true,
            'idempotency_key' => 'unique-test-key-123-' . uniqid()
        ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('votes', [
            'warga_id' => $this->warga->id,
            'kandidat_id' => $this->kandidatRt->id,
            'jenis' => 'RT',
        ]);
        
        $this->assertDatabaseHas('warga', [
            'id' => $this->warga->id,
            'status_vote_rt' => 'sudah_memilih',
        ]);
    }

    public function test_update_status_kunjungan_endpoint()
    {
        $response = $this->actingAs($this->petugas)->put('/petugas/warga/' . $this->warga->id . '/status', [
            'status' => 'tidak_ditemukan',
            'jenis' => 'both'
        ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('warga', [
            'id' => $this->warga->id,
            'status_vote_rt' => 'tidak_ditemukan'
        ]);
    }
}
