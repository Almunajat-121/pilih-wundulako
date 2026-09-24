<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_wilayah', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('rt_id')->constrained('rt')->cascadeOnDelete();
            $table->timestamps();
            
            $table->unique(['user_id', 'rt_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_wilayah');
    }
};
