<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Rekap Suara Pemilihan RT/RW</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; margin: 30px; }
        h1 { text-align: center; font-size: 16px; margin-bottom: 5px; }
        h2 { text-align: center; font-size: 13px; font-weight: normal; margin-bottom: 20px; color: #555; }
        h3 { font-size: 13px; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; }
        th { background-color: #e0e7ff; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer { margin-top: 30px; font-size: 10px; color: #888; text-align: center; }
        .info { margin-bottom: 15px; font-size: 11px; }
    </style>
</head>
<body>
    <h1>REKAP HASIL PEMILIHAN KETUA RT/RW</h1>
    <h2>Kelurahan Wundulako — {{ $tanggal }}</h2>

    <div class="info">
        Total warga terdaftar: <strong>{{ $total_warga }}</strong>
    </div>

    @if($kandidat_rt->count() > 0)
    <h3>Perolehan Suara Ketua RT</h3>
    <table>
        <thead>
            <tr>
                <th>Wilayah</th>
                <th class="text-center">No. Urut</th>
                <th>Nama Kandidat</th>
                <th class="text-right">Jumlah Suara</th>
                <th class="text-right">Persentase</th>
            </tr>
        </thead>
        <tbody>
            @php $currentRt = null; @endphp
            @foreach($kandidat_rt as $k)
                @php
                    $wilayah = $k->rt ? $k->rt->nama . ' - ' . $k->rt->rw->nama : '-';
                    $total = $kandidat_rt->where('rt_id', $k->rt_id)->sum('votes_count');
                    $persen = $total > 0 ? round(($k->votes_count / $total) * 100, 1) : 0;
                @endphp
                <tr>
                    <td>{{ $wilayah }}</td>
                    <td class="text-center">{{ $k->nomor_urut }}</td>
                    <td>{{ $k->nama }}</td>
                    <td class="text-right">{{ $k->votes_count }}</td>
                    <td class="text-right">{{ $persen }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if($kandidat_rw->count() > 0)
    <h3>Perolehan Suara Ketua RW</h3>
    <table>
        <thead>
            <tr>
                <th>Wilayah</th>
                <th class="text-center">No. Urut</th>
                <th>Nama Kandidat</th>
                <th class="text-right">Jumlah Suara</th>
                <th class="text-right">Persentase</th>
            </tr>
        </thead>
        <tbody>
            @foreach($kandidat_rw as $k)
                @php
                    $wilayah = $k->rw ? $k->rw->nama : '-';
                    $total = $kandidat_rw->where('rw_id', $k->rw_id)->sum('votes_count');
                    $persen = $total > 0 ? round(($k->votes_count / $total) * 100, 1) : 0;
                @endphp
                <tr>
                    <td>{{ $wilayah }}</td>
                    <td class="text-center">{{ $k->nomor_urut }}</td>
                    <td>{{ $k->nama }}</td>
                    <td class="text-right">{{ $k->votes_count }}</td>
                    <td class="text-right">{{ $persen }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="footer">
        Dicetak pada: {{ now()->format('d F Y, H:i') }} WIB — Aplikasi PilihPilih Wundulako
    </div>
</body>
</html>
