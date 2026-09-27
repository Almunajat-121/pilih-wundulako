import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import PetugasLayout from '../../Layouts/PetugasLayout';
import { PageProps, Warga } from '../../types';

interface UpdateStatusProps extends PageProps {
    warga: Warga;
}

export default function UpdateStatus({ warga }: UpdateStatusProps) {
    const [confirmModal, setConfirmModal] = useState<'tidak_ditemukan' | 'menolak' | null>(null);

    const handleUpdate = (status: 'tidak_ditemukan' | 'menolak') => {
        router.put(`/petugas/warga/${warga.id}/status`, { 
            status, 
            jenis: 'both' 
        }, {
            onSuccess: () => setConfirmModal(null)
        });
    };

    return (
        <PetugasLayout title="Update Status Kehadiran">
            <div style={{ marginBottom: '20px' }}>
                <Link href={`/petugas/wilayah/${warga.rt_id}`} className="btn-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                    Kembali
                </Link>
            </div>

            <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, fontFamily: "'Fraunces', serif", margin: '0 0 4px' }}>{warga.nama}</h2>
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-soft)' }}>{warga.alamat}</p>
                <div>
                    <span className="tag">Kunjungan ke-{warga.jumlah_kunjungan + 1}</span>
                </div>
            </div>

            {warga.jumlah_kunjungan >= 3 && (
                <div style={{ padding: '16px', background: 'var(--maroon-soft)', border: '1px solid #E7CFCB', borderRadius: 'var(--radius)', marginBottom: '24px', display: 'flex', gap: '12px' }}>
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--maroon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <div>
                        <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--maroon)', fontSize: '14px' }}>Perhatian</p>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--maroon)' }}>Warga ini sudah 3x tidak ditemukan. Laporkan ke admin untuk tindak lanjut.</p>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
                <button 
                    onClick={() => setConfirmModal('tidak_ditemukan')}
                    className="btn btn-outline"
                    style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: 'auto', background: '#FBFAF7' }}
                >
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="var(--brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
                    <span style={{ fontSize: '15px', fontWeight: 600 }}>Warga Tidak Ditemukan</span>
                </button>
                
                <button 
                    onClick={() => setConfirmModal('menolak')}
                    className="btn btn-outline"
                    style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: 'auto', background: '#FBFAF7' }}
                >
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="var(--maroon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--maroon)' }}>Warga Menolak Memilih</span>
                </button>
            </div>

            {/* Confirmation Modal */}
            {confirmModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,35,51,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '360px', padding: '24px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '20px' }}>
                            {confirmModal === 'tidak_ditemukan' ? (
                                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--maroon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            )}
                            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, fontFamily: "'Fraunces', serif" }}>Konfirmasi Status</h3>
                            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-soft)', lineHeight: 1.5 }}>
                                {confirmModal === 'tidak_ditemukan' 
                                    ? `Tandai warga ${warga.nama} sebagai "Tidak Ditemukan" untuk kunjungan kali ini?` 
                                    : `Tandai warga ${warga.nama} sebagai "Menolak Memilih"? Ini akan membatalkan hak pilihnya secara permanen.`}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setConfirmModal(null)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Batal</button>
                            <button onClick={() => handleUpdate(confirmModal)} className={confirmModal === 'tidak_ditemukan' ? 'btn btn-accent' : 'btn btn-danger'} style={{ flex: 1, justifyContent: 'center' }}>
                                Ya, Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PetugasLayout>
    );
}
