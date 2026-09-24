<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Petugas\DashboardController as PetugasDashboardController;
use App\Http\Controllers\Petugas\WargaController as PetugasWargaController;
use App\Http\Controllers\Petugas\VoteController as PetugasVoteController;
use App\Http\Controllers\Petugas\KunjunganController as PetugasKunjunganController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\RwController;
use App\Http\Controllers\Admin\RtController;
use App\Http\Controllers\Admin\KandidatController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WargaController as AdminWargaController;
use App\Http\Controllers\Admin\AuditController;
use App\Http\Controllers\Admin\VotingConfigController;
use App\Http\Controllers\Admin\LaporanController;
use App\Http\Controllers\Publik\LiveCountController;

// Public
Route::get('/', fn() => redirect('/publik'));
Route::get('/publik', [LiveCountController::class, 'index'])->name('publik.live-count');

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
});
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth')->name('logout');

// Password change
Route::middleware('auth')->group(function () {
    Route::get('/ganti-password', [PasswordController::class, 'showForm'])->name('password.change.form');
    Route::put('/ganti-password', [PasswordController::class, 'update'])->name('password.change');
});

// Petugas routes
Route::middleware(['auth', 'role:petugas'])->prefix('petugas')->name('petugas.')->group(function () {
    Route::get('/dashboard', [PetugasDashboardController::class, 'index'])->name('dashboard');
    
    Route::get('/wilayah/{rt}', [PetugasWargaController::class, 'index'])->name('wilayah.warga');
    Route::get('/wilayah/{rt}/warga/baru', [PetugasWargaController::class, 'create'])->name('wilayah.warga.baru');
    Route::post('/wilayah/{rt}/warga', [PetugasWargaController::class, 'store'])->name('wilayah.warga.store');
    
    Route::get('/warga/{warga}/vote', [PetugasVoteController::class, 'create'])->name('warga.vote');
    // Note: middleware('voting.aktif') assuming it will be created, otherwise remove or rely on service validation
    Route::post('/warga/{warga}/vote', [PetugasVoteController::class, 'store'])->name('warga.vote.store');
    
    Route::put('/warga/{warga}/status', [PetugasKunjunganController::class, 'update'])->name('warga.status.update');
});

// Admin routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // CRUD Wilayah
    Route::resource('rw', RwController::class)->except(['show', 'create', 'edit']);
    Route::resource('rt', RtController::class)->only(['store', 'update', 'destroy']);
    Route::put('/rt/{rt}/toggle-voting', [RtController::class, 'toggleVoting'])->name('rt.toggle-voting');
    
    // CRUD Kandidat
    Route::resource('kandidat', KandidatController::class)->except(['show', 'create', 'edit']);
    
    // CRUD Pengguna
    Route::resource('pengguna', UserController::class)->except(['show', 'create', 'edit']);
    Route::put('/pengguna/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('pengguna.toggle-active');
    Route::put('/pengguna/{user}/unlock', [UserController::class, 'unlock'])->name('pengguna.unlock');
    Route::put('/pengguna/{user}/assign-wilayah', [UserController::class, 'assignWilayah'])->name('pengguna.assign-wilayah');
    Route::put('/pengguna/{user}/reset-password', [UserController::class, 'resetPassword'])->name('pengguna.reset-password');
    
    // Warga
    Route::get('/warga', [AdminWargaController::class, 'index'])->name('warga.index');
    Route::put('/warga/{warga}', [AdminWargaController::class, 'update'])->name('warga.update');
    Route::delete('/warga/{warga}', [AdminWargaController::class, 'destroy'])->name('warga.destroy');
    Route::get('/warga/{warga}/foto', [AdminWargaController::class, 'showFoto'])->name('warga.foto');
    Route::get('/warga/foto/view', [AdminWargaController::class, 'viewFoto'])->name('warga.foto.view');
    
    // Audit
    Route::get('/audit/votes', [AuditController::class, 'indexVotes'])->name('audit.votes');
    Route::get('/audit/status-logs', [AuditController::class, 'indexStatusLogs'])->name('audit.status-logs');
    Route::put('/audit/votes/{vote}/void', [AuditController::class, 'voidVote'])->name('audit.votes.void');
    
    // Voting Config
    Route::get('/voting-config', [VotingConfigController::class, 'show'])->name('voting-config.show');
    Route::put('/voting-config/global', [VotingConfigController::class, 'updateGlobal'])->name('voting-config.global');
    Route::put('/voting-config/rt/{rt}', [VotingConfigController::class, 'updatePerRt'])->name('voting-config.rt');
    Route::put('/voting-config/live-count', [VotingConfigController::class, 'updateLiveCount'])->name('voting-config.live-count');
    
    // Laporan
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
    Route::get('/laporan/excel', [LaporanController::class, 'exportExcel'])->name('laporan.excel');
    Route::get('/laporan/pdf', [LaporanController::class, 'exportPdf'])->name('laporan.pdf');
});