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

    const header = !isMobile ? (
        <header className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href={`/petugas/wilayah/${warga.rt_id}`} className="btn-link" style={{ color: 'var(--text-soft)' }}>&larr; Batal</Link>
                <div>
                    <h2 className="page-title">Update Status Warga</h2>
                    <p className="page-sub">Laporkan kendala kunjungan</p>
                </div>
            </div>
        </header>
    ) : undefined;

    const content = (
        <>
            <div style={{ marginBottom: '20px' }}>
                {isMobile && (
                    <Link href={`/petugas/wilayah/${warga.rt_id}`} className="btn-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                        Kembali
                    </Link>
                )}
            </div>

            <div style={{ background: 'var(--card)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--line)', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 600 }}>{warga.nama}</h3>
                <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '14px' }}>{warga.alamat}</p>
                {warga.jumlah_kunjungan >= 3 && (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'var(--maroon-soft)', color: 'var(--maroon)', borderRadius: '6px', fontSize: '13px', display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>??</span>
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
                    <span style={{ fontSize: '32px' }}>??</span>
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
                    <span style={{ fontSize: '32px' }}>?</span>
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
                content
            ) : (
                <div className="content-narrow" style={{ paddingTop: '24px' }}>
                    {content}
                </div>
            )}

            {confirmModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
                        <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 600 }}>Konfirmasi Laporan</h3>
                        <p style={{ margin: '0 0 20px', color: 'var(--text-soft)', fontSize: '14px', lineHeight: 1.5 }}>
                            Anda yakin ingin melaporkan <strong>{warga.nama}</strong> sebagai <span style={{ fontWeight: 600 }}>{confirmModal === 'tidak_ditemukan' ? 'Tidak Ditemukan' : 'Menolak Memilih'}</span>?
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => setConfirmModal(null)}
                                style={{ padding: '10px 16px', border: '1px solid var(--line)', background: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                            >
                                Batal
                            </button>
                            <button 
                                onClick={() => handleUpdate(confirmModal)}
                                style={{ padding: '10px 16px', border: 'none', background: 'var(--ink)', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
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
