<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Rw;
use App\Models\Rt;
use App\Models\Warga;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\RwController;
use App\Http\Controllers\Admin\RtController;
use App\Http\Controllers\Admin\WargaController;

class TestWilayahWarga extends Command
{
    protected $signature = 'test:wilayah-warga';
    protected $description = 'Test all functions of Wilayah and Warga';

    public function handle()
    {
        $this->info("Starting Tests...");
        
        $rwController = new RwController();
        
        $this->info("Testing RW Creation...");
        $request = Request::create('/admin/rw', 'POST', ['nama' => 'RW Testing ' . rand(100, 999)]);
        $rwController->store($request);
        $rw = Rw::orderBy('id', 'desc')->first();
        $this->info("Created RW: {$rw->nama} (ID: {$rw->id})");

        $this->info("Testing RW Update...");
        $newName = 'RW Updated ' . rand(100, 999);
        $request = Request::create('/admin/rw/'.$rw->id, 'PUT', ['nama' => $newName]);
        $rwController->update($request, $rw);
        $rw->refresh();
        $this->info("Updated RW Name: {$rw->nama}");

        $rtController = new RtController();
        
        $this->info("Testing RT Creation...");
        $request = Request::create('/admin/rt', 'POST', ['nama' => 'RT Testing', 'rw_id' => $rw->id]);
        $rtController->store($request);
        $rt = Rt::orderBy('id', 'desc')->first();
        $this->info("Created RT: {$rt->nama} (ID: {$rt->id})");
        
        $this->info("Testing RT Update...");
        $request = Request::create('/admin/rt/'.$rt->id, 'PUT', ['nama' => 'RT Updated']);
        $rtController->update($request, $rt);
        $rt->refresh();
        $this->info("Updated RT Name: {$rt->nama}");

        $this->info("Testing RT Toggle Voting...");
        $oldStatus = $rt->voting_aktif;
        $request = Request::create('/admin/rt/'.$rt->id.'/toggle-voting', 'PUT');
        $rtController->toggleVoting($request, $rt);
        $rt->refresh();
        $this->info("Toggled RT Voting from {$oldStatus} to {$rt->voting_aktif}");

        $wargaController = new WargaController();

        $this->info("Testing Warga Creation...");
        $warga = Warga::create([
            'nama' => 'Warga Testing',
            'alamat' => 'Alamat Testing',
            'rt_id' => $rt->id,
            'tanggal_lahir' => '1990-01-01'
        ]);
        $this->info("Created Warga: {$warga->nama} (ID: {$warga->id})");

        $this->info("Testing Warga Update...");
        $request = Request::create('/admin/warga/'.$warga->id, 'PUT', [
            'nama' => 'Warga Updated',
            'alamat' => 'Alamat Updated',
            'rt_id' => $rt->id,
            'tanggal_lahir' => '1995-05-05'
        ]);
        $wargaController->update($request, $warga);
        $warga->refresh();
        $this->info("Updated Warga Name: {$warga->nama}, DOB: {$warga->tanggal_lahir->format('Y-m-d')}");

        $this->info("Testing RT Deletion Safeguard (should fail)...");
        $response = $rtController->destroy($rt);
        if (session('errors')) {
            $this->info("Safeguard worked! Error: " . session('errors')->first('error'));
        }

        $this->info("Testing RW Deletion Safeguard (should fail)...");
        $response = $rwController->destroy($rw);
        if (session('errors')) {
            $this->info("Safeguard worked! Error: " . session('errors')->first('error'));
        }

        $this->info("Testing Warga Deletion...");
        $wargaController->destroy($warga);
        $this->info("Deleted Warga.");

        $this->info("Testing RT Deletion (should succeed now)...");
        $rtController->destroy($rt);
        $this->info("Deleted RT.");

        $this->info("Testing RW Deletion (should succeed now)...");
        $rwController->destroy($rw);
        $this->info("Deleted RW.");

        $this->info("All tests completed successfully!");
    }
}
