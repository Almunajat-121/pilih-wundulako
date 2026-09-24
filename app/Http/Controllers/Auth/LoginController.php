<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use App\Models\User;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $key = 'login.' . $request->ip() . '.' . $request->username;

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->withErrors([
                'username' => "Terlalu banyak percobaan login. Silakan coba lagi dalam {$seconds} detik."
            ]);
        }

        $user = User::where('username', $request->username)->first();

        if (!$user) {
            RateLimiter::hit($key);
            return back()->withErrors(['username' => 'Username atau password salah.']);
        }

        if (!$user->is_active) {
            return back()->withErrors(['username' => 'Akun tidak aktif.']);
        }

        if ($user->isLocked()) {
            return back()->withErrors(['username' => 'Akun terkunci sementara. Silakan coba lagi nanti atau hubungi admin.']);
        }

        if (Hash::check($request->password, $user->password)) {
            RateLimiter::clear($key);
            
            $user->update([
                'failed_login_attempts' => 0,
                'locked_until' => null
            ]);

            Auth::login($user);
            $request->session()->regenerate();

            if ($user->isAdmin()) {
                return redirect()->intended(route('admin.dashboard'));
            }
            return redirect()->intended(route('petugas.dashboard'));
        }

        RateLimiter::hit($key);
        
        $attempts = $user->failed_login_attempts + 1;
        $locked_until = $attempts >= 10 ? now()->addMinutes(30) : null;

        $user->update([
            'failed_login_attempts' => $attempts,
            'locked_until' => $locked_until
        ]);

        return back()->withErrors(['username' => 'Username atau password salah.']);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }
}