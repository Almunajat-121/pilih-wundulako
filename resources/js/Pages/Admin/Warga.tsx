import React, { useState } from 'react';
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
    const [search, setSearch] = useState(filters.search || '');
    
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
                                            <button onClick={(e) => { e.preventDefault(); alert('Fitur detail warga akan hadir di pembaruan selanjutnya.'); }} className="btn-link">Edit</button>
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
        </AdminLayout>
    );
}
