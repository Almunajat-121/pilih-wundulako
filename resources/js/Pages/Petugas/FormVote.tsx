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
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);
    const [modalKandidat, setModalKandidat] = useState<{ kandidat: Kandidat; jenis: 'RT' | 'RW' } | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };
    
    const { data, setData, post, processing, errors } = useForm({
        kandidat_rt_id: '',
        kandidat_rw_id: '',
        verifikasi_identitas: false,
        foto_bukti: null as File | null,
        idempotency_key: crypto.randomUUID(),
    });

    const needsRt = warga.status_vote_rt === 'belum_dikunjungi';
    const needsRw = warga.status_vote_rw === 'belum_dikunjungi';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('foto_bukti', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleConfirm = () => {
        post(`/petugas/warga/${warga.id}/vote`, {
            forceFormData: true,
        });
    };

    const header = isMobile ? (
        <header className="m-header-plain">
            <Link href={`/petugas/wilayah/${warga.rt_id}`} className="back-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
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
                <div className="callout callout-brass" style={{ marginTop: '14px', padding: isMobile ? '13px 14px' : '15px 18px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', width: '100%' }}>
                        <input 
                            type="checkbox" 
                            id="verify" 
                            checked={verifikasi}
                            onChange={(e) => {
                                setVerifikasi(e.target.checked);
                                setData('verifikasi_identitas', e.target.checked);
                            }}
                            style={{ width: '20px', height: '20px', accentColor: 'var(--brass)', marginTop: '2px', flexShrink: 0, cursor: 'pointer' }}
                        />
                        <div style={{ flex: 1 }}>
                            <label htmlFor="verify" style={{ fontSize: '13.5px', lineHeight: 1.45, cursor: 'pointer', fontWeight: 600, color: '#5B3F11', display: 'block' }}>
                                Saya sebagai petugas menyatakan bahwa warga ini benar-benar diverifikasi identitasnya.
                            </label>
                            {!verifikasi && (
                                <p style={{ fontSize: '12px', color: '#855E22', marginTop: '6px', lineHeight: 1.45 }}>
                                    Centang kotak di atas untuk membuka bilik suara dan kamera foto kehadiran.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {verifikasi && needsRt && (
                <div className="section-block">
                    <h2 className="section-h">Pemilihan Ketua RT</h2>
                    <div className="vote-list">
                        {kandidat_rt.map(k => {
                            const isSelected = data.kandidat_rt_id === k.id.toString();
                            const isExpanded = expandedIds.includes(k.id);
                            const hasVisiMisi = Boolean(k.visi || k.misi);

                            return (
                                <label key={k.id} className="vote-option">
                                    <div className="vote-option-head">
                                        <div className="cand-row">
                                            <div className="cand-num">{k.nomor_urut}</div>
                                            {k.foto_url && (
                                                <img src={k.foto_url} alt={k.nama} className="cand-photo" />
                                            )}
                                            <div className="cand-info">
                                                <p className="cand-name">{k.nama}</p>
                                                {hasVisiMisi && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                toggleExpand(k.id);
                                                            }}
                                                            className="btn-visi-toggle"
                                                            aria-expanded={isExpanded}
                                                        >
                                                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                                            </svg>
                                                            <span>{isExpanded ? 'Tutup Visi & Misi' : 'Lihat Visi & Misi'}</span>
                                                            <svg 
                                                                viewBox="0 0 24 24" 
                                                                width="11" 
                                                                height="11" 
                                                                fill="none" 
                                                                stroke="currentColor" 
                                                                strokeWidth="2.5" 
                                                                strokeLinecap="round" 
                                                                strokeLinejoin="round"
                                                                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                                                            >
                                                                <polyline points="6 9 12 15 18 9"></polyline>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setModalKandidat({ kandidat: k, jenis: 'RT' });
                                                            }}
                                                            className="btn-vm-modal-trigger"
                                                            title="Baca Visi & Misi di Layar Penuh"
                                                        >
                                                            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                                            <span>Layar Penuh</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <input 
                                            type="radio" 
                                            name="rt" 
                                            value={k.id}
                                            checked={isSelected}
                                            onChange={(e) => setData('kandidat_rt_id', e.target.value)}
                                        />
                                    </div>

                                    {isExpanded && hasVisiMisi && (
                                        <div className="cand-vm-drawer" onClick={(e) => e.stopPropagation()}>
                                            {k.visi && (
                                                <div className="vm-item">
                                                    <span className="vm-tag vm-tag-visi">VISI</span>
                                                    <p className="vm-text">{k.visi}</p>
                                                </div>
                                            )}
                                            {k.misi && (
                                                <div className="vm-item" style={{ marginTop: k.visi ? '10px' : 0 }}>
                                                    <span className="vm-tag vm-tag-misi">MISI</span>
                                                    <p className="vm-text">{k.misi}</p>
                                                </div>
                                            )}
                                            <div className="vm-footer-action">
                                                <button
                                                    type="button"
                                                    onClick={() => setModalKandidat({ kandidat: k, jenis: 'RT' })}
                                                    className="btn-vm-modal-trigger"
                                                >
                                                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                                    <span>Buka Dialog Layar Penuh</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </label>
                            );
                        })}
                        <label className="vote-option abstain">
                            <div className="vote-option-head">
                                <span className="abstain-label">Tidak memilih (abstain)</span>
                                <input 
                                    type="radio" 
                                    name="rt" 
                                    value="abstain"
                                    checked={data.kandidat_rt_id === 'abstain'}
                                    onChange={(e) => setData('kandidat_rt_id', e.target.value)}
                                />
                            </div>
                        </label>
                    </div>
                    {errors.kandidat_rt_id && <p style={{ color: 'var(--maroon)', fontSize: '12px', marginTop: '6px' }}>{errors.kandidat_rt_id}</p>}
                </div>
            )}

            {verifikasi && needsRw && (
                <div className="section-block">
                    <h2 className="section-h">Pemilihan Ketua RW</h2>
                    <div className="vote-list">
                        {kandidat_rw.map(k => {
                            const isSelected = data.kandidat_rw_id === k.id.toString();
                            const isExpanded = expandedIds.includes(k.id);
                            const hasVisiMisi = Boolean(k.visi || k.misi);

                            return (
                                <label key={k.id} className="vote-option">
                                    <div className="vote-option-head">
                                        <div className="cand-row">
                                            <div className="cand-num">{k.nomor_urut}</div>
                                            {k.foto_url && (
                                                <img src={k.foto_url} alt={k.nama} className="cand-photo" />
                                            )}
                                            <div className="cand-info">
                                                <p className="cand-name">{k.nama}</p>
                                                {hasVisiMisi && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                toggleExpand(k.id);
                                                            }}
                                                            className="btn-visi-toggle"
                                                            aria-expanded={isExpanded}
                                                        >
                                                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                                            </svg>
                                                            <span>{isExpanded ? 'Tutup Visi & Misi' : 'Lihat Visi & Misi'}</span>
                                                            <svg 
                                                                viewBox="0 0 24 24" 
                                                                width="11" 
                                                                height="11" 
                                                                fill="none" 
                                                                stroke="currentColor" 
                                                                strokeWidth="2.5" 
                                                                strokeLinecap="round" 
                                                                strokeLinejoin="round"
                                                                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                                                            >
                                                                <polyline points="6 9 12 15 18 9"></polyline>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setModalKandidat({ kandidat: k, jenis: 'RW' });
                                                            }}
                                                            className="btn-vm-modal-trigger"
                                                            title="Baca Visi & Misi di Layar Penuh"
                                                        >
                                                            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                                            <span>Layar Penuh</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <input 
                                            type="radio" 
                                            name="rw" 
                                            value={k.id}
                                            checked={isSelected}
                                            onChange={(e) => setData('kandidat_rw_id', e.target.value)}
                                        />
                                    </div>

                                    {isExpanded && hasVisiMisi && (
                                        <div className="cand-vm-drawer" onClick={(e) => e.stopPropagation()}>
                                            {k.visi && (
                                                <div className="vm-item">
                                                    <span className="vm-tag vm-tag-visi">VISI</span>
                                                    <p className="vm-text">{k.visi}</p>
                                                </div>
                                            )}
                                            {k.misi && (
                                                <div className="vm-item" style={{ marginTop: k.visi ? '10px' : 0 }}>
                                                    <span className="vm-tag vm-tag-misi">MISI</span>
                                                    <p className="vm-text">{k.misi}</p>
                                                </div>
                                            )}
                                            <div className="vm-footer-action">
                                                <button
                                                    type="button"
                                                    onClick={() => setModalKandidat({ kandidat: k, jenis: 'RW' })}
                                                    className="btn-vm-modal-trigger"
                                                >
                                                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                                    <span>Buka Dialog Layar Penuh</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </label>
                            );
                        })}
                        <label className="vote-option abstain">
                            <div className="vote-option-head">
                                <span className="abstain-label">Tidak memilih (abstain)</span>
                                <input 
                                    type="radio" 
                                    name="rw" 
                                    value="abstain"
                                    checked={data.kandidat_rw_id === 'abstain'}
                                    onChange={(e) => setData('kandidat_rw_id', e.target.value)}
                                />
                            </div>
                        </label>
                    </div>
                    {errors.kandidat_rw_id && <p style={{ color: 'var(--maroon)', fontSize: '12px', marginTop: '6px' }}>{errors.kandidat_rw_id}</p>}
                </div>
            )}

            {verifikasi && (
                <div className="section-block">
                    <h2 className="section-h">Foto Bukti Kehadiran Warga</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-soft)', margin: '-8px 0 14px' }}>
                        Wajib difoto untuk mencegah penyalahgunaan suara (wajah pemilih atau suasana bilik suara terlihat jelas).
                    </p>
                    
                    {!previewUrl ? (
                        <label className="upload-zone" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', border: '2px dashed var(--brass)', borderRadius: '12px', background: '#FBFAF7' }}>
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="var(--brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                            <span style={{ color: 'var(--brass)', fontWeight: 600, fontSize: '14px' }}>Ambil Foto dari Kamera</span>
                            <small style={{ color: 'var(--text-soft)', marginTop: '4px' }}>atau pilih dari galeri</small>
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" 
                                style={{ display: 'none' }} 
                                onChange={handleFileChange}
                            />
                        </label>
                    ) : (
                        <div style={{ position: 'relative', width: '100%', maxWidth: '380px', margin: '0 auto' }}>
                            <img src={previewUrl} alt="Preview Bukti" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--line)' }} />
                            <button 
                                type="button"
                                onClick={() => { setPreviewUrl(null); setData('foto_bukti', null); }}
                                style={{ position: 'absolute', top: '8px', right: '8px', background: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--maroon)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                    )}
                    {errors.foto_bukti && <p style={{ color: 'var(--maroon)', fontSize: '12.5px', marginTop: '8px' }}>{errors.foto_bukti}</p>}
                </div>
            )}
        </>
    );

    const isReady = verifikasi && 
                   data.foto_bukti !== null &&
                   (!needsRt || data.kandidat_rt_id !== '') && 
                   (!needsRw || data.kandidat_rw_id !== '');

    return (
        <PetugasLayout title="Form Pemilihan" customHeader={header}>
            {isMobile ? (
                <div className="flex flex-col gap-4 pb-28">
                    <div className="card shadow-sm">
                        {content}
                    </div>
                </div>
            ) : (
                <div className="content-narrow w-full" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
                    <div style={{ marginBottom: '14px' }}>
                        <Link href={`/petugas/wilayah/${warga.rt_id}`} className="btn-link" style={{ color: 'var(--text-soft)', padding: '4px 0', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                            <span>Kembali ke Daftar Pemilih ({warga.rt?.nama || 'RT'})</span>
                        </Link>
                    </div>
                    <div className="card shadow-sm">
                        {content}
                        <div className="card-footer" style={{
                            padding: '18px 28px',
                            background: '#FBFAF7',
                            borderTop: '1px solid var(--line)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                {isReady ? (
                                    <span style={{ color: 'var(--moss)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                        Semua data &amp; foto bukti lengkap
                                    </span>
                                ) : (
                                    <span style={{ color: 'var(--text-soft)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                        {!verifikasi ? 'Centang kotak verifikasi identitas di atas' : 'Lengkapi pilihan calon dan foto bukti kehadiran'}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Link href={`/petugas/wilayah/${warga.rt_id}`} className="btn btn-outline" style={{ padding: '9px 18px' }}>
                                    Batal
                                </Link>
                                <button 
                                    type="button" 
                                    disabled={!isReady} 
                                    onClick={() => setShowConfirm(true)}
                                    className="btn btn-primary"
                                    style={{ 
                                        padding: '10px 24px', 
                                        opacity: isReady ? 1 : 0.45,
                                        cursor: isReady ? 'pointer' : 'not-allowed',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '13.5px',
                                        fontWeight: 600
                                    }}
                                >
                                    <span>Konfirmasi Suara</span>
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="9 18 15 12 9 6"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isMobile && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--line)] p-3.5 z-40 max-w-[480px] mx-auto shadow-lg">
                    <button 
                        type="button" 
                        className="btn-block"
                        disabled={!isReady} 
                        onClick={() => setShowConfirm(true)}
                        style={{ 
                            opacity: isReady ? 1 : 0.45,
                            cursor: isReady ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '13px',
                            fontSize: '14.5px',
                            fontWeight: 600,
                            borderRadius: '9px'
                        }}
                    >
                        <span>Konfirmasi Suara</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            )}

            {showConfirm && (
                <div className="modal-overlay" onClick={() => !processing && setShowConfirm(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-badge">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            Konfirmasi Bilik Suara
                        </div>

                        <h3 className="modal-title">Simpan Suara Pemilih?</h3>
                        <p className="modal-desc">
                            Periksa kembali pilihan suara warga sebelum menyimpan. Setelah disubmit, suara terekam secara permanen dan tidak dapat diubah.
                        </p>
                        
                        <div className="voter-summary">
                            <div className="voter-summary-item">
                                <span className="item-label">Nama Pemilih</span>
                                <span className="item-value">{warga.nama}</span>
                            </div>
                            {needsRt && (
                                <div className="voter-summary-item">
                                    <span className="item-label">Ketua RT</span>
                                    <span className={`item-value ${data.kandidat_rt_id === 'abstain' ? 'abstain' : ''}`}>
                                        {getSelectedName(kandidat_rt, data.kandidat_rt_id)}
                                    </span>
                                </div>
                            )}
                            {needsRw && (
                                <div className="voter-summary-item">
                                    <span className="item-label">Ketua RW</span>
                                    <span className={`item-value ${data.kandidat_rw_id === 'abstain' ? 'abstain' : ''}`}>
                                        {getSelectedName(kandidat_rw, data.kandidat_rw_id)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {previewUrl && (
                            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--moss-soft)', border: '1px solid rgba(62, 107, 76, 0.25)', padding: '10px 14px', borderRadius: '8px' }}>
                                <img src={previewUrl} alt="Foto Bukti" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} />
                                <span style={{ fontSize: '12px', color: 'var(--moss)', fontWeight: 500 }}>Foto bukti kehadiran terlampir</span>
                            </div>
                        )}

                        <div className="callout-warning">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <span>Tindakan ini tidak dapat dibatalkan demi menjaga integritas data pemilihan.</span>
                        </div>

                        <div className="modal-actions">
                            <button 
                                type="button" 
                                disabled={processing}
                                onClick={() => setShowConfirm(false)} 
                                className="btn btn-outline"
                            >
                                Batal &amp; Periksa
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleConfirm}
                                className="btn btn-primary"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75"></path>
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        Ya, Simpan Suara
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalKandidat && (
                <div className="modal-overlay" onClick={() => setModalKandidat(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FBFAF7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div className="cand-num" style={{ background: 'var(--brass)', color: '#fff', width: '44px', height: '44px', fontSize: '18px' }}>
                                    {modalKandidat.kandidat.nomor_urut}
                                </div>
                                {modalKandidat.kandidat.foto_url && (
                                    <img 
                                        src={modalKandidat.kandidat.foto_url} 
                                        alt={modalKandidat.kandidat.nama} 
                                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--line)' }} 
                                    />
                                )}
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--ink)' }}>{modalKandidat.kandidat.nama}</h3>
                                    <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--text-soft)' }}>Calon Ketua {modalKandidat.jenis}</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setModalKandidat(null)} 
                                style={{ background: '#EAE7E0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink)' }}
                                aria-label="Tutup dialog"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div style={{ padding: '22px', maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {modalKandidat.kandidat.visi && (
                                <div style={{ background: 'var(--brass-soft)', border: '1px solid #E7D6AE', borderRadius: '10px', padding: '14px 16px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--brass)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>VISI</span>
                                    <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.6, color: '#4A3512', whiteSpace: 'pre-wrap' }}>{modalKandidat.kandidat.visi}</p>
                                </div>
                            )}
                            {modalKandidat.kandidat.misi && (
                                <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', borderRadius: '10px', padding: '14px 16px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ink)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>MISI</span>
                                    <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.6, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{modalKandidat.kandidat.misi}</p>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '16px 22px', borderTop: '1px solid var(--line)', background: '#FBFAF7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                            <button 
                                type="button" 
                                onClick={() => setModalKandidat(null)} 
                                className="btn btn-outline" 
                                style={{ padding: '9px 18px' }}
                            >
                                Tutup
                            </button>
                            <button 
                                type="button" 
                                onClick={() => {
                                    if (modalKandidat.jenis === 'RT') {
                                        setData('kandidat_rt_id', modalKandidat.kandidat.id.toString());
                                    } else {
                                        setData('kandidat_rw_id', modalKandidat.kandidat.id.toString());
                                    }
                                    setModalKandidat(null);
                                }} 
                                className="btn btn-primary" 
                                style={{ padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                Pilih Kandidat Ini
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PetugasLayout>
    );
}
