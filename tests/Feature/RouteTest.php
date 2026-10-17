<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VotingConfig;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RouteTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_admin_routes()
    {
        VotingConfig::create(['voting_aktif_global' => true, 'tampilkan_live_count' => true]);

        $admin = User::create([
            'nama' => 'Administrator',
            'username' => 'admin',
            'password' => bcrypt('admin123'),
            'role' => 'admin'
        ]);
        
        $routes = [
            '/admin/dashboard',
            '/admin/rw',
            '/admin/kandidat',
            '/admin/pengguna',
            '/admin/warga',
            '/admin/audit/votes',
            '/admin/audit/status-logs',
            '/admin/voting-config',
            '/admin/laporan',
        ];

        foreach ($routes as $route) {
            $response = $this->actingAs($admin)->get($route);
            if ($response->status() !== 200) {
                echo "Route $route returned status " . $response->status() . "\n";
                if ($response->exception) {
                    echo "Exception: " . $response->exception->getMessage() . "\n";
                }
            } else {
                echo "Route $route OK\n";
            }
            $this->assertNotEquals(500, $response->status(), "Route $route failed!");
        }
    }

    public function test_authenticated_user_accessing_login_redirects_to_dashboard()
    {
        VotingConfig::create(['voting_aktif_global' => true, 'tampilkan_live_count' => true]);

        $admin = User::create([
            'nama' => 'Administrator',
            'username' => 'admin_test',
            'password' => bcrypt('admin123'),
            'role' => 'admin'
        ]);

        $response = $this->actingAs($admin)->get('/login');
        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_login_redirects_to_admin_dashboard_even_if_intended_was_publik()
    {
        VotingConfig::create(['voting_aktif_global' => true, 'tampilkan_live_count' => true]);

        $admin = User::create([
            'nama' => 'Administrator',
            'username' => 'admin_test2',
            'password' => bcrypt('admin123'),
            'role' => 'admin'
        ]);

        $response = $this->withSession(['url.intended' => 'http://localhost:8000/publik'])
            ->post('/login', [
                'username' => 'admin_test2',
                'password' => 'admin123',
            ]);

        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_petugas_login_redirects_to_petugas_dashboard()
    {
        VotingConfig::create(['voting_aktif_global' => true, 'tampilkan_live_count' => true]);

        $petugas = User::create([
            'nama' => 'Petugas Demo',
            'username' => 'petugas_test',
            'password' => bcrypt('password123'),
            'role' => 'petugas'
        ]);

        $response = $this->post('/login', [
            'username' => 'petugas_test',
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('petugas.dashboard'));
        $this->assertAuthenticatedAs($petugas);
        $this->assertTrue($petugas->isPetugas());
        $this->assertFalse($petugas->isAdmin());
        $this->assertFalse($petugas->isSaksi());
    }

    public function test_saksi_login_redirects_to_admin_dashboard()
    {
        VotingConfig::create(['voting_aktif_global' => true, 'tampilkan_live_count' => true]);

        $saksi = User::create([
            'nama' => 'Saksi Demo',
            'username' => 'saksi_test',
            'password' => bcrypt('password123'),
            'role' => 'saksi'
        ]);

        $response = $this->post('/login', [
            'username' => 'saksi_test',
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs($saksi);
        $this->assertTrue($saksi->isSaksi());
        $this->assertFalse($saksi->isAdmin());
        $this->assertFalse($saksi->isPetugas());
    }
}
