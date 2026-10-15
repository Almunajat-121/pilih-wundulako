import React, { useState } from 'react';
import { useIsMobile } from '../../lib/useIsMobile';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps, User, Rt } from '../../types';

interface PenggunaProps extends PageProps {
    users: User[];
    rt_list: Rt[];
}

export default function Pengguna({ users, rt_list, auth }: PenggunaProps) {
    const isMobile = useIsMobile();
    const [showAddModal, setShowAddModal] = useState(false);
    const [assignUser, setAssignUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, reset, processing, errors, clearErrors } = useForm({
        nama: '',
        username: '',
        password: '',
        role: 'petugas' as 'admin' | 'petugas' | 'saksi',
    });

    const { data: assignData, setData: setAssignData, put: putAssign, processing: assignProcessing } = useForm({
        rt_ids: [] as number[],
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/pengguna', {
            onSuccess: () => {
                setShowAddModal(false);
                setShowPassword(false);
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
        putAssign(`/admin/pengguna/${assignUser.id}/assign-wilayah`, {
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

    // Filter users by search query
    const filteredUsers = users.filter(u =>
        u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout title={isMobile ? 'Kelola Pengguna' : 'Pengguna & Petugas'}>
            {isMobile ? (
                /* Mobile Layout */
                <div>
                    <div className="m-toolbar-plain" style={{ display: 'flex', gap: '8px' }}>
                        <div className="m-search" style={{ flex: 1, marginBottom: 0 }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                            <input
                                type="text"
                                placeholder="Cari pengguna..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ padding: '0 14px' }}>Tambah</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '26px', paddingTop: '16px' }}>
                        {filteredUsers.map(u => (
                            <div className="m-card" key={u.id}>
                                <div className="m-card-top">
                                    <h3 className="m-card-name" style={{ fontSize: '14.5px' }}>{u.nama}</h3>
                                    <span className={`badge ${u.role === 'admin' ? 'badge-ink' : u.role === 'saksi' ? 'badge-brass' : 'badge-slate'}`}>
                                        {u.role === 'admin' ? 'Admin' : u.role === 'saksi' ? 'Saksi' : 'Petugas'}
                                    </span>
                                </div>
                                <p className="m-card-nik mono" style={{ marginBottom: '6px' }}>{u.username}</p>
                                
                                {u.role === 'admin' ? (
                                    <p style={{ fontSize: '12px', color: 'var(--text-soft)', margin: '0 0 4px' }}>Tugas: semua wilayah</p>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '6px 0 4px' }}>
                                        {u.wilayah && u.wilayah.length > 0 ? u.wilayah.map((rt: any) => (
                                            <span key={rt.id} className="tag" style={{ fontSize: '11px', padding: '3px 8px', background: 'var(--slate-soft)', borderRadius: '4px', color: 'var(--slate)' }}>
                                                {rt.nama} ({rt.rw?.nama})
                                            </span>
                                        )) : <span style={{ fontSize: '12px', color: 'var(--maroon)' }}>Belum ada tugas RT</span>}
                                    </div>
                                )}

                                <p style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: u.is_active ? 'var(--moss)' : 'var(--maroon)', fontWeight: 600, fontSize: '12px', margin: '2px 0 0' }}>
                                    <span className={`dot ${!u.is_active ? 'dot-off' : ''}`}></span>{u.is_active ? 'Aktif' : 'Diblokir'}
                                </p>

                                <div className="row-actions">
                                    {u.role === 'petugas' && <button onClick={() => { openAssignModal(u); }}>Tugas RT</button>}
                                    <button onClick={() => { handleResetPassword(u.id); }}>Reset Sandi</button>
                                    {auth.user.id !== u.id && (
                                        <button className="danger" onClick={() => handleToggleStatus(u.id)}>{u.is_active ? 'Blokir' : 'Buka Blokir'}</button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {filteredUsers.length === 0 && (
                            <p style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '30px' }}>Pengguna tidak ditemukan.</p>
                        )}
                        
                        <p className="footnote-m">Menampilkan {filteredUsers.length} pengguna</p>
                    </div>
                </div>
            ) : (
                /* Desktop Layout */
                <div className="card">
                    <div className="toolbar">
                        <div className="search-wrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                            <input
                                type="text"
                                placeholder="Cari nama atau username..."
                                className="input"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
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
                                {filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td style={{ fontWeight: 600 }}>{user.nama}</td>
                                        <td className="mono" style={{ color: 'var(--text-soft)' }}>{user.username}</td>
                                        <td>
                                            <span className={`badge ${user.role === 'admin' ? 'badge-ink' : user.role === 'saksi' ? 'badge-brass' : 'badge-slate'}`}>
                                                {user.role === 'admin' ? 'Admin' : user.role === 'saksi' ? 'Saksi' : 'Petugas'}
                                            </span>
                                        </td>
                                        <td>
                                            {user.role === 'admin' ? (
                                                <span style={{ color: 'var(--text-soft)', fontSize: '13px' }}>Semua Wilayah</span>
                                            ) : user.wilayah && user.wilayah.length > 0 ? (
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: 300 }}>
                                                    {user.wilayah.map((rt: any) => (
                                                        <span key={rt.id} className="badge badge-slate" style={{ fontSize: '11px' }}>{rt.nama} ({rt.rw?.nama})</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--maroon)', fontSize: '13px' }}>Belum ada tugas</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span className={`dot ${!user.is_active ? 'dot-off' : ''}`}></span>
                                                <span style={{ fontSize: '13px', fontWeight: 500 }}>{user.is_active ? 'Aktif' : 'Diblokir'}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {user.role === 'petugas' && (
                                                <button className="btn-link" style={{ marginRight: 8 }} onClick={() => openAssignModal(user)}>Tugas RT</button>
                                            )}
                                            <button className="btn-link" style={{ marginRight: 8 }} onClick={() => handleResetPassword(user.id)}>Reset Sandi</button>
                                            {auth.user.id !== user.id && (
                                                <button className={`btn-link ${user.is_active ? 'danger' : ''}`} onClick={() => handleToggleStatus(user.id)}>
                                                    {user.is_active ? 'Blokir' : 'Buka Blokir'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '30px' }}>Pengguna tidak ditemukan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="footnote">
                        Menampilkan {filteredUsers.length} pengguna
                    </div>
                </div>
            )}

            {/* Modal Tambah Pengguna (Desktop & Mobile) */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => { setShowAddModal(false); setShowPassword(false); reset(); clearErrors(); }}>
                    <div className="modal-card" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-badge">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            Akses Pengguna
                        </div>

                        <h3 className="modal-title">Tambah Pengguna Baru</h3>
                        <p className="modal-desc">
                            Buat akun akses baru untuk Petugas Lapangan, Saksi, atau Administrator.
                        </p>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="field-label">Nama Lengkap *</label>
                                <input type="text" value={data.nama} onChange={e => setData('nama', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" placeholder="Nama lengkap petugas..." required />
                                {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                            </div>
                            <div>
                                <label className="field-label">Username *</label>
                                <input type="text" value={data.username} onChange={e => setData('username', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" placeholder="Username untuk login..." required />
                                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <label className="field-label" style={{ marginBottom: 0 }}>Password *</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: '2px 4px',
                                            fontSize: '12px',
                                            color: showPassword ? 'var(--brass, #A97A2E)' : 'var(--text-soft, #726C5E)',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontWeight: 500
                                        }}
                                    >
                                        {showPassword ? (
                                            <>
                                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="23" x2="23" y2="1"></line>
                                                </svg>
                                                <span>Sembunyikan password</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                                <span>Tampilkan password</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={data.password} 
                                        onChange={e => setData('password', e.target.value)} 
                                        className="w-full border-gray-300 rounded-md shadow-sm"
                                        style={{ paddingRight: '40px' }}
                                        placeholder="Masukkan kata sandi akun..."
                                        required 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: showPassword ? 'var(--brass, #A97A2E)' : 'var(--text-soft, #726C5E)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '4px'
                                        }}
                                        title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                    >
                                        {showPassword ? (
                                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="23" x2="23" y2="1"></line>
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="field-label">Peran (Role) *</label>
                                <select value={data.role} onChange={e => setData('role', e.target.value as any)} className="w-full border-gray-300 rounded-md shadow-sm">
                                    <option value="petugas">Petugas Lapangan</option>
                                    <option value="saksi">Saksi (Read-only)</option>
                                    <option value="admin">Administrator</option>
                                </select>
                                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                            </div>
                            <div className="modal-actions pt-4 border-t">
                                <button type="button" onClick={() => { setShowAddModal(false); setShowPassword(false); reset(); clearErrors(); }} className="btn btn-outline">
                                    Batal
                                </button>
                                <button type="submit" disabled={processing} className="btn btn-primary">
                                    {processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tugas Wilayah (Desktop & Mobile) */}
            {assignUser && (
                <div className="modal-overlay" onClick={() => setAssignUser(null)}>
                    <div className="modal-card" style={{ maxWidth: '480px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-badge">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            Penugasan Wilayah
                        </div>

                        <h3 className="modal-title">Tugas Wilayah: {assignUser.nama}</h3>
                        <p className="modal-desc">
                            Centang RT mana saja yang menjadi cakupan tugas petugas ini saat pemungutan suara.
                        </p>

                        <div className="overflow-y-auto flex-1 space-y-3 pr-1" style={{ maxHeight: '320px', marginBottom: '16px' }}>
                            {Object.entries(rwGroups).map(([rw, rts]) => (
                                <div key={rw} style={{ background: '#FBFAF7', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px', borderBottom: '1px dashed var(--line)', paddingBottom: '4px' }}>{rw}</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {rts.map(rt => (
                                            <label key={rt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={assignData.rt_ids.includes(rt.id)} onChange={() => toggleRt(rt.id)} className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500" />
                                                <span>{rt.nama}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {Object.keys(rwGroups).length === 0 && <p className="text-sm text-gray-500 text-center">Belum ada data RT/RW.</p>}
                        </div>

                        <div className="modal-actions pt-3 border-t">
                            <button type="button" onClick={() => setAssignUser(null)} className="btn btn-outline">
                                Batal
                            </button>
                            <button type="button" onClick={handleAssign} disabled={assignProcessing} className="btn btn-primary">
                                {assignProcessing ? 'Menyimpan...' : 'Simpan Tugas'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
