<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warga', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 150)->index();
            $table->string('alamat', 255);
            $table->foreignId('rt_id')->constrained('rt')->cascadeOnDelete();
            $table->date('tanggal_lahir')->nullable();
            $table->enum('status_vote_rt', ['belum_dikunjungi', 'sudah_memilih', 'tidak_ditemukan', 'menolak'])->default('belum_dikunjungi');
            $table->enum('status_vote_rw', ['belum_dikunjungi', 'sudah_memilih', 'tidak_ditemukan', 'menolak'])->default('belum_dikunjungi');
            $table->integer('jumlah_kunjungan')->default(0);
            $table->string('foto_ktp_path', 500)->nullable();
            $table->foreignId('dibuat_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warga');
    }
};
