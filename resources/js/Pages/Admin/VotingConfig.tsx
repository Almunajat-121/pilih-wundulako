import React from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps, VotingConfig, Rt } from '../../types';

interface ConfigProps extends PageProps {
    config: VotingConfig;
    rt_list: Rt[];
}

export default function VotingConfigPage({ config, rt_list }: ConfigProps) {
    const handleToggleGlobal = () => {
        if (confirm(`Yakin ingin ${config.voting_aktif_global ? 'menutup' : 'membuka'} voting untuk seluruh kelurahan?`)) {
            router.put('/admin/voting-config/global', { voting_aktif_global: !config.voting_aktif_global });
        }
    };

    const handleToggleLiveCount = () => {
        if (confirm(`Yakin ingin ${config.tampilkan_live_count ? 'menyembunyikan' : 'menampilkan'} live count ke publik?`)) {
            router.put('/admin/voting-config/live-count', { tampilkan_live_count: !config.tampilkan_live_count });
        }
    };

    const handleToggleRt = (id: number, current: boolean) => {
        router.put(`/admin/voting-config/rt/${id}`, { voting_aktif: !current });
    };

    return (
        <AdminLayout title="Pengaturan Voting">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '28px' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px', flex: 1 }}>
                        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, fontFamily: "'Fraunces', serif" }}>Voting Seluruh Kelurahan</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-soft)', lineHeight: 1.5 }}>
                            Mengontrol status voting secara global. Jika dimatikan, semua RT otomatis tidak dapat melakukan voting terlepas dari pengaturan per-RT.
                        </p>
                    </div>
                    <div style={{ padding: '16px 24px', background: 'var(--paper)', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600, color: config.voting_aktif_global ? 'var(--moss)' : 'var(--maroon)' }}>
                            <span className={`dot ${config.voting_aktif_global ? '' : 'dot-off'}`}></span>
                            {config.voting_aktif_global ? 'Voting Berjalan' : 'Voting Dihentikan'}
                        </span>
                        <button onClick={handleToggleGlobal} className={config.voting_aktif_global ? 'btn btn-danger' : 'btn btn-primary'}>
                            {config.voting_aktif_global ? 'Hentikan Global' : 'Mulai Global'}
                        </button>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '24px', flex: 1 }}>
                        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, fontFamily: "'Fraunces', serif" }}>Tampilkan Live Count ke Publik</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-soft)', lineHeight: 1.5 }}>
                            Jika diaktifkan, warga dapat melihat perolehan suara secara langsung melalui halaman publik. Disarankan diaktifkan setelah voting selesai.
                        </p>
                    </div>
                    <div style={{ padding: '16px 24px', background: 'var(--paper)', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600, color: config.tampilkan_live_count ? 'var(--moss)' : 'var(--slate)' }}>
                            <span className="dot" style={{ background: config.tampilkan_live_count ? 'var(--moss)' : 'var(--slate)' }}></span>
                            {config.tampilkan_live_count ? 'Ditampilkan' : 'Disembunyikan'}
                        </span>
                        <button onClick={handleToggleLiveCount} className={config.tampilkan_live_count ? 'btn btn-outline' : 'btn btn-primary'}>
                            {config.tampilkan_live_count ? 'Sembunyikan' : 'Tampilkan Publik'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-head">
                    <h3>Pengaturan per RT</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Wilayah RT</th>
                                <th>Wilayah RW</th>
                                <th style={{ textAlign: 'center' }}>Status Voting</th>
                                <th style={{ textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rt_list.map(rt => (
                                <tr key={rt.id} className={!rt.voting_aktif ? 'row-flag' : ''}>
                                    <td style={{ fontWeight: 600 }}>{rt.nama}</td>
                                    <td style={{ color: 'var(--text-soft)' }}>{rt.rw?.nama}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {rt.voting_aktif ? (
                                            <span className="badge badge-moss">Aktif</span>
                                        ) : (
                                            <span className="badge badge-maroon">Ditutup</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleToggleRt(rt.id, rt.voting_aktif)} 
                                            disabled={!config.voting_aktif_global}
                                            className={rt.voting_aktif ? "btn-link danger" : "btn-link"}
                                            style={{ opacity: !config.voting_aktif_global ? 0.5 : 1, cursor: !config.voting_aktif_global ? 'not-allowed' : 'pointer' }}
                                        >
                                            {rt.voting_aktif ? 'Tutup Voting' : 'Buka Voting'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
