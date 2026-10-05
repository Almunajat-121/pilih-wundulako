import React, { useState } from 'react';
import { useIsMobile } from '../../lib/useIsMobile';
import { useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps, PaginatedData, Warga, Rt } from '../../types';

interface WargaProps extends PageProps {
    warga: PaginatedData<Warga>;
    rt_list: Rt[];
    filters: {
        search?: string;
        rt_id?: string;
        status?: string;
    };
}

export default function WargaPage({
warga, rt_list, filters }: WargaProps) {
    const isMobile = useIsMobile();
    const [search, setSearch] = useState(filters.search || '');
    const [editingWarga, setEditingWarga] = useState<Warga | null>(null);

    const { data, setData, put, reset, clearErrors, errors, processing } = useForm({
        nama: '',
        alamat: '',
        rt_id: '',
        tanggal_lahir: ''
    });

    const openEdit = (w: Warga) => {
        setEditingWarga(w);
        setData({
            nama: w.nama,
            alamat: w.alamat || '',
            rt_id: w.rt_id.toString(),
            tanggal_lahir: w.tanggal_lahir ? w.tanggal_lahir.split('T')[0] : ''
        });
        clearErrors();
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingWarga) {
            put(`/admin/warga/${editingWarga.id}`, {
                onSuccess: () => setEditingWarga(null)
            });
        }
    };
    
    const handleFilter = (key: string, value: string) => {
        router.get('/admin/warga', { ...filters, [key]: value, search }, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/warga', { ...filters, search }, { preserveState: true, preserveScroll: true });
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'sudah_memilih': return <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Sudah</span>;
            case 'belum_dikunjungi': return <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Belum</span>;
            case 'tidak_ditemukan': return <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">Tidak Ada</span>;
            case 'menolak': return <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Menolak</span>;
            default: return <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };


    if (isMobile) {
        return (
            <AdminLayout title="Data Warga (DPT)">
                <div className="m-toolbar-plain">
                    <form onSubmit={handleSearch} className="m-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama warga..." />
                    </form>
                    <div className="chip-row no-scrollbar">
                        <div className={`chip ${filters.status === '' || !filters.status ? 'active' : ''}`} onClick={() => handleFilter('status', '')}>Semua status</div>
                        <div className={`chip ${filters.status === 'sudah_memilih' ? 'active' : ''}`} onClick={() => handleFilter('status', 'sudah_memilih')}>Sudah memilih</div>
                        <div className={`chip ${filters.status === 'belum_dikunjungi' ? 'active' : ''}`} onClick={() => handleFilter('status', 'belum_dikunjungi')}>Belum dikunjungi</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '26px' }}>
                    {warga.data.map(item => {
                        const statusClass = item.status_vote_rt === 'sudah_memilih' ? 'badge-moss' : 
                                           item.status_vote_rt === 'tidak_ditemukan' ? 'badge-maroon' : 'badge-slate';
                        const statusLabel = item.status_vote_rt === 'sudah_memilih' ? 'Sudah memilih' :
                                           item.status_vote_rt === 'tidak_ditemukan' ? 'Tidak ditemukan' : 'Belum memilih';
                        const toneClass = item.status_vote_rt === 'sudah_memilih' ? 'tone-moss' : 
                                         item.status_vote_rt === 'tidak_ditemukan' ? 'tone-maroon' : '';
                        
                        return (
                            <div className={`m-card ${toneClass}`} key={item.id}>
                                <div className="m-card-top">
                                    <h3 className="m-card-name">{item.nama}</h3>
                                    <span className={`badge ${statusClass}`}>{statusLabel}</span>
                                </div>
                                <p className="m-card-nik mono">Lahir: {item.tanggal_lahir || '-'} &middot; {item.rt?.nama}/{item.rt?.rw?.nama}</p>
                                <div className="row-actions"><button onClick={() => openEdit(item)}>Edit</button></div>
                            </div>
                        );
                    })}
                    
                    <p className="footnote-m">Menampilkan {warga.data.length} dari total data</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                        {warga.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && handleFilter('page', link.label)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`chip-btn ${link.active ? 'active' : ''}`}
                                style={{ 
                                    background: link.active ? 'var(--ink)' : 'var(--slate-soft)', 
                                    color: link.active ? '#fff' : 'var(--slate)',
                                    opacity: !link.url ? 0.5 : 1
                                }}
                            />
                        ))}
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Data Warga (DPT)">
            <div className="card">
                <div className="toolbar">
                    <form onSubmit={handleSearch} className="search-wrap" style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau NIK..." className="input" />
                        </div>
                        <button type="submit" className="btn btn-outline" style={{ display: 'none' }}>Cari</button>
                    </form>
                    
                    <div className="toolbar-filters">
                        <select value={filters.status || ''} onChange={e => handleFilter('status', e.target.value)} className="select">
                            <option value="">Semua Status</option>
                            <option value="sudah_memilih">Sudah Memilih</option>
                            <option value="belum_dikunjungi">Belum Dikunjungi</option>
                            <option value="bermasalah">Bermasalah</option>
                        </select>
                        <select value={filters.rt_id || ''} onChange={e => handleFilter('rt_id', e.target.value)} className="select">
                            <option value="">Semua Wilayah</option>
                            {rt_list.map(rt => <option key={rt.id} value={rt.id}>{rt.nama} / {rt.rw?.nama}</option>)}
                        </select>
                        <button className="btn btn-outline" onClick={() => alert('Fitur Import DPT akan segera hadir.')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 20h16"/></svg>
                            Import DPT
                        </button>
                        <button className="btn btn-primary" onClick={() => alert('Gunakan aplikasi Petugas untuk mendata warga secara langsung.')}>+ Tambah</button>
                    </div>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Nama lengkap</th>
                                <th>Alamat / Wilayah</th>
                                <th>Status Pemilihan</th>
                                <th>Kunjungan</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warga.data.map(item => {
                                const isFlagged = item.jumlah_kunjungan >= 3 && item.status_vote_rt !== 'sudah_memilih';
                                return (
                                    <tr key={item.id} className={isFlagged ? 'row-flag' : ''}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{item.nama}</div>
                                            {item.tanggal_lahir && <div className="mono" style={{ color: 'var(--text-soft)', fontSize: '11.5px', marginTop: 2 }}>Lahir: {item.tanggal_lahir}</div>}
                                        </td>
                                        <td>
                                            <div>{item.rt?.nama} / {item.rt?.rw?.nama}</div>
                                            <div style={{ color: 'var(--text-soft)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{item.alamat}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                                                {getStatusBadge(item.status_vote_rt)}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{ fontWeight: 600, color: isFlagged ? 'var(--maroon)' : 'inherit' }}>{item.jumlah_kunjungan}x</span>
                                        </td>
                                        <td>
                                            <button onClick={(e) => { e.preventDefault(); openEdit(item); }} className="btn-link">Edit</button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {warga.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '30px' }}>Data tidak ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {warga.last_page > 1 && (
                    <div className="footnote" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        {warga.links.map((link, idx) => (
                            <Link key={idx} href={link.url || '#'} className={`badge ${link.active ? 'badge-ink' : 'badge-slate'}`} style={{ opacity: !link.url ? 0.5 : 1, textDecoration: 'none' }} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>

            {editingWarga && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Edit Data Warga</h3>
                            <button onClick={() => { setEditingWarga(null); reset(); clearErrors(); }} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleEdit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input type="text" value={data.nama} onChange={e => setData('nama', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" required />
                                {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                                <input type="date" value={data.tanggal_lahir} onChange={e => setData('tanggal_lahir', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" />
                                {errors.tanggal_lahir && <p className="text-red-500 text-xs mt-1">{errors.tanggal_lahir}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                                <textarea value={data.alamat} onChange={e => setData('alamat', e.target.value)} rows={2} className="w-full border-gray-300 rounded-md shadow-sm"></textarea>
                                {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah RT</label>
                                <select value={data.rt_id} onChange={e => setData('rt_id', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" required>
                                    <option value="">Pilih RT</option>
                                    {rt_list.map(rt => <option key={rt.id} value={rt.id}>{rt.nama} / {rt.rw?.nama}</option>)}
                                </select>
                                {errors.rt_id && <p className="text-red-500 text-xs mt-1">{errors.rt_id}</p>}
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <button type="button" onClick={() => { setEditingWarga(null); reset(); clearErrors(); }} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Batal</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
