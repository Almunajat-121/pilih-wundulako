import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps } from '../../types';

interface LaporanProps extends PageProps {
    stats: {
        total_suara_masuk: number;
        total_warga: number;
        partisipasi: number;
        rt_selesai: number;
        total_rt: number;
    };
}

export default function Laporan({ stats }: LaporanProps) {
    const handleDownload = (type: 'excel' | 'pdf') => {
        window.location.href = `/admin/laporan/${type}`;
    };

    return (
        <AdminLayout title="Laporan & Unduh Data">
            <div className="grid-stats">
                <div className="stat" style={{ '--bar': 'var(--ink)' } as React.CSSProperties}>
                    <p className="stat-label">Total Suara Masuk</p>
                    <h3 className="stat-value">{stats.total_suara_masuk}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: 4, display: 'block' }}>Dari {stats.total_warga} DPT</span>
                </div>
                <div className="stat" style={{ '--bar': 'var(--brass)' } as React.CSSProperties}>
                    <p className="stat-label">Tingkat Partisipasi</p>
                    <h3 className="stat-value">{stats.partisipasi.toFixed(1)}%</h3>
                </div>
                <div className="stat" style={{ '--bar': 'var(--moss)' } as React.CSSProperties}>
                    <p className="stat-label">RT Selesai Pemilihan</p>
                    <h3 className="stat-value">{stats.rt_selesai}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-soft)', marginTop: 4, display: 'block' }}>Dari {stats.total_rt} RT</span>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 600, fontFamily: "'Fraunces', serif", marginBottom: '12px' }}>Unduh Hasil Pemilihan</h2>
                <p style={{ color: 'var(--text-soft)', fontSize: '13.5px', marginBottom: '32px', lineHeight: 1.5, maxWidth: '460px', marginLeft: 'auto', marginRight: 'auto' }}>
                    Pilih format laporan yang ingin Anda unduh. Laporan berisi detail rekapitulasi suara per wilayah dan daftar warga yang telah menggunakan hak pilih.
                </p>
                
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => handleDownload('excel')} className="btn btn-outline" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '180px', height: 'auto' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--moss)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>Download Excel</span>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-soft)', fontWeight: 400 }}>.xlsx</span>
                    </button>
                    
                    <button onClick={() => handleDownload('pdf')} className="btn btn-outline" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '180px', height: 'auto' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--maroon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '32px', height: '32px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15v-4"/><path d="M12 15v-4"/><path d="M15 15v-4"/></svg>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>Download PDF</span>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-soft)', fontWeight: 400 }}>Dokumen Cetak</span>
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}
