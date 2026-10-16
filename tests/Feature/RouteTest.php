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
}
