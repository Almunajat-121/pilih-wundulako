import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps, Rw, Rt } from '../../types';

interface WilayahProps extends PageProps {
    rw_list: Rw[];
}

export default function Wilayah({ rw_list }: WilayahProps) {
    const [expandedRw, setExpandedRw] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<{ type: 'rw' | 'rt', id: number } | null>(null);

    const { data: rwData, setData: setRwData, post: postRw, reset: resetRw, processing: rwProcessing, errors: rwErrors } = useForm({
        nama: '',
    });

    const { data: rtData, setData: setRtData, post: postRt, reset: resetRt, processing: rtProcessing, errors: rtErrors } = useForm({
        nama: '',
        rw_id: '',
    });

    const handleAddRw = (e: React.FormEvent) => {
        e.preventDefault();
        postRw('/admin/wilayah/rw', {
            onSuccess: () => resetRw(),
        });
    };

    const handleAddRt = (e: React.FormEvent, rwId: number) => {
        e.preventDefault();
        rtData.rw_id = rwId.toString();
        postRt('/admin/wilayah/rt', {
            onSuccess: () => resetRt(),
        });
    };

    const confirmDelete = (type: 'rw' | 'rt', id: number) => {
        setDeletingId({ type, id });
    };

    const handleDelete = () => {
        if (!deletingId) return;
        router.delete(`/admin/wilayah/${deletingId.type}/${deletingId.id}`, {
            onSuccess: () => setDeletingId(null),
        });
    };

    return (
        <AdminLayout title="Kelola Wilayah">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Daftar RW</h3>
                </div>
                <div className="p-4">
                    <form onSubmit={handleAddRw} className="flex gap-2 mb-4">
                        <input type="text" value={rwData.nama} onChange={e => setRwData('nama', e.target.value)} placeholder="Nama RW (Contoh: RW 01)" className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required />
                        <button type="submit" disabled={rwProcessing} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">Tambah RW</button>
                    </form>
                    {rwErrors.nama && <div className="text-red-500 text-sm mb-4">{rwErrors.nama}</div>}

                    <div className="space-y-2">
                        {rw_list.map(rw => (
                            <div key={rw.id} className="border border-gray-200 rounded-md overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100" onClick={() => setExpandedRw(expandedRw === rw.id ? null : rw.id)}>
                                    <div className="font-medium text-gray-800">{rw.nama}</div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-500">{rw.rt?.length || 0} RT</span>
                                        <button onClick={(e) => { e.stopPropagation(); confirmDelete('rw', rw.id); }} className="text-red-500 hover:text-red-700 text-sm">Hapus</button>
                                        <span className="text-gray-400">{expandedRw === rw.id ? '▼' : '▶'}</span>
                                    </div>
                                </div>
                                {expandedRw === rw.id && (
                                    <div className="p-4 bg-white border-t border-gray-200">
                                        <form onSubmit={(e) => handleAddRt(e, rw.id)} className="flex gap-2 mb-4">
                                            <input type="text" value={rtData.rw_id === rw.id.toString() ? rtData.nama : ''} onChange={e => {
                                                setRtData('rw_id', rw.id.toString());
                                                setRtData('nama', e.target.value);
                                            }} placeholder="Nama RT (Contoh: RT 01)" className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required />
                                            <button type="submit" disabled={rtProcessing} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm">Tambah RT</button>
                                        </form>
                                        {rtErrors.nama && rtData.rw_id === rw.id.toString() && <div className="text-red-500 text-sm mb-4">{rtErrors.nama}</div>}
                                        
                                        <div className="space-y-1">
                                            {rw.rt?.map(rt => (
                                                <div key={rt.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                                    <span className="text-sm font-medium text-gray-700">{rt.nama}</span>
                                                    <button onClick={() => confirmDelete('rt', rt.id)} className="text-red-500 hover:text-red-700 text-xs">Hapus</button>
                                                </div>
                                            ))}
                                            {(!rw.rt || rw.rt.length === 0) && (
                                                <div className="text-sm text-gray-500 italic p-2">Belum ada RT di wilayah ini.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {rw_list.length === 0 && (
                            <div className="text-center py-6 text-gray-500">Belum ada data wilayah.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {deletingId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Hapus</h3>
                        <p className="text-gray-600 mb-6 text-sm">Apakah Anda yakin ingin menghapus data {deletingId.type.toUpperCase()} ini? Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeletingId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Batal</button>
                            <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
