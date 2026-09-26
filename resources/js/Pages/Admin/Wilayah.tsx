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
        postRw('/admin/rw', {
            onSuccess: () => resetRw(),
        });
    };

    const handleAddRt = (e: React.FormEvent, rwId: number) => {
        e.preventDefault();
        rtData.rw_id = rwId.toString();
        postRt('/admin/rt', {
            onSuccess: () => resetRt(),
        });
    };

    const confirmDelete = (type: 'rw' | 'rt', id: number) => {
        setDeletingId({ type, id });
    };

    const handleDelete = () => {
        if (!deletingId) return;
        router.delete(`/admin/${deletingId.type}/${deletingId.id}`, {
            onSuccess: () => setDeletingId(null),
        });
    };

    return (
        <AdminLayout title="Kelola Wilayah">
            <div className="card" style={{ maxWidth: '760px' }}>
                <div className="card-head">
                    <h3>Daftar RW</h3>
                </div>
                <div style={{ padding: '18px 20px' }}>
                    <form onSubmit={handleAddRw} style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                        <input type="text" value={rwData.nama} onChange={e => setRwData('nama', e.target.value)} placeholder="Nama RW, contoh: RW 03" className="input" style={{ flex: 1 }} required />
                        <button className="btn btn-primary" type="submit" disabled={rwProcessing}>Tambah RW</button>
                    </form>
                    {rwErrors.nama && <div style={{ color: 'var(--maroon)', fontSize: '12.5px', marginBottom: '14px' }}>{rwErrors.nama}</div>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {rw_list.map(rw => {
                            const isExpanded = expandedRw === rw.id;
                            const rwNum = rw.nama.replace(/\D/g, '') || '-';
                            return (
                                <div key={rw.id} className={`accordion-item ${!isExpanded ? 'is-collapsed' : ''}`}>
                                    <div className="accordion-head" onClick={() => setExpandedRw(isExpanded ? null : rw.id)}>
                                        <div className="rw-left">
                                            <span className="rw-num">{rwNum}</span>
                                            <div>
                                                <div className="rw-name">{rw.nama}</div>
                                                <div className="rw-meta">{rw.rt?.length || 0} RT</div>
                                            </div>
                                        </div>
                                        <div className="rw-right">
                                            <button onClick={(e) => { e.stopPropagation(); confirmDelete('rw', rw.id); }} className="btn-link danger" style={{ marginRight: '10px' }}>Hapus RW</button>
                                            <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div style={{ padding: '16px 18px', background: '#fff' }}>
                                            <form onSubmit={(e) => handleAddRt(e, rw.id)} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                                                <input type="text" value={rtData.rw_id === rw.id.toString() ? rtData.nama : ''} onChange={e => {
                                                    setRtData('rw_id', rw.id.toString());
                                                    setRtData('nama', e.target.value);
                                                }} placeholder="Nama RT, contoh: RT 03" className="input" style={{ flex: 1 }} required />
                                                <button className="btn btn-accent" type="submit" disabled={rtProcessing}>Tambah RT</button>
                                            </form>
                                            {rtErrors.nama && rtData.rw_id === rw.id.toString() && <div style={{ color: 'var(--maroon)', fontSize: '12.5px', marginBottom: '14px' }}>{rtErrors.nama}</div>}
                                            
                                            {rw.rt && rw.rt.length > 0 ? (
                                                <div style={{ border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
                                                    {rw.rt.map((rt, idx) => (
                                                        <div key={rt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: idx !== rw.rt.length - 1 ? '1px solid var(--line)' : 'none' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <span className="rw-num" style={{ background: 'var(--slate-soft)', color: 'var(--slate)', width: '24px', height: '24px', fontSize: '11.5px' }}>
                                                                    {rt.nama.replace(/\D/g, '') || '-'}
                                                                </span>
                                                                <span style={{ fontWeight: 500, fontSize: '13.5px' }}>{rt.nama}</span>
                                                            </div>
                                                            <button onClick={() => confirmDelete('rt', rt.id)} className="btn-link danger">Hapus</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '13px', color: 'var(--text-soft)', fontStyle: 'italic', padding: '10px 0' }}>Belum ada RT di wilayah ini.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {rw_list.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-soft)' }}>Belum ada data wilayah.</div>
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
