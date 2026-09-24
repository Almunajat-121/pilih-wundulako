<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VotingConfig;

class VotingConfigSeeder extends Seeder
{
    public function run(): void
    {
        VotingConfig::create([
            'voting_aktif_global' => true,
            'tampilkan_live_count' => true
        ]);
    }
}
