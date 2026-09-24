<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kandidat', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 150);
            $table->integer('nomor_urut');
            $table->enum('jenis', ['RT', 'RW']);
            $table->foreignId('rt_id')->nullable()->constrained('rt')->cascadeOnDelete();
            $table->foreignId('rw_id')->nullable()->constrained('rw')->cascadeOnDelete();
            $table->string('foto_url', 500)->nullable();
            $table->text('visi_misi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kandidat');
    }
};
