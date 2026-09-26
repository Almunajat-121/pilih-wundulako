import React, { useEffect } from 'react';
import { usePage, router, Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps, Kandidat } from '../../types';

interface DashboardProps extends PageProps {
    stats: {
        total_warga: number;
        sudah_memilih_rt: number;
        sudah_memilih_rw: number;
        belum_dikunjungi: number;
        tidak_ditemukan: number;
        menolak: number;
    };
    progres_per_rw: Array<{
        rw_nama: string;
        total: number;
        sudah_rt: number;
        sudah_rw: number;
        persen_rt: number;
        persen_rw: number;
    }>;
    kandidat_rt: Kandidat[];
    kandidat_rw: Kandidat[];
}

export default function Dashboard({ stats, progres_per_rw, kandidat_rt, kandidat_rw }: DashboardProps) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ preserveState: true, preserveScroll: true });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AdminLayout title="Dashboard">
            <div className="grid-stats">
                <div className="stat" style={{ '--bar': 'var(--ink)' } as React.CSSProperties}>
                    <p className="stat-label">Total warga DPT</p>
                    <p className="stat-value num">{stats.total_warga}</p>
                </div>
                <div className="stat" style={{ '--bar': 'var(--moss)' } as React.CSSProperties}>
                    <p className="stat-label">Sudah memilih (RW)</p>
                    <p className="stat-value num" style={{ color: 'var(--moss)' }}>{stats.sudah_memilih_rw}</p>
                </div>
                <div className="stat" style={{ '--bar': 'var(--brass)' } as React.CSSProperties}>
                    <p className="stat-label">Belum dikunjungi</p>
                    <p className="stat-value num" style={{ color: 'var(--brass)' }}>{stats.belum_dikunjungi}</p>
                </div>
                <div className="stat" style={{ '--bar': 'var(--maroon)' } as React.CSSProperties}>
                    <p className="stat-label">Tidak ditemukan / menolak</p>
                    <p className="stat-value num" style={{ color: 'var(--maroon)' }}>{stats.tidak_ditemukan + stats.menolak}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', alignItems: 'start' }}>
                <div className="card">
                    <div className="card-head">
                        <h3>Progres per wilayah</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-soft)' }}>Diperbarui otomatis tiap kunjungan tersimpan</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Wilayah</th>
                                <th>Total DPT</th>
                                <th>Suara masuk (RW)</th>
                                <th>Progres</th>
                            </tr>
                        </thead>
                        <tbody>
                            {progres_per_rw.map((rw, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontWeight: 600 }}>{rw.rw_nama}</td>
                                    <td className="num">{rw.total}</td>
                                    <td className="num" style={{ color: 'var(--moss)', fontWeight: 600 }}>{rw.sudah_rw}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="progress" style={{ maxWidth: '150px' }}>
                                                <span style={{ width: `${rw.persen_rw}%` }}></span>
                                            </div>
                                            <span className="num" style={{ fontSize: '12.5px', color: 'var(--text-soft)' }}>{rw.persen_rw.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {progres_per_rw.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '20px' }}>Tidak ada data wilayah</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card">
                        <div className="card-head">
                            <h3>Perolehan suara &mdash; Ketua RW Teratas</h3>
                        </div>
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {kandidat_rw.slice(0, 3).map((kandidat, idx) => (
                                <div key={kandidat.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: 500 }}>{kandidat.nomor_urut}&nbsp;&nbsp;{kandidat.nama} <span className="tag" style={{ marginLeft: 8 }}>{kandidat.rw?.nama}</span></span>
                                        <span className="num" style={{ fontWeight: 600 }}>{kandidat.jumlah_suara}</span>
                                    </div>
                                    <div className="progress">
                                        <span style={{ width: `${kandidat.persentase || 0}%`, background: idx === 0 ? 'var(--ink)' : 'var(--brass)' }}></span>
                                    </div>
                                </div>
                            ))}
                            {kandidat_rw.length === 0 && (
                                <p style={{ fontSize: '13px', color: 'var(--text-soft)', margin: 0, textAlign: 'center' }}>Belum ada data kandidat</p>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-head">
                            <h3>Perolehan suara &mdash; Ketua RT Teratas</h3>
                        </div>
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {kandidat_rt.slice(0, 3).map((kandidat, idx) => (
                                <div key={kandidat.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: 500 }}>{kandidat.nomor_urut}&nbsp;&nbsp;{kandidat.nama} <span className="tag" style={{ marginLeft: 8 }}>{kandidat.rt?.nama}</span></span>
                                        <span className="num" style={{ fontWeight: 600 }}>{kandidat.jumlah_suara}</span>
                                    </div>
                                    <div className="progress">
                                        <span style={{ width: `${kandidat.persentase || 0}%`, background: idx === 0 ? 'var(--moss)' : 'var(--slate)' }}></span>
                                    </div>
                                </div>
                            ))}
                            {kandidat_rt.length === 0 && (
                                <p style={{ fontSize: '13px', color: 'var(--text-soft)', margin: 0, textAlign: 'center' }}>Belum ada data kandidat</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
