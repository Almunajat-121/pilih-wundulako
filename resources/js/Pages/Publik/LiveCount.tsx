import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import PublicLayout from '../../Layouts/PublicLayout';
import { LiveCountData } from '../../types';

interface LiveCountProps {
    data: LiveCountData | null;
    hidden: boolean;
}

export default function LiveCount({ data, hidden }: LiveCountProps) {
    const [filterRw, setFilterRw] = useState<string>('Semua');

    useEffect(() => {
        if (!hidden) {
            const interval = setInterval(() => {
                router.reload({ preserveState: true, preserveScroll: true });
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [hidden]);

    if (hidden || !data) {
        return (
            <PublicLayout>
                <div className="bg-white rounded-xl shadow-md p-10 text-center border border-gray-100 my-10">
                    <div className="text-6xl mb-4">dY"Z</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Voting Sedang Berlangsung</h2>
                    <p className="text-gray-600">Hasil pemilihan akan ditampilkan setelah proses voting selesai.</p>
                </div>
            </PublicLayout>
        );
    }

    // Process data
    const rwList = ['Semua', ...Array.from(new Set(data.kandidat.filter(k => k.jenis === 'RW').map(k => k.wilayah_nama)))];
    
    let filteredKandidatRt = data.kandidat.filter(k => k.jenis === 'RT');
    let filteredKandidatRw = data.kandidat.filter(k => k.jenis === 'RW');

    if (filterRw !== 'Semua') {
        filteredKandidatRw = filteredKandidatRw.filter(k => k.wilayah_nama === filterRw);
        // Note: In real app, we need to know which RT belongs to which RW to filter RT properly. 
        // Here we just show all RT if filtered by RW, or assume wilayah_nama contains RW info (e.g. "RT 01 / RW 02")
    }

    // Group RT by wilayah
    const groupedRt = filteredKandidatRt.reduce((acc, curr) => {
        if (!acc[curr.wilayah_nama]) acc[curr.wilayah_nama] = [];
        acc[curr.wilayah_nama].push(curr);
        return acc;
    }, {} as Record<string, typeof filteredKandidatRt>);

    // Group RW by wilayah
    const groupedRw = filteredKandidatRw.reduce((acc, curr) => {
        if (!acc[curr.wilayah_nama]) acc[curr.wilayah_nama] = [];
        acc[curr.wilayah_nama].push(curr);
        return acc;
    }, {} as Record<string, typeof filteredKandidatRw>);

    return (
        <PublicLayout>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-blue-800 mb-1">Total suara masuk:</p>
                <p className="text-2xl font-bold text-blue-900">{Math.max(data.total_sudah_memilih_rt, data.total_sudah_memilih_rw)} <span className="text-lg font-normal">dari {data.total_warga} warga</span></p>
                <div className="w-full max-w-md mx-auto bg-blue-200 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (Math.max(data.total_sudah_memilih_rt, data.total_sudah_memilih_rw) / Math.max(1, data.total_warga)) * 100)}%` }}></div>
                </div>
            </div>

            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
                {rwList.map(rw => (
                    <button 
                        key={rw} 
                        onClick={() => setFilterRw(rw)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterRw === rw ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                    >
                        {rw}
                    </button>
                ))}
            </div>

            <div className="space-y-8">
                {/* Ketua RW Section */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 mb-4 inline-block">Hasil Pemilihan Ketua RW</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(groupedRw).map(([wilayah, kandidats]) => (
                            <div key={wilayah} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <h3 className="font-bold text-gray-700 mb-4 bg-indigo-50 px-3 py-1 rounded inline-block text-sm">{wilayah}</h3>
                                <div className="space-y-4">
                                    {kandidats.sort((a,b) => b.jumlah_suara - a.jumlah_suara).map(k => (
                                        <div key={k.id}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-800">{k.nomor_urut}. {k.nama}</span>
                                                <span className="font-bold">{k.jumlah_suara} ({k.persentase.toFixed(1)}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                                <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${k.persentase}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Ketua RT Section */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2 mb-4 inline-block mt-4">Hasil Pemilihan Ketua RT</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(groupedRt).map(([wilayah, kandidats]) => (
                            <div key={wilayah} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                <h3 className="font-bold text-gray-700 mb-4 bg-blue-50 px-3 py-1 rounded inline-block text-sm">{wilayah}</h3>
                                <div className="space-y-4">
                                    {kandidats.sort((a,b) => b.jumlah_suara - a.jumlah_suara).map(k => (
                                        <div key={k.id}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-medium text-gray-800">{k.nomor_urut}. {k.nama}</span>
                                                <span className="font-bold">{k.jumlah_suara} ({k.persentase.toFixed(1)}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                                <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${k.persentase}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="mt-8 text-center text-sm text-gray-400">
                Terakhir diperbarui: {new Date(data.terakhir_diperbarui).toLocaleString()}
            </div>
        </PublicLayout>
    );
}
