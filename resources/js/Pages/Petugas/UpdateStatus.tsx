import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import PetugasLayout from '../../Layouts/PetugasLayout';
import { PageProps, Warga } from '../../types';
import { useIsMobile } from '@/lib/useIsMobile';

interface UpdateStatusProps extends PageProps {
    warga: Warga;
}

export default function UpdateStatus({ warga }: UpdateStatusProps) {
    const isMobile = useIsMobile();
    const [confirmModal, setConfirmModal] = useState<'tidak_ditemukan' | 'menolak' | null>(null);

    const handleUpdate = (status: 'tidak_ditemukan' | 'menolak') => {
        router.put(`/petugas/warga/${warga.id}/status`, { 
            status, 
            jenis: 'both' 
        }, {
            onSuccess: () => setConfirmModal(null)
        });
    };

    const header = isMobile ? (
        <header className="m-header-plain">
            <Link href={`/petugas/wilayah/${warga.rt_id}`} className="back-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </Link>
            <div>
                <h2 className="m-header-title">Update Status Warga</h2>
                <p className="m-sub">Laporkan kendala kunjungan</p>
            </div>
        </header>
    ) : (
        <header className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href={`/petugas/wilayah/${warga.rt_id}`} className="btn-link" style={{ color: 'var(--text-soft)' }}>&larr; Batal</Link>
                <div>
                    <h2 className="page-title">Update Status Warga</h2>
                    <p className="page-sub">Laporkan kendala kunjungan</p>
                </div>
            </div>
        </header>
    );

    const content = (
        <>

            <div style={{ background: 'var(--card)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--line)', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 600 }}>{warga.nama}</h3>
                <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '14px' }}>{warga.alamat}</p>
                {warga.jumlah_kunjungan >= 3 && (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'var(--maroon-soft)', color: 'var(--maroon)', borderRadius: '6px', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        <span>Warga ini sudah 3x dilaporkan tidak ditemukan/menolak.</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                <button 
                    onClick={() => setConfirmModal('tidak_ditemukan')}
                    style={{ background: '#FFF3E0', border: '1px solid #FFE0B2', padding: '24px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'center', transition: 'all 0.2s' }}
                    className="hover:shadow-md"
                >
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFE0B2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E65100', flexShrink: 0 }}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 4px', color: '#E65100', fontSize: '16px', fontWeight: 600 }}>Warga Tidak Ditemukan</h4>
                        <p style={{ margin: 0, color: '#F57C00', fontSize: '13px' }}>Pilih ini jika rumah kosong atau warga sedang pergi saat dikunjungi.</p>
                    </div>
                </button>

                <button 
                    onClick={() => setConfirmModal('menolak')}
                    style={{ background: '#F5F5F5', border: '1px solid #E0E0E0', padding: '24px', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'center', transition: 'all 0.2s' }}
                    className="hover:shadow-md"
                >
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#424242', flexShrink: 0 }}>
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 4px', color: '#424242', fontSize: '16px', fontWeight: 600 }}>Warga Menolak Memilih</h4>
                        <p style={{ margin: 0, color: '#616161', fontSize: '13px' }}>Pilih ini jika warga menolak berpartisipasi dalam pemilihan.</p>
                    </div>
                </button>
            </div>
        </>
    );

    return (
        <PetugasLayout title="Update Status Kehadiran" customHeader={header}>
            {isMobile ? (
                <div style={{ padding: '16px 18px 32px' }}>
                    {content}
                </div>
            ) : (
                <div className="content-narrow" style={{ paddingTop: '24px' }}>
                    {content}
                </div>
            )}

            {confirmModal && (
                <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-badge" style={{ color: 'var(--brass)', background: 'var(--brass-soft)' }}>
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            Laporan Kunjungan
                        </div>

                        <h3 className="modal-title">Konfirmasi Laporan</h3>
                        <p className="modal-desc">
                            Anda akan memperbarui status kehadiran untuk warga ini. Laporan ini akan tercatat dalam log aktivitas sistem.
                        </p>

                        <div className="voter-summary">
                            <div className="voter-summary-item">
                                <span className="item-label">Nama Warga</span>
                                <span className="item-value">{warga.nama}</span>
                            </div>
                            <div className="voter-summary-item">
                                <span className="item-label">Status Baru</span>
                                <span className="item-value" style={{ color: confirmModal === 'tidak_ditemukan' ? 'var(--brass)' : 'var(--maroon)' }}>
                                    {confirmModal === 'tidak_ditemukan' ? 'Tidak Ditemukan' : 'Menolak Memilih'}
                                </span>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button 
                                type="button"
                                onClick={() => setConfirmModal(null)}
                                className="btn btn-outline"
                            >
                                Batal
                            </button>
                            <button 
                                type="button"
                                onClick={() => handleUpdate(confirmModal)}
                                className="btn btn-primary"
                            >
                                Ya, Laporkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PetugasLayout>
    );
}
