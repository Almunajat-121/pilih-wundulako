import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import { Warga, Kandidat } from '@/types';
import ConfirmDialog from '@/Components/ConfirmDialog';

interface FormVoteProps {
    warga: Warga;
    kandidat_rt: Kandidat[];
    kandidat_rw: Kandidat[];
}

export default function FormVote({ warga, kandidat_rt, kandidat_rw }: FormVoteProps) {
    const [verifikasi, setVerifikasi] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        kandidat_rt_id: null as number | null,
        kandidat_rw_id: null as number | null,
        idempotency_key: crypto.randomUUID(),
        verifikasi_identitas: false,
    });

    const needsRtVote = warga.status_vote_rt === 'belum_dikunjungi';
    const needsRwVote = warga.status_vote_rw === 'belum_dikunjungi';

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifikasi) {
            alert('Anda harus memverifikasi identitas warga terlebih dahulu.');
            return;
        }
        setData('verifikasi_identitas', true);
        setShowConfirm(true);
    };

    const submit = () => {
        post(`/petugas/warga/${warga.id}/vote`, {
            onSuccess: () => setShowConfirm(false),
        });
    };

    const getKandidatName = (id: number | null, list: Kandidat[]) => {
        if (id === null) return 'Tidak memilih (Menolak/Abstain)';
        const k = list.find(x => x.id === id);
        return k ? k.nama : 'Unknown';
    };

    const header = (
        <header className="m-header">
            <Link href={`/petugas/wilayah/${warga.rt_id}`} className="m-back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </Link>
            <div>
                <p className="m-title">Formulir Pemilihan</p>
                <p className="m-sub">Bilik suara digital</p>
            </div>
        </header>
    );

    return (
        <PetugasLayout title="Form Pemilihan" customHeader={header}>
            <div className="flex flex-col gap-6 pt-2 pb-24">
                <div className="field-group">
                    <p className="eyebrow">Data pemilih</p>
                    <div>
                        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '19px', fontWeight: 600, margin: 0 }}>
                            {warga.nama}
                        </h3>
                        <p className="mono" style={{ fontSize: '12.5px', color: 'var(--text-soft)', margin: '3px 0 0' }}>
                            Alamat: {warga.alamat}
                        </p>
                    </div>
                    <div className="callout callout-brass">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
                        <div className="verify-row" style={{ alignItems: 'flex-start' }}>
                            <input 
                                type="checkbox" 
                                id="verify" 
                                checked={verifikasi}
                                onChange={(e) => setVerifikasi(e.target.checked)}
                            />
                            <label htmlFor="verify">Saya sebagai petugas menyatakan warga ini benar-benar hadir dan memberikan suaranya secara rahasia.</label>
                        </div>
                    </div>
                </div>

                {verifikasi && (
                    <form id="vote-form" onSubmit={handleContinue} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {needsRtVote && (
                            <div>
                                <h2 className="section-title">Pemilihan Ketua RT</h2>
                                <div className="flex flex-col gap-3">
                                    {kandidat_rt.map((k) => (
                                        <label key={k.id} className="vote-option">
                                            <div className="cand-row">
                                                <div className="cand-num">{k.nomor_urut}</div>
                                                <div>
                                                    <p className="cand-name">{k.nama}</p>
                                                    {k.visi_misi && <p className="cand-visi">Visi: {k.visi_misi}</p>}
                                                </div>
                                            </div>
                                            <input 
                                                type="radio" 
                                                name="rt" 
                                                checked={data.kandidat_rt_id === k.id}
                                                onChange={() => setData('kandidat_rt_id', k.id)}
                                            />
                                        </label>
                                    ))}
                                    <label className="vote-option abstain">
                                        <span className="abstain-label">Tidak memilih (abstain)</span>
                                        <input 
                                            type="radio" 
                                            name="rt" 
                                            checked={data.kandidat_rt_id === null}
                                            onChange={() => setData('kandidat_rt_id', null)}
                                        />
                                    </label>
                                </div>
                                {errors.kandidat_rt_id && <p className="text-sm text-red-600 mt-2">{errors.kandidat_rt_id}</p>}
                            </div>
                        )}

                        {needsRwVote && (
                            <div>
                                <h2 className="section-title">Pemilihan Ketua RW</h2>
                                <div className="flex flex-col gap-3">
                                    {kandidat_rw.map((k) => (
                                        <label key={k.id} className="vote-option">
                                            <div className="cand-row">
                                                <div className="cand-num">{k.nomor_urut}</div>
                                                <div>
                                                    <p className="cand-name">{k.nama}</p>
                                                    {k.visi_misi && <p className="cand-visi">Visi: {k.visi_misi}</p>}
                                                </div>
                                            </div>
                                            <input 
                                                type="radio" 
                                                name="rw" 
                                                checked={data.kandidat_rw_id === k.id}
                                                onChange={() => setData('kandidat_rw_id', k.id)}
                                            />
                                        </label>
                                    ))}
                                    <label className="vote-option abstain">
                                        <span className="abstain-label">Tidak memilih (abstain)</span>
                                        <input 
                                            type="radio" 
                                            name="rw" 
                                            checked={data.kandidat_rw_id === null}
                                            onChange={() => setData('kandidat_rw_id', null)}
                                        />
                                    </label>
                                </div>
                                {errors.kandidat_rw_id && <p className="text-sm text-red-600 mt-2">{errors.kandidat_rw_id}</p>}
                            </div>
                        )}
                    </form>
                )}
            </div>

            {verifikasi && (
                <div className="fixed-frame z-40">
                    <div className="submit-bar">
                        <button type="submit" form="vote-form" className="btn-block" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Konfirmasi & simpan suara'}
                        </button>
                    </div>
                </div>
            )}

            <ConfirmDialog 
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={submit}
                title="Konfirmasi Pilihan"
                message={
                    <div className="space-y-4 bg-[var(--paper)] p-4 rounded-xl border border-[var(--line)] text-left mt-4 mb-2">
                        {needsRtVote && (
                            <div>
                                <span className="text-[11px] text-[var(--text-soft)] block uppercase tracking-wider font-semibold">Ketua RT:</span>
                                <span className="font-bold text-[var(--text)]">{getKandidatName(data.kandidat_rt_id, kandidat_rt)}</span>
                            </div>
                        )}
                        {needsRwVote && (
                            <div>
                                <span className="text-[11px] text-[var(--text-soft)] block uppercase tracking-wider font-semibold">Ketua RW:</span>
                                <span className="font-bold text-[var(--text)]">{getKandidatName(data.kandidat_rw_id, kandidat_rw)}</span>
                            </div>
                        )}
                        <div className="pt-2 border-t border-[var(--line)] mt-2">
                            <span className="text-[11px] text-[var(--text-soft)] block uppercase tracking-wider font-semibold">Pemilih:</span>
                            <span className="font-medium text-sm text-[var(--text)]">{warga.nama}</span>
                        </div>
                    </div>
                }
                confirmText="Ya, Simpan Suara"
                processing={processing}
            />
        </PetugasLayout>
    );
}
