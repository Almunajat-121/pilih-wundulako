<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warga_id')->constrained('warga')->cascadeOnDelete();
            $table->foreignId('kandidat_id')->constrained('kandidat')->cascadeOnDelete();
            $table->enum('jenis', ['RT', 'RW']);
            $table->foreignId('petugas_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['valid', 'void'])->default('valid');
            $table->text('alasan_void')->nullable();
            $table->string('idempotency_key', 100)->unique();
            $table->timestamps();
            
            $table->index(['warga_id', 'jenis']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};
