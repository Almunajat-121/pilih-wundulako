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

export default function WargaPage({ warga, rt_list, filters }: WargaProps) {
    const isMobile = useIsMobile();
    const [search, setSearch] = useState(filters.search || '');
    const [editingWarga, setEditingWarga] = useState<Warga | null>(null);
    const [deletingWarga, setDeletingWarga] = useState<Warga | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleDelete = () => {
        if (!deletingWarga) return;
        router.delete(`/admin/warga/${deletingWarga.id}`, {
            onSuccess: () => setDeletingWarga(null),
        });
    };

    const { data: addData, setData: setAddData, post: postAdd, reset: resetAdd, clearErrors: clearAddErrors, errors: addErrors, processing: addProcessing } = useForm({
        nama: '',
        alamat: '',
        rt_id: '',
        tanggal_lahir: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        postAdd('/admin/warga', {
            onSuccess: () => {
                setShowAddModal(false);
                resetAdd();
                clearAddErrors();
            }
        });
    };

    const { data, setData, put, reset, clearErrors, errors, processing } = useForm({
        nama: '',
        alamat: '',
        rt_id: '',
        tanggal_lahir: ''
    });

    const { data: importData, setData: setImportData, post: postImport, processing: importProcessing, errors: importErrors, reset: resetImport } = useForm({
        file: null as File | null,
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

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        postImport('/admin/warga/import', {
            onSuccess: () => {
                setShowImportModal(false);
                resetImport();
            },
        });
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

    return (
        <AdminLayout title="Data Warga (DPT)">
            {isMobile ? (
                /* Mobile Layout */
                <div>
                    <div className="m-toolbar-plain">
                        <form onSubmit={handleSearch} className="m-search">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama warga..." />
                        </form>
                        <div className="chip-row no-scrollbar">
                            <div className={`chip ${filters.status === '' || !filters.status ? 'active' : ''}`} onClick={() => handleFilter('status', '')}>Semua status</div>
                            <div className={`chip ${filters.status === 'sudah_memilih' ? 'active' : ''}`} onClick={() => handleFilter('status', 'sudah_memilih')}>Sudah memilih</div>
                            <div className={`chip ${filters.status === 'belum_dikunjungi' ? 'active' : ''}`} onClick={() => handleFilter('status', 'belum_dikunjungi')}>Belum memilih</div>
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                            <button className="btn btn-primary" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => setShowAddModal(true)}>
                                + Tambah Warga
                            </button>
                            <button className="btn btn-outline" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => setShowImportModal(true)}>
                                Import DPT
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '26px', paddingTop: '12px' }}>
                        {warga.data.map(w => (
                            <div className="m-card" key={w.id}>
                                <div className="m-card-top">
                                    <h3 className="m-card-name" style={{ fontSize: '15px' }}>{w.nama}</h3>
                                    <span className="badge badge-slate">{w.rt?.nama} / {w.rt?.rw?.nama}</span>
                                </div>
                                <p className="m-card-nik" style={{ margin: '2px 0 8px' }}>{w.alamat}</p>

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                        <span style={{ color: 'var(--text-soft)' }}>RT:</span>
                                        {getStatusBadge(w.status_vote_rt)}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                        <span style={{ color: 'var(--text-soft)' }}>RW:</span>
                                        {getStatusBadge(w.status_vote_rw)}
                                    </div>
                                </div>

                                <div className="row-actions" style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => openEdit(w)}>Edit Data</button>
                                    <button onClick={() => setDeletingWarga(w)} style={{ color: 'var(--maroon)' }}>Hapus</button>
                                </div>
                            </div>
                        ))}

                        {warga.data.length === 0 && (
                            <p style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '30px' }}>Data tidak ditemukan.</p>
                        )}
                        
                        <p className="footnote-m">Menampilkan {warga.data.length} dari {warga.total} warga</p>
                    </div>
                </div>
            ) : (
                /* Desktop Layout */
                <div className="card">
                    <div className="toolbar">
                        <form onSubmit={handleSearch} className="search-wrap">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                            <input 
                                type="text" 
                                placeholder="Cari nama warga..." 
                                className="input" 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
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
                            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                Tambah Warga
                            </button>
                            <button className="btn btn-outline" onClick={() => setShowImportModal(true)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 20h16"/></svg>
                                Import DPT
                            </button>
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
                                {warga.data.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 600 }}>{item.nama}</td>
                                        <td>
                                            <div>{item.alamat}</div>
                                            <div style={{ color: 'var(--text-soft)', fontSize: '12px', marginTop: 2 }}>
                                                {item.rt?.nama} / {item.rt?.rw?.nama}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-soft)', width: 22 }}>RT:</span>
                                                    {getStatusBadge(item.status_vote_rt)}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontSize: '11px', color: 'var(--text-soft)', width: 22 }}>RW:</span>
                                                    {getStatusBadge(item.status_vote_rw)}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-slate">{item.jumlah_kunjungan} kali</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <button className="btn-link" onClick={() => openEdit(item)}>Edit</button>
                                                <button className="btn-link danger" onClick={() => setDeletingWarga(item)} style={{ color: 'var(--maroon)' }}>Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {warga.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '30px' }}>Data tidak ditemukan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="footnote" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Menampilkan {warga.data.length} dari total {warga.total} warga</span>
                        {warga.last_page > 1 && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {warga.links.map((link, idx) => (
                                    <Link key={idx} href={link.url || '#'} className={`badge ${link.active ? 'badge-ink' : 'badge-slate'}`} style={{ opacity: !link.url ? 0.5 : 1, textDecoration: 'none' }} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Edit Warga (Desktop & Mobile) */}
            {editingWarga && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
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

            {/* Modal Tambah Warga (Desktop & Mobile) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="font-bold text-gray-800">Tambah Data Warga Baru</h3>
                            <button onClick={() => { setShowAddModal(false); resetAdd(); clearAddErrors(); }} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleAdd} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    value={addData.nama}
                                    onChange={e => setAddData('nama', e.target.value)}
                                    placeholder="Nama sesuai KTP..."
                                    className="w-full border-gray-300 rounded-md shadow-sm"
                                    required
                                />
                                {addErrors.nama && <p className="text-red-500 text-xs mt-1">{addErrors.nama}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah RT / RW *</label>
                                <select
                                    value={addData.rt_id}
                                    onChange={e => setAddData('rt_id', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm"
                                    required
                                >
                                    <option value="">Pilih RT / RW</option>
                                    {rt_list.map(rt => <option key={rt.id} value={rt.id}>{rt.nama} / {rt.rw?.nama}</option>)}
                                </select>
                                {addErrors.rt_id && <p className="text-red-500 text-xs mt-1">{addErrors.rt_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Domisili</label>
                                <textarea
                                    value={addData.alamat}
                                    onChange={e => setAddData('alamat', e.target.value)}
                                    placeholder="Contoh: Jl. Poros Wundulako No. 12"
                                    rows={2}
                                    className="w-full border-gray-300 rounded-md shadow-sm"
                                ></textarea>
                                {addErrors.alamat && <p className="text-red-500 text-xs mt-1">{addErrors.alamat}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir (Opsional)</label>
                                <input
                                    type="date"
                                    value={addData.tanggal_lahir}
                                    onChange={e => setAddData('tanggal_lahir', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm"
                                />
                                {addErrors.tanggal_lahir && <p className="text-red-500 text-xs mt-1">{addErrors.tanggal_lahir}</p>}
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddModal(false); resetAdd(); clearAddErrors(); }}
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addProcessing}
                                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                                >
                                    {addProcessing ? 'Menyimpan...' : 'Simpan Warga'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Import DPT (Desktop & Mobile) */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="font-bold text-gray-800">Import Data DPT Warga</h3>
                            <button onClick={() => { setShowImportModal(false); resetImport(); }} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleImport} className="p-4 space-y-4">
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 leading-relaxed">
                                <p className="font-semibold mb-1">Petunjuk Format File:</p>
                                <p>File harus memiliki kolom header: <code>nama</code>, <code>alamat</code>, <code>rt</code>, <code>rw</code>, dan <code>tanggal_lahir</code> (opsional).</p>
                                <p className="mt-1 text-gray-600">Pastikan kolom <code>rw</code> diisi (misal: <code>RW 01</code>) agar warga masuk ke RT pada RW yang tepat.</p>
                                <div className="mt-2">
                                    <a href="/admin/warga/import/template" className="inline-flex items-center gap-1 font-semibold text-blue-700 underline hover:text-blue-900">
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 20h16"/></svg>
                                        Unduh Contoh Template CSV
                                    </a>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih File (Excel / CSV)</label>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={e => setImportData('file', e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    required
                                />
                                {importErrors.file && (
                                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg max-h-48 overflow-y-auto">
                                        <p className="text-red-700 text-xs font-semibold mb-1">Gagal Mengimpor File:</p>
                                        <p className="text-red-600 text-xs whitespace-pre-line leading-relaxed">{importErrors.file}</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <button type="button" onClick={() => { setShowImportModal(false); resetImport(); }} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Batal</button>
                                <button type="submit" disabled={importProcessing} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                                    {importProcessing ? 'Mengimpor...' : 'Mulai Import'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus Warga (Desktop & Mobile) */}
            {deletingWarga && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-base">Hapus Data Warga?</h3>
                                <p className="text-xs text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Apakah Anda yakin ingin menghapus data warga <strong>{deletingWarga.nama}</strong> ({deletingWarga.rt?.nama} / {deletingWarga.rt?.rw?.nama})?
                        </p>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button
                                type="button"
                                onClick={() => setDeletingWarga(null)}
                                className="px-3.5 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-3.5 py-1.5 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 font-medium"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
