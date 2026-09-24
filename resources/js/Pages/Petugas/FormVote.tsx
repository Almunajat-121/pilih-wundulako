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

    return (
        <PetugasLayout title="Form Pemilihan">
            <div className="mb-4">
                <Link href={`/petugas/wilayah/${warga.rt_id}`} className="text-gray-500 hover:text-gray-700 text-sm">
                    ⬅️ Kembali
                </Link>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                <h2 className="font-bold text-lg text-gray-900">{warga.nama}</h2>
                <p className="text-sm text-gray-600 mt-1">{warga.alamat}</p>
            </div>

            <div className="mb-6 flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <input
                    type="checkbox"
                    id="verifikasi"
                    checked={verifikasi}
                    onChange={(e) => setVerifikasi(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="verifikasi" className="text-sm text-blue-900 font-medium cursor-pointer">
                    Saya sudah memverifikasi identitas warga secara fisik (KTP/KK)
                </label>
            </div>

            {verifikasi && (
                <form onSubmit={handleContinue} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Section RT */}
                    {needsRtVote && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">Pilih Ketua RT</h3>
                            <div className="grid gap-3">
                                {kandidat_rt.map((k) => (
                                    <label key={k.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${data.kandidat_rt_id === k.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="kandidat_rt"
                                            value={k.id}
                                            checked={data.kandidat_rt_id === k.id}
                                            onChange={() => setData('kandidat_rt_id', k.id)}
                                            className="h-5 w-5 text-blue-600"
                                        />
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-900">{k.nomor_urut}. {k.nama}</span>
                                            </div>
                                            {k.visi_misi && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{k.visi_misi}</p>}
                                        </div>
                                    </label>
                                ))}
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${data.kandidat_rt_id === null ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="kandidat_rt"
                                        checked={data.kandidat_rt_id === null}
                                        onChange={() => setData('kandidat_rt_id', null)}
                                        className="h-5 w-5 text-red-600"
                                    />
                                    <span className="ml-4 font-semibold text-red-700">Tidak Ingin Memilih / Menolak</span>
                                </label>
                            </div>
                            {errors.kandidat_rt_id && <p className="text-sm text-red-600">{errors.kandidat_rt_id}</p>}
                        </div>
                    )}

                    {/* Section RW */}
                    {needsRwVote && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-800 text-lg border-b pb-2">Pilih Ketua RW</h3>
                            <div className="grid gap-3">
                                {kandidat_rw.map((k) => (
                                    <label key={k.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${data.kandidat_rw_id === k.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="kandidat_rw"
                                            value={k.id}
                                            checked={data.kandidat_rw_id === k.id}
                                            onChange={() => setData('kandidat_rw_id', k.id)}
                                            className="h-5 w-5 text-blue-600"
                                        />
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-bold text-gray-900">{k.nomor_urut}. {k.nama}</span>
                                            </div>
                                            {k.visi_misi && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{k.visi_misi}</p>}
                                        </div>
                                    </label>
                                ))}
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${data.kandidat_rw_id === null ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="kandidat_rw"
                                        checked={data.kandidat_rw_id === null}
                                        onChange={() => setData('kandidat_rw_id', null)}
                                        className="h-5 w-5 text-red-600"
                                    />
                                    <span className="ml-4 font-semibold text-red-700">Tidak Ingin Memilih / Menolak</span>
                                </label>
                            </div>
                            {errors.kandidat_rw_id && <p className="text-sm text-red-600">{errors.kandidat_rw_id}</p>}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-4 px-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-md hover:bg-blue-700 transition-colors"
                    >
                        Lanjutkan
                    </button>
                </form>
            )}

            {/* Modal Konfirmasi */}
            <ConfirmDialog 
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={submit}
                title="Konfirmasi Pilihan"
                message={
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border text-left mt-4 mb-2">
                        {needsRtVote && (
                            <div>
                                <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Ketua RT:</span>
                                <span className="font-bold text-gray-800">{getKandidatName(data.kandidat_rt_id, kandidat_rt)}</span>
                            </div>
                        )}
                        {needsRwVote && (
                            <div>
                                <span className="text-xs text-gray-500 block uppercase tracking-wider font-semibold">Ketua RW:</span>
                                <span className="font-bold text-gray-800">{getKandidatName(data.kandidat_rw_id, kandidat_rw)}</span>
                            </div>
                        )}
                        <div className="pt-2 border-t mt-2">
                            <span className="text-xs text-gray-500 block">Warga:</span>
                            <span className="font-medium text-sm text-gray-700">{warga.nama}</span>
                        </div>
                    </div>
                }
                confirmText="Ya, Submit Suara"
                processing={processing}
            />
        </PetugasLayout>
    );
}
