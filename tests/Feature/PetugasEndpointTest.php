<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\User;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\Warga;
use App\Models\Kandidat;
use App\Models\VotingConfig;

class PetugasEndpointTest extends TestCase
{
    use RefreshDatabase;

    protected $petugas;
    protected $rt;
    protected $warga;
    protected $kandidatRt;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure VotingConfig exists
        VotingConfig::create(['voting_aktif_global' => true]);

        // Create RW and RT
        $rw = Rw::create(['nama' => 'RW 01']);
        $this->rt = Rt::create(['nama' => 'RT 01', 'rw_id' => $rw->id, 'voting_aktif' => true]);

        // Create Petugas
        $this->petugas = User::create([
            'nama' => 'Tester Petugas',
            'username' => 'testerpetugas',
            'password' => bcrypt('password'),
            'role' => 'petugas'
        ]);
        
        // Assign RT to Petugas
        $this->petugas->rts()->attach($this->rt->id);

        // Create Warga
        $this->warga = Warga::create([
            'nama' => 'Budi Warga',
            'alamat' => 'Jalan Tester No 1',
            'rt_id' => $this->rt->id,
            'status_vote_rt' => 'belum_dikunjungi',
            'status_vote_rw' => 'belum_dikunjungi'
        ]);

        // Create Kandidat
        $this->kandidatRt = Kandidat::create([
            'nama' => 'Kandidat 1 RT',
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
            'nama' => 'Warga Baru Tambahan',
            'alamat' => 'Jalan Baru',
            'foto_ktp' => $file
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('warga', [
            'nama' => 'Warga Baru Tambahan'
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
            'kandidat_rw_id' => 'abstain',
            'verifikasi_identitas' => true,
            'idempotency_key' => 'unique-test-key-123',
            'foto_bukti' => \Illuminate\Http\UploadedFile::fake()->image('bukti.jpg'),
        ]);

        $response->assertSessionHasNoErrors();
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

    public function test_update_status_page_endpoint()
    {
        $response = $this->actingAs($this->petugas)->get('/petugas/warga/' . $this->warga->id . '/status');
        $response->assertStatus(200);
    }

    public function test_submit_vote_requires_foto_bukti()
    {
        $response = $this->actingAs($this->petugas)->post('/petugas/warga/' . $this->warga->id . '/vote', [
            'kandidat_rt_id' => $this->kandidatRt->id,
            'kandidat_rw_id' => 'abstain',
            'verifikasi_identitas' => true,
            'idempotency_key' => 'test-no-photo-123',
            // no foto_bukti
        ]);

        $response->assertSessionHasErrors('foto_bukti');
    }

    public function test_submit_vote_cross_region_candidate_rejected()
    {
        // Candidate from another RT
        $otherRw = Rw::create(['nama' => 'RW 99_OTHER']);
        $otherRt = Rt::create(['nama' => 'RT 99_OTHER', 'rw_id' => $otherRw->id, 'voting_aktif' => true]);
        $otherKandidat = Kandidat::create([
            'nama' => 'Kandidat RT Lain',
            'nomor_urut' => 2,
            'jenis' => 'RT',
            'rt_id' => $otherRt->id
        ]);

        $response = $this->actingAs($this->petugas)->post('/petugas/warga/' . $this->warga->id . '/vote', [
            'kandidat_rt_id' => $otherKandidat->id,
            'kandidat_rw_id' => 'abstain',
            'verifikasi_identitas' => true,
            'idempotency_key' => 'cross-region-key-123',
            'foto_bukti' => UploadedFile::fake()->image('bukti.jpg'),
        ]);

        $response->assertSessionHasErrors('kandidat_rt_id');
    }

    public function test_submit_vote_idempotency_prevents_duplicate()
    {
        $payload = [
            'kandidat_rt_id' => $this->kandidatRt->id,
            'kandidat_rw_id' => 'abstain',
            'verifikasi_identitas' => true,
            'idempotency_key' => 'idempotency-fixed-key-456',
            'foto_bukti' => UploadedFile::fake()->image('bukti.jpg'),
        ];

        // 1st submit
        $res1 = $this->actingAs($this->petugas)->post('/petugas/warga/' . $this->warga->id . '/vote', $payload);
        $res1->assertSessionHasNoErrors();
        $this->assertEquals(2, \App\Models\Vote::where('warga_id', $this->warga->id)->count());

        // 2nd submit with identical idempotency key (network retry)
        $res2 = $this->actingAs($this->petugas)->post('/petugas/warga/' . $this->warga->id . '/vote', $payload);
        // Should not crash and count must still be 2 (no duplicate votes added)
        $this->assertEquals(2, \App\Models\Vote::where('warga_id', $this->warga->id)->count());
    }

    public function test_admin_can_import_warga_csv()
    {
        $admin = User::create([
            'nama' => 'Admin Test',
            'username' => 'admintest',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $rw2 = Rw::create(['nama' => 'RW 02']);
        $rt1Rw2 = Rt::create(['nama' => 'RT 01', 'rw_id' => $rw2->id, 'voting_aktif' => true]);

        $csvContent = "nama,alamat,rt,rw,tanggal_lahir\n"
                    . "Warga Impor Satu,Jl. Mawar 1,RT 01,RW 01,1995-01-01\n"
                    . "Warga Impor Dua,Jl. Melati 2,RT 01,RW 02,1998-05-10\n";
        $file = UploadedFile::fake()->createWithContent('dpt.csv', $csvContent);

        $response = $this->actingAs($admin)->post('/admin/warga/import', [
            'file' => $file,
        ]);

        $response->assertSessionHasNoErrors();
        // Warga Impor Satu should be in RT 01 of RW 01 ($this->rt->id)
        $this->assertDatabaseHas('warga', ['nama' => 'Warga Impor Satu', 'rt_id' => $this->rt->id]);
        // Warga Impor Dua should be in RT 01 of RW 02 ($rt1Rw2->id)
        $this->assertDatabaseHas('warga', ['nama' => 'Warga Impor Dua', 'rt_id' => $rt1Rw2->id]);
    }

    public function test_admin_can_delete_warga_without_votes()
    {
        $admin = User::create([
            'nama' => 'Admin Test 2',
            'username' => 'admintest2',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $wargaBaru = Warga::create([
            'nama' => 'Warga Mau Dihapus',
            'alamat' => 'Jl. Mawar No. 12',
            'rt_id' => $this->rt->id,
            'status_vote_rt' => 'belum_dikunjungi',
            'status_vote_rw' => 'belum_dikunjungi',
        ]);

        $response = $this->actingAs($admin)->delete('/admin/warga/' . $wargaBaru->id);
        $response->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('warga', ['id' => $wargaBaru->id]);
    }

    public function test_admin_cannot_delete_warga_with_votes()
    {
        $admin = User::create([
            'nama' => 'Admin Test 3',
            'username' => 'admintest3',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Submit vote first for this->warga
        $this->actingAs($this->petugas)->post('/petugas/warga/' . $this->warga->id . '/vote', [
            'kandidat_rt_id' => $this->kandidatRt->id,
            'kandidat_rw_id' => 'abstain',
            'verifikasi_identitas' => true,
            'idempotency_key' => 'cannot-delete-key-789',
            'foto_bukti' => UploadedFile::fake()->image('bukti.jpg'),
        ]);

        $response = $this->actingAs($admin)->delete('/admin/warga/' . $this->warga->id);
        $response->assertSessionHasErrors('error');
        $this->assertDatabaseHas('warga', ['id' => $this->warga->id]);
    }

    public function test_import_with_user_provided_edge_cases_csv()
    {
        $admin = User::create([
            'nama' => 'Admin Edge Test',
            'username' => 'adminedgetest',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $csv = "nama,alamat,rt,tanggal_lahir\n"
             . "Contoh Warga 1,Jl. Protokol No. 10,RT 01,1990-05-15\n"
             . ", Jl. Mawar No. 4,RT 02,1985-11-20\n"
             . "Masruri,jl.apel no40,rt 02,198511-20\n"
             . "Ahmad Fauzan,Jl. Melati No. 12,RT 01,1992-13-08\n"
             . "Siti Aminah,,RT 03,1995-07-21\n"
             . "Muhammad Rizky,Jl. Anggrek No. 15,RT 99,1988-09-12\n"
             . "Nur Aisyah,Jl. Flamboyan No. 6,,1998-01-30\n"
             . "Andi Saputra,Jl. Diponegoro No. 22,RT 01,2030-12-05\n"
             . "Dewi Lestari,Jl. Cempaka No. 9,RT 03,1993-06-31\n"
             . "Budi Santoso,Jl. Merpati No. 18,RT 02,1979-04-25\n"
             . "Rina Marlina,Jl. Dahlia No. 11,RT 04,1996-10-14\n"
             . "Fajar Ramadhan,Jl. Pattimura No. 3,RT 1,1991-08-09\n"
             . "Nurul Hidayah,Jl. Teratai No. 25,RT 03,1987-02-19\n"
             . "Ilham Akbar,Jl. Nusa Indah No. 14,RT 02,1994/12/11\n"
             . "Fitri Handayani,Jl. Kamboja No. 8,RT 04,1999-05-03\n"
             . "Arman Syah,Jl. Pemuda No. 17,RT 01,84-07-28\n"
             . "Rahmawati,Jl. Beringin No. 5,RT 03,1990-11-16\n"
             . "Dedi Kurniawan,Jl. Mangga No. 20,RT 02,1986-03-22\n"
             . "Hasna Putri,Jl. Srikaya No. 13,RT 04,1997-09-07\n"
             . "Randi Pratama,Jl. Ahmad Yani No. 30,RT 01,1992-01-18\n"
             . "Contoh Warga 1,Jl. Protokol No. 10,RT 01,1990-05-15\n"
             . "M4sruri,Jl. Apel No. 40,RT 02,1985-11-20\n"
             . "Fauzan,Jl. Melati No. 12,RT 01,1992-03-08\n"
             . "Siti Aminah,Jl. Kenanga No. 7,RT 03,1995-07-21\n"
             . "Rizky,Jl. Anggrek No. 15,RT 02,1888-09-12\n";

        $file = UploadedFile::fake()->createWithContent('user_test.csv', $csv);

        $response = $this->actingAs($admin)->post('/admin/warga/import', [
            'file' => $file,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('warga', ['nama' => 'Masruri']);
        $this->assertDatabaseHas('warga', ['nama' => 'Budi Santoso']);
        $this->assertDatabaseHas('warga', ['nama' => 'Siti Aminah']);
        $this->assertDatabaseHas('warga', ['nama' => 'Rizky']);
    }
}
