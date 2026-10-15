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
                router.reload();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [hidden]);

    if (hidden || !data) {
        return (
            <PublicLayout>
                <div className="bg-white rounded-xl shadow-md p-10 text-center border border-gray-100 my-10">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F4EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brass)' }}>
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Voting Sedang Berlangsung</h2>
                    <p className="text-gray-600 mb-6">Hasil pemilihan akan ditampilkan setelah proses voting selesai.</p>
                    
                    <div style={{ marginTop: '24px' }}>
                        <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#EAE7E0', color: 'var(--ink)', borderRadius: '100px', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                            Masuk sebagai Petugas / Admin
                        </a>
                    </div>
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
        filteredKandidatRt = filteredKandidatRt.filter(k => (k.wilayah_nama || '').includes(filterRw));
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div className="public-brand" style={{ marginBottom: 0 }}>
                        <div className="public-mark">
                            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l4.5 4.5L20 6"/></svg>
                        </div>
                        <span style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 600 }}>PilihPilih</span>
                    </div>
                    <a href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(0,0,0,0.06)', color: 'var(--ink)', borderRadius: '100px', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                        Login Petugas
                    </a>
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

            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-soft)', marginTop: '32px', marginBottom: '32px' }}>
                Data agregat saja &middot; identitas pemilih tidak ditampilkan ke publik
            </p>
        </PublicLayout>
    );
}
