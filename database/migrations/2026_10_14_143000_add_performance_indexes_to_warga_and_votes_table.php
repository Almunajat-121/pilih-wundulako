<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('warga', function (Blueprint $table) {
            $table->index('status_vote_rt', 'idx_warga_status_vote_rt');
            $table->index('status_vote_rw', 'idx_warga_status_vote_rw');
            $table->index(['rt_id', 'status_vote_rt'], 'idx_warga_rt_status_rt');
            $table->index(['rt_id', 'status_vote_rw'], 'idx_warga_rt_status_rw');
        });

        Schema::table('votes', function (Blueprint $table) {
            $table->index(['kandidat_id', 'status'], 'idx_votes_kandidat_status');
            $table->index(['jenis', 'status'], 'idx_votes_jenis_status');
        });
    }

    public function down(): void
    {
        Schema::table('warga', function (Blueprint $table) {
            $table->dropIndex('idx_warga_status_vote_rt');
            $table->dropIndex('idx_warga_status_vote_rw');
            $table->dropIndex('idx_warga_rt_status_rt');
            $table->dropIndex('idx_warga_rt_status_rw');
        });

        Schema::table('votes', function (Blueprint $table) {
            $table->dropIndex('idx_votes_kandidat_status');
            $table->dropIndex('idx_votes_jenis_status');
        });
    }
};
