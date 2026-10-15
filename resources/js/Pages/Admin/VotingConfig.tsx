import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps, VotingConfig, Rt } from '../../types';
import { useIsMobile } from '../../lib/useIsMobile';

interface ConfigProps extends PageProps {
    config: VotingConfig;
    rt_list: Rt[];
}

interface ConfirmState {
    type: 'global' | 'live_count';
    title: string;
    desc: string;
    warning?: string;
    actionText: string;
    isDanger?: boolean;
}

export default function VotingConfigPage({ config, rt_list }: ConfigProps) {
    const isMobile = useIsMobile();
    const [confirmModal, setConfirmModal] = useState<ConfirmState | null>(null);

    const handleToggleGlobalClick = () => {
        if (config.voting_aktif_global) {
            setConfirmModal({
                type: 'global',
                title: 'Hentikan Voting Global?',
                desc: 'Tindakan ini akan menghentikan seluruh sesi pemilihan di semua RT. Petugas di lapangan tidak dapat menginput suara warga sampai voting dibuka kembali.',
                warning: 'Seluruh bilik suara kelurahan akan dinonaktifkan sementara.',
                actionText: 'Ya, Hentikan Voting',
                isDanger: true,
            });
        } else {
            setConfirmModal({
                type: 'global',
                title: 'Buka Voting Kelurahan?',
                desc: 'Voting akan diaktifkan secara global. Petugas di RT yang aktif dapat segera melakukan proses pemungutan suara.',
                actionText: 'Ya, Buka Voting',
                isDanger: false,
            });
        }
    };

    const handleToggleLiveCountClick = () => {
        if (config.tampilkan_live_count) {
            setConfirmModal({
                type: 'live_count',
                title: 'Sembunyikan Live Count?',
                desc: 'Hasil hitung suara tidak akan dapat diakses publik hingga Anda membukanya kembali.',
                actionText: 'Ya, Sembunyikan',
                isDanger: false,
            });
        } else {
            setConfirmModal({
                type: 'live_count',
                title: 'Tampilkan Live Count ke Publik?',
                desc: 'Perolehan suara saat ini akan dipublikasikan secara langsung di portal publik kelurahan untuk transparansi warga.',
                actionText: 'Ya, Tampilkan Publik',
                isDanger: false,
            });
        }
    };

    const executeConfirm = () => {
        if (!confirmModal) return;
        if (confirmModal.type === 'global') {
            router.put('/admin/voting-config/global', { voting_aktif_global: !config.voting_aktif_global }, {
                onSuccess: () => setConfirmModal(null)
            });
        } else if (confirmModal.type === 'live_count') {
            router.put('/admin/voting-config/live-count', { tampilkan_live_count: !config.tampilkan_live_count }, {
                onSuccess: () => setConfirmModal(null)
            });
        }
    };

    const handleToggleRt = (id: number, current: boolean) => {
        router.put(`/admin/voting-config/rt/${id}`, { voting_aktif: !current });
    };

    return (
        <AdminLayout title="Pengaturan Voting">
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px 22px', flex: 1 }}>
                        <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 600, fontFamily: "'Fraunces', serif" }}>Voting Seluruh Kelurahan</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-soft)', lineHeight: 1.5 }}>
                            Mengontrol status voting secara global. Jika dimatikan, semua RT otomatis tidak dapat melakukan voting terlepas dari pengaturan per-RT.
                        </p>
                    </div>
                    <div style={{ padding: '14px 22px', background: 'var(--paper)', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: config.voting_aktif_global ? 'var(--moss)' : 'var(--maroon)' }}>
                            <span className={`dot ${config.voting_aktif_global ? '' : 'dot-off'}`}></span>
                            {config.voting_aktif_global ? 'Voting Berjalan' : 'Voting Dihentikan'}
                        </span>
                        <button onClick={handleToggleGlobalClick} className={config.voting_aktif_global ? 'btn btn-danger' : 'btn btn-primary'}>
                            {config.voting_aktif_global ? 'Hentikan Global' : 'Mulai Global'}
                        </button>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px 22px', flex: 1 }}>
                        <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 600, fontFamily: "'Fraunces', serif" }}>Tampilkan Live Count ke Publik</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-soft)', lineHeight: 1.5 }}>
                            Jika diaktifkan, warga dapat melihat perolehan suara secara langsung melalui halaman publik. Disarankan diaktifkan setelah voting selesai.
                        </p>
                    </div>
                    <div style={{ padding: '14px 22px', background: 'var(--paper)', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: config.tampilkan_live_count ? 'var(--moss)' : 'var(--slate)' }}>
                            <span className="dot" style={{ background: config.tampilkan_live_count ? 'var(--moss)' : 'var(--slate)' }}></span>
                            {config.tampilkan_live_count ? 'Ditampilkan' : 'Disembunyikan'}
                        </span>
                        <button onClick={handleToggleLiveCountClick} className={config.tampilkan_live_count ? 'btn btn-outline' : 'btn btn-primary'}>
                            {config.tampilkan_live_count ? 'Sembunyikan' : 'Tampilkan Publik'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Pengaturan per RT */}
            {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, fontFamily: "'Fraunces', serif" }}>Pengaturan per RT</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-soft)' }}>{rt_list.length} Wilayah</span>
                    </div>
                    {rt_list.map(rt => (
                        <div className="m-card" key={rt.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{rt.nama}</h4>
                                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-soft)' }}>{rt.rw?.nama}</p>
                                </div>
                                <span className={`badge ${rt.voting_aktif ? 'badge-moss' : 'badge-maroon'}`}>
                                    {rt.voting_aktif ? 'Aktif' : 'Ditutup'}
                                </span>
                            </div>
                            <div className="row-actions" style={{ marginTop: '12px' }}>
                                <button
                                    onClick={() => handleToggleRt(rt.id, rt.voting_aktif)}
                                    disabled={!config.voting_aktif_global}
                                    className={rt.voting_aktif ? "danger" : ""}
                                    style={{
                                        opacity: !config.voting_aktif_global ? 0.5 : 1,
                                        cursor: !config.voting_aktif_global ? 'not-allowed' : 'pointer',
                                        width: '100%',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {rt.voting_aktif ? 'Tutup Voting RT Ini' : 'Buka Voting RT Ini'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className="card-head">
                        <h3>Pengaturan per RT</h3>
                        <span style={{ fontSize: '12.5px', color: 'var(--text-soft)' }}>{rt_list.length} RT terdaftar</span>
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
            )}

            {/* Custom Modal Confirmation */}
            {confirmModal && (
                <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-badge" style={{ color: confirmModal.isDanger ? 'var(--maroon)' : 'var(--brass)', background: confirmModal.isDanger ? 'var(--maroon-soft)' : 'var(--brass-soft)' }}>
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            Konfirmasi Pengaturan
                        </div>

                        <h3 className="modal-title">{confirmModal.title}</h3>
                        <p className="modal-desc">{confirmModal.desc}</p>

                        {confirmModal.warning && (
                            <div className="callout-warning">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                <span>{confirmModal.warning}</span>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button type="button" onClick={() => setConfirmModal(null)} className="btn btn-outline">
                                Batal
                            </button>
                            <button 
                                type="button" 
                                onClick={executeConfirm} 
                                className="btn" 
                                style={{ 
                                    background: confirmModal.isDanger ? 'var(--maroon)' : 'var(--ink)', 
                                    borderColor: confirmModal.isDanger ? 'var(--maroon)' : 'var(--ink)', 
                                    color: '#fff' 
                                }}
                            >
                                {confirmModal.actionText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
