import React, { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import { Warga, Kandidat } from '@/types';
import LoadingButton from '@/Components/LoadingButton';
import { useIsMobile } from '@/lib/useIsMobile';

interface Props {
    warga: Warga;
    kandidat_rt: Kandidat[];
    kandidat_rw: Kandidat[];
}

export default function FormVote({ warga, kandidat_rt, kandidat_rw }: Props) {
    const isMobile = useIsMobile();
    const [verifikasi, setVerifikasi] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    const { data, setData, post, processing } = useForm({
        kandidat_rt_id: '',
        kandidat_rw_id: '',
        verifikasi_identitas: false,
        idempotency_key: crypto.randomUUID(),
    });

    const needsRt = warga.status_vote_rt === 'belum_dikunjungi';
    const needsRw = warga.status_vote_rw === 'belum_dikunjungi';

    const handleConfirm = () => {
        post(`/petugas/warga/${warga.id}/vote`);
    };

    const header = isMobile ? (
        <header className="m-header-plain">
            <Link href={`/petugas/wilayah/${warga.rt_id}`} className="back-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </Link>
            <div>
                <h2 className="m-header-title">Form Pemilihan</h2>
                <p className="m-sub">Bilik suara digital</p>
            </div>
        </header>
    ) : (
        <header className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href={`/petugas/wilayah/${warga.rt_id}`} className="btn-link" style={{ color: 'var(--text-soft)' }}>&larr; Batal</Link>
                <div>
                    <h2 className="page-title">Bilik Suara</h2>
                    <p className="page-sub">Input perolehan suara warga</p>
                </div>
            </div>
        </header>
    );

    const getSelectedName = (kandidatList: Kandidat[], selectedId: string) => {
        if (!selectedId) return 'Belum dipilih';
        if (selectedId === 'abstain') return 'Tidak memilih (abstain)';
        return kandidatList.find(k => k.id.toString() === selectedId)?.nama || 'Unknown';
    };

    const content = (
        <>
            <div className="section-block">
                <p className="eyebrow">Data pemilih</p>
                <div className="voter-card">
                    <div>
                        <h3 className="voter-name">{warga.nama}</h3>
                        <p className="voter-nik mono">Alamat: {warga.alamat}</p>
                    </div>
                </div>
                <div className="callout callout-brass">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
                    <div className="verify-row" style={{ alignItems: 'flex-start' }}>
                        <input 
                            type="checkbox" 
                            id="verify" 
                            checked={verifikasi}
                            onChange={(e) => {
                                setVerifikasi(e.target.checked);
                                setData('verifikasi_identitas', e.target.checked);
                            }}
                        />
                        <label htmlFor="verify" style={{ fontSize: '13px', lineHeight: 1.5, cursor: 'pointer' }}>
                            Saya sebagai petugas menyatakan bahwa warga ini benar-benar diverifikasi identitasnya.
                        </label>
                    </div>
                </div>
            </div>

            {verifikasi && needsRt && (
                <div className="section-block">
                    <h2 className="section-h">Pemilihan Ketua RT</h2>
                    <div className="vote-list">
                        {kandidat_rt.map(k => (
                            <label key={k.id} className="vote-option">
                                <div className="cand-row">
                                    <div className="cand-num">{k.nomor_urut}</div>
                                    <div>
                                        <p className="cand-name">{k.nama}</p>
                                        {k.visi_misi && <p className="cand-visi">Visi: {k.visi_misi.substring(0, 50)}...</p>}
                                    </div>
                                </div>
                                <input 
                                    type="radio" 
                                    name="rt" 
                                    value={k.id}
                                    checked={data.kandidat_rt_id === k.id.toString()}
                                    onChange={(e) => setData('kandidat_rt_id', e.target.value)}
                                />
                            </label>
                        ))}
                        <label className="vote-option abstain">
                            <span className="abstain-label">Tidak memilih (abstain)</span>
                            <input 
                                type="radio" 
                                name="rt" 
                                value="abstain"
                                checked={data.kandidat_rt_id === 'abstain'}
                                onChange={(e) => setData('kandidat_rt_id', e.target.value)}
                            />
                        </label>
                    </div>
                </div>
            )}

            {verifikasi && needsRw && (
                <div className="section-block">
                    <h2 className="section-h">Pemilihan Ketua RW</h2>
                    <div className="vote-list">
                        {kandidat_rw.map(k => (
                            <label key={k.id} className="vote-option">
                                <div className="cand-row">
                                    <div className="cand-num">{k.nomor_urut}</div>
                                    <div>
                                        <p className="cand-name">{k.nama}</p>
                                        {k.visi_misi && <p className="cand-visi">Visi: {k.visi_misi.substring(0, 50)}...</p>}
                                    </div>
                                </div>
                                <input 
                                    type="radio" 
                                    name="rw" 
                                    value={k.id}
                                    checked={data.kandidat_rw_id === k.id.toString()}
                                    onChange={(e) => setData('kandidat_rw_id', e.target.value)}
                                />
                            </label>
                        ))}
                        <label className="vote-option abstain">
                            <span className="abstain-label">Tidak memilih (abstain)</span>
                            <input 
                                type="radio" 
                                name="rw" 
                                value="abstain"
                                checked={data.kandidat_rw_id === 'abstain'}
                                onChange={(e) => setData('kandidat_rw_id', e.target.value)}
                            />
                        </label>
                    </div>
                </div>
            )}
        </>
    );

    const isReady = verifikasi && 
                   (!needsRt || data.kandidat_rt_id !== '') && 
                   (!needsRw || data.kandidat_rw_id !== '');

    return (
        <PetugasLayout title="Form Pemilihan" customHeader={header}>
            {isMobile ? (
                <div className="flex flex-col gap-6 pt-2 pb-24" style={{ padding: '0 18px' }}>
                    {content}
                </div>
            ) : (
                <div className="content-narrow" style={{ paddingBottom: '100px', paddingTop: '20px' }}>
                    <div className="card">
                        {content}
                    </div>
                </div>
            )}

            <div className={isMobile ? "fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 max-w-[480px] mx-auto" : "sticky-footer"} style={!isMobile ? { maxWidth: '760px', margin: '0 auto' } : {}}>
                <button 
                    type="button" 
                    className="btn-block"
                    disabled={!isReady} 
                    onClick={() => setShowConfirm(true)}
                    style={{ opacity: isReady ? 1 : 0.5 }}
                >
                    Konfirmasi Suara
                </button>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Final</h3>
                        <p className="text-gray-600 mb-6 text-sm">Periksa kembali pilihan warga sebelum menyimpan. Suara yang sudah disimpan tidak bisa diubah.</p>
                        
                        <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-lg">
                            {needsRt && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Pilihan Ketua RT</p>
                                    <p className="font-bold">{getSelectedName(kandidat_rt, data.kandidat_rt_id)}</p>
                                </div>
                            )}
                            {needsRw && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Pilihan Ketua RW</p>
                                    <p className="font-bold">{getSelectedName(kandidat_rw, data.kandidat_rw_id)}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Batal</button>
                            <LoadingButton processing={processing} onClick={handleConfirm} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">
                                Ya, Simpan Suara
                            </LoadingButton>
                        </div>
                    </div>
                </div>
            )}
        </PetugasLayout>
    );
}
