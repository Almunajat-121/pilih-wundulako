<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('kandidat', function (Blueprint $table) {
            $table->renameColumn('visi_misi', 'visi');
        });
        Schema::table('kandidat', function (Blueprint $table) {
            $table->text('misi')->nullable()->after('visi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kandidat', function (Blueprint $table) {
            $table->dropColumn('misi');
        });
        Schema::table('kandidat', function (Blueprint $table) {
            $table->renameColumn('visi', 'visi_misi');
        });
    }
};
