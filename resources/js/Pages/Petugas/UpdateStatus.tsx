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
            <div className="mb-4">
                <Link href={`/petugas/wilayah/${warga.rt_id}`} className="text-blue-600 flex items-center gap-1 text-sm font-medium">
                    <span>&larr;</span> Kembali ke Daftar Warga
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{warga.nama}</h2>
                <p className="text-gray-600 text-sm mb-3">{warga.alamat}</p>
                <div className="flex gap-2">
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">Kunjungan ke-{warga.jumlah_kunjungan + 1}</span>
                </div>
            </div>

            {warga.jumlah_kunjungan >= 3 && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-6 text-sm flex gap-3">
                    <span className="text-xl">dY</span>
                    <div>
                        <p className="font-bold">Perhatian</p>
                        <p>Warga ini sudah 3x tidak ditemukan. Laporkan ke admin untuk tindak lanjut.</p>
                    </div>
                </div>
            )}

            <div className="space-y-4 mt-8">
                <button 
                    onClick={() => setConfirmModal('tidak_ditemukan')}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    <span className="text-3xl">dY </span>
                    <span>Warga Tidak Ditemukan</span>
                </button>
                
                <button 
                    onClick={() => setConfirmModal('menolak')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 transition-transform active:scale-95"
                >
                    <span className="text-3xl"> ~</span>
                    <span>Warga Menolak Memilih</span>
                </button>
            </div>

            {/* Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-3">{confirmModal === 'tidak_ditemukan' ? 'dY ' : ' ~'}</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Status</h3>
                            <p className="text-gray-600 text-sm">
                                {confirmModal === 'tidak_ditemukan' 
                                    ? `Tandai warga ${warga.nama} sebagai "Tidak Ditemukan" untuk kunjungan kali ini?` 
                                    : `Tandai warga ${warga.nama} sebagai "Menolak Memilih"? Ini akan menonaktifkan hak pilihnya.`}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 font-medium text-gray-700 bg-gray-100 rounded-xl">Batal</button>
                            <button onClick={() => handleUpdate(confirmModal)} className={`flex-1 py-3 font-medium text-white rounded-xl ${confirmModal === 'tidak_ditemukan' ? 'bg-amber-500' : 'bg-gray-800'}`}>
                                Ya, Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PetugasLayout>
    );
}
