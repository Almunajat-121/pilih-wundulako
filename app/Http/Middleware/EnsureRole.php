<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        $roles = explode(',', $role);
        
        if (!in_array($request->user()->role, $roles)) {
            if (in_array($request->user()->role, ['admin', 'saksi'])) {
                return redirect()->route('admin.dashboard');
            }
            return redirect()->route('petugas.dashboard');
        }

        return $next($request);
    }
}
