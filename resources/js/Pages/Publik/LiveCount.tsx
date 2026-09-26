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
            <div className="public-hero">
                <div className="public-brand">
                    <div className="public-mark">
                        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l4.5 4.5L20 6"/></svg>
                    </div>
                    <span style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 600 }}>PilihPilih</span>
                </div>
                <h1 className="public-title">Live Count Pemilihan RT/RW</h1>
                <p className="public-sub">Kelurahan Wundulako &middot; hasil suara sah, diperbarui otomatis</p>
                <div className="live-pill">
                    <span className="live-dot"></span> Voting sedang berjalan &middot; diperbarui {new Date(data.terakhir_diperbarui).toLocaleTimeString('id-ID')} WITA
                </div>
            </div>

            <div className="stat-strip">
                <div className="stat-box">
                    <p className="stat-box-label">Total suara masuk</p>
                    <p className="stat-box-value num">{Math.max(data.total_sudah_memilih_rt, data.total_sudah_memilih_rw)}</p>
                </div>
                <div className="stat-box">
                    <p className="stat-box-label">Dari total DPT</p>
                    <p className="stat-box-value num">{data.total_warga}</p>
                </div>
                <div className="stat-box">
                    <p className="stat-box-label">Progres kelurahan</p>
                    <p className="stat-box-value num" style={{ color: 'var(--brass)' }}>
                        {data.total_warga > 0 ? Math.round((Math.max(data.total_sudah_memilih_rt, data.total_sudah_memilih_rw) / data.total_warga) * 100) : 0}%
                    </p>
                </div>
            </div>

            <div className="tabs-pill no-scrollbar">
                {rwList.map(rw => (
                    <button 
                        key={rw} 
                        onClick={() => setFilterRw(rw)}
                        className={`tab-pill ${filterRw === rw ? 'active' : ''}`}
                    >
                        {rw}
                    </button>
                ))}
            </div>

            {/* Ketua RW Section */}
            {Object.entries(groupedRw).map(([wilayah, kandidats]) => {
                const totalSuaraWilayah = kandidats.reduce((sum, k) => sum + k.jumlah_suara, 0);
                return (
                    <div key={`rw-${wilayah}`} className="result-card">
                        <div className="result-head">
                            <h2>Pemilihan Ketua {wilayah}</h2>
                            <span>{totalSuaraWilayah} suara sah</span>
                        </div>
                        {kandidats.sort((a,b) => b.jumlah_suara - a.jumlah_suara).map((k, index) => (
                            <div key={k.id} className="result-row">
                                <div className="result-row-top">
                                    <div className="result-left">
                                        <div className="result-num">{k.nomor_urut}</div>
                                        <div>
                                            <p className="result-name">{k.nama}</p>
                                            <p className="result-votes num">{k.jumlah_suara} suara</p>
                                        </div>
                                    </div>
                                    <div className="result-pct" style={index > 0 ? { color: 'var(--text-soft)' } : {}}>
                                        {k.persentase.toFixed(1)}%
                                    </div>
                                </div>
                                <div className="result-bar-bg">
                                    <div className="result-bar-fill" style={{ width: `${k.persentase}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}

            {/* Ketua RT Section */}
            {Object.entries(groupedRt).map(([wilayah, kandidats]) => {
                const totalSuaraWilayah = kandidats.reduce((sum, k) => sum + k.jumlah_suara, 0);
                return (
                    <div key={`rt-${wilayah}`} className="result-card">
                        <div className="result-head">
                            <h2>Pemilihan Ketua {wilayah}</h2>
                            <span>{totalSuaraWilayah} suara sah</span>
                        </div>
                        {kandidats.sort((a,b) => b.jumlah_suara - a.jumlah_suara).map((k, index) => (
                            <div key={k.id} className="result-row">
                                <div className="result-row-top">
                                    <div className="result-left">
                                        <div className="result-num">{k.nomor_urut}</div>
                                        <div>
                                            <p className="result-name">{k.nama}</p>
                                            <p className="result-votes num">{k.jumlah_suara} suara</p>
                                        </div>
                                    </div>
                                    <div className="result-pct" style={index > 0 ? { color: 'var(--text-soft)' } : {}}>
                                        {k.persentase.toFixed(1)}%
                                    </div>
                                </div>
                                <div className="result-bar-bg">
                                    <div className="result-bar-fill" style={{ width: `${k.persentase}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}

            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-soft)', marginTop: '8px' }}>
                Data agregat saja &middot; identitas pemilih tidak ditampilkan ke publik
            </p>
        </PublicLayout>
    );
}
