<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class RouteTest extends TestCase
{
    public function test_all_admin_routes()
    {
        $admin = User::where('username', 'admin')->first();
        
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
}
