import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps, User, Rt } from '../../types';

interface PenggunaProps extends PageProps {
    users: User[];
    rt_list: Rt[];
}

export default function Pengguna({ users, rt_list }: PenggunaProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [assignUser, setAssignUser] = useState<User | null>(null);

    const { data, setData, post, reset, processing, errors, clearErrors } = useForm({
        nama: '',
        username: '',
        password: '',
        role: 'petugas' as 'admin' | 'petugas',
    });

    const { data: assignData, setData: setAssignData, put: putAssign, processing: assignProcessing } = useForm({
        rt_ids: [] as number[],
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/pengguna', {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
                clearErrors();
            },
        });
    };

    const handleToggleStatus = (id: number) => {
        router.put(`/admin/pengguna/${id}/toggle-active`);
    };

    const handleUnlock = (id: number) => {
        router.put(`/admin/pengguna/${id}/unlock`);
    };

    const handleResetPassword = (id: number) => {
        if (confirm('Yakin ingin mereset password ke default (PilihPilih123)?')) {
            router.put(`/admin/pengguna/${id}/reset-password`);
        }
    };

    const openAssignModal = (user: User) => {
        setAssignUser(user);
        setAssignData('rt_ids', user.wilayah?.map(rt => rt.id) || []);
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignUser) return;
        putAssign(`/admin/pengguna/${assignUser.id}/wilayah`, {
            onSuccess: () => setAssignUser(null),
        });
    };

    const toggleRt = (id: number) => {
        const ids = [...assignData.rt_ids];
        if (ids.includes(id)) {
            setAssignData('rt_ids', ids.filter(i => i !== id));
        } else {
            setAssignData('rt_ids', [...ids, id]);
        }
    };

    // Group RT by RW
    const rwGroups: Record<string, Rt[]> = {};
    rt_list.forEach(rt => {
        const rwName = rt.rw?.nama || 'Tanpa RW';
        if (!rwGroups[rwName]) rwGroups[rwName] = [];
        rwGroups[rwName].push(rt);
    });

    return (
        <AdminLayout title="Pengguna & Petugas">
            <div className="card">
                <div className="toolbar">
                    <div className="search-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                        <input type="text" placeholder="Cari nama atau username..." className="input" />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Tambah Pengguna</button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Username</th>
                                <th>Peran</th>
                                <th>Tugas wilayah</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td style={{ fontWeight: 600 }}>{user.nama}</td>
                                    <td className="mono" style={{ color: 'var(--text-soft)' }}>{user.username}</td>
                                    <td>
                                        <span className={`badge ${user.role === 'admin' ? 'badge-ink' : 'badge-slate'}`}>
                                            {user.role === 'admin' ? 'Admin' : 'Petugas'}
                                        </span>
                                    </td>
                                    <td>
                                        {user.role === 'admin' ? (
                                            <span style={{ color: 'var(--text-soft)', fontSize: '13px' }}>Semua wilayah</span>
                                        ) : (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {user.wilayah?.map(rt => (
                                                    <span key={rt.id} className="tag">{rt.nama} ({rt.rw?.nama})</span>
                                                ))}
                                                {(!user.wilayah || user.wilayah.length === 0) && (
                                                    <span style={{ color: 'var(--text-soft)', fontSize: '12.5px', fontStyle: 'italic' }}>Belum ada tugas</span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {user.locked_until && new Date(user.locked_until) > new Date() ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--maroon)', fontWeight: 600, fontSize: '12.5px' }}>
                                                <span className="dot dot-off"></span>Terkunci
                                            </span>
                                        ) : user.is_active ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--moss)', fontWeight: 600, fontSize: '12.5px' }}>
                                                <span className="dot"></span>Aktif
                                            </span>
                                        ) : (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-soft)', fontWeight: 600, fontSize: '12.5px' }}>
                                                <span className="dot" style={{ background: 'var(--slate)' }}></span>Nonaktif
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        {user.role === 'petugas' && (
                                            <button onClick={() => openAssignModal(user)} className="btn-link" style={{ marginRight: '8px' }}>Tugas RT</button>
                                        )}
                                        <button onClick={() => handleToggleStatus(user.id)} className="btn-link danger" style={{ marginRight: '8px' }}>{user.is_active ? 'Blokir' : 'Aktifkan'}</button>
                                        <button onClick={() => handleResetPassword(user.id)} className="btn-link danger">Reset PW</button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '30px' }}>Data tidak ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="font-bold text-gray-800">Tambah Pengguna</h3>
                            <button onClick={() => { setShowAddModal(false); reset(); clearErrors(); }} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleAdd} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input type="text" value={data.nama} onChange={e => setData('nama', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" required />
                                {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input type="text" value={data.username} onChange={e => setData('username', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" required />
                                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" required />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select value={data.role} onChange={e => setData('role', e.target.value as any)} className="w-full border-gray-300 rounded-md shadow-sm">
                                    <option value="petugas">Petugas Lapangan</option>
                                    <option value="admin">Administrator</option>
                                </select>
                                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <button type="button" onClick={() => { setShowAddModal(false); reset(); clearErrors(); }} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Batal</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tugas Wilayah */}
            {assignUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl shrink-0">
                            <h3 className="font-bold text-gray-800">Tugas Wilayah: {assignUser.nama}</h3>
                            <button onClick={() => setAssignUser(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-4">
                            {Object.entries(rwGroups).map(([rw, rts]) => (
                                <div key={rw} className="border border-gray-200 rounded-md p-3">
                                    <h4 className="font-medium text-sm text-gray-700 mb-2 border-b pb-1">{rw}</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {rts.map(rt => (
                                            <label key={rt.id} className="flex items-center gap-2 text-sm">
                                                <input type="checkbox" checked={assignData.rt_ids.includes(rt.id)} onChange={() => toggleRt(rt.id)} className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500" />
                                                {rt.nama}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(rwGroups).length === 0 && <p className="text-sm text-gray-500 text-center">Belum ada data RT/RW.</p>}
                        </div>
                        <div className="p-4 flex justify-end gap-3 border-t bg-white shrink-0 rounded-b-xl">
                            <button type="button" onClick={() => setAssignUser(null)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Batal</button>
                            <button type="button" onClick={handleAssign} disabled={assignProcessing} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">Simpan Tugas</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
