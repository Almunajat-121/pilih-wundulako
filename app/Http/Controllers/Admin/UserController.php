<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Rt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('rts')->get()->map(function($user) {
            $user->wilayah = $user->rts;
            return $user;
        });
        return Inertia::render('Admin/Pengguna', [
            'users' => $users,
            'rt_list' => Rt::with('rw')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:150',
            'username' => 'required|string|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,petugas'
        ]);

        User::create([
            'nama' => $request->nama,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => true,
        ]);
        return back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'nama' => 'required|string|max:150',
            'username' => 'required|string|unique:users,username,' . $user->id,
        ]);
        $user->update($request->only('nama', 'username'));
        return back()->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return back()->with('success', 'Pengguna berhasil dihapus.');
    }

    public function toggleActive(User $user)
    {
        $user->update(['is_active' => !$user->is_active]);
        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Akun berhasil {$status}.");
    }

    public function unlock(User $user)
    {
        $user->update(['failed_login_attempts' => 0, 'locked_until' => null]);
        return back()->with('success', 'Akun berhasil dibuka kuncinya.');
    }

    public function assignWilayah(Request $request, User $user)
    {
        $request->validate([
            'rt_ids' => 'array',
            'rt_ids.*' => 'exists:rts,id'
        ]);
        $user->rts()->sync($request->rt_ids ?? []);
        return back()->with('success', 'Wilayah tugas berhasil diperbarui.');
    }

    public function resetPassword(Request $request, User $user)
    {
        $request->validate(['password' => 'required|string|min:8']);
        $user->update(['password' => Hash::make($request->password)]);
        return back()->with('success', 'Password berhasil direset.');
    }
}