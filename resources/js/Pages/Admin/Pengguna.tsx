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
        router.put(`/admin/pengguna/${id}/toggle-status`);
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
        <AdminLayout title="Kelola Pengguna">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Daftar Pengguna</h3>
                    <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">Tambah Pengguna</button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b text-sm text-gray-500">
                                <th className="p-3 font-medium">Nama</th>
                                <th className="p-3 font-medium">Username</th>
                                <th className="p-3 font-medium">Role</th>
                                <th className="p-3 font-medium">Status</th>
                                <th className="p-3 font-medium">Wilayah Tugas</th>
                                <th className="p-3 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 text-sm">
                                    <td className="p-3 font-medium text-gray-800">{user.nama}</td>
                                    <td className="p-3 text-gray-600">{user.username}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {user.locked_until && new Date(user.locked_until) > new Date() ? (
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Terkunci</span>
                                        ) : user.is_active ? (
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Aktif</span>
                                        ) : (
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">Nonaktif</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-gray-500 max-w-xs truncate">
                                        {user.role === 'admin' ? 'Semua Wilayah' : (
                                            user.wilayah?.map(rt => rt.nama).join(', ') || 'Belum ada tugas'
                                        )}
                                    </td>
                                    <td className="p-3 text-center space-x-2">
                                        {user.role === 'petugas' && (
                                            <button onClick={() => openAssignModal(user)} className="text-blue-600 hover:text-blue-800 p-1 text-xs underline">Tugas</button>
                                        )}
                                        <button onClick={() => handleToggleStatus(user.id)} className="text-gray-600 hover:text-gray-800 p-1 text-xs underline">{user.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                                        {user.locked_until && new Date(user.locked_until) > new Date() && (
                                            <button onClick={() => handleUnlock(user.id)} className="text-green-600 hover:text-green-800 p-1 text-xs underline">Buka Kunci</button>
                                        )}
                                        <button onClick={() => handleResetPassword(user.id)} className="text-red-600 hover:text-red-800 p-1 text-xs underline">Reset PW</button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">Data tidak ditemukan.</td>
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
