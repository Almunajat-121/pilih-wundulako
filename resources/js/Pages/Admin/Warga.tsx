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
        <AdminLayout title="Data Warga">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-64">
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau NIK..." className="w-full border-gray-300 rounded-md text-sm shadow-sm" />
                        <button type="submit" className="bg-gray-100 px-3 py-2 rounded border border-gray-300 text-sm">Cari</button>
                    </form>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select value={filters.rt_id || ''} onChange={e => handleFilter('rt_id', e.target.value)} className="border-gray-300 rounded-md text-sm">
                            <option value="">Semua Wilayah</option>
                            {rt_list.map(rt => <option key={rt.id} value={rt.id}>{rt.nama} ({rt.rw?.nama})</option>)}
                        </select>
                        <select value={filters.status || ''} onChange={e => handleFilter('status', e.target.value)} className="border-gray-300 rounded-md text-sm">
                            <option value="">Semua Status</option>
                            <option value="sudah_memilih">Sudah Memilih (Semua)</option>
                            <option value="belum_dikunjungi">Belum Dikunjungi</option>
                            <option value="bermasalah">Bermasalah (&gt;= 3x Kunjungan)</option>
                        </select>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b text-sm text-gray-500">
                                <th className="p-3 font-medium">Nama</th>
                                <th className="p-3 font-medium">Wilayah</th>
                                <th className="p-3 font-medium">Status RT</th>
                                <th className="p-3 font-medium">Status RW</th>
                                <th className="p-3 font-medium text-center">Kunjungan</th>
                                <th className="p-3 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {warga.data.map(item => (
                                <tr key={item.id} className={`hover:bg-gray-50 text-sm ${item.jumlah_kunjungan >= 3 && item.status_vote_rt !== 'sudah_memilih' ? 'bg-red-50' : ''}`}>
                                    <td className="p-3">
                                        <div className="font-medium text-gray-800">{item.nama}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{item.alamat}</div>
                                    </td>
                                    <td className="p-3">
                                        <div className="text-gray-800">{item.rt?.nama}</div>
                                        <div className="text-xs text-gray-500">{item.rt?.rw?.nama}</div>
                                    </td>
                                    <td className="p-3">{getStatusBadge(item.status_vote_rt)}</td>
                                    <td className="p-3">{getStatusBadge(item.status_vote_rw)}</td>
                                    <td className="p-3 text-center">
                                        <span className={`font-semibold ${item.jumlah_kunjungan >= 3 ? 'text-red-600' : 'text-gray-700'}`}>{item.jumlah_kunjungan}x</span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <Link href={`/admin/warga/${item.id}`} className="text-blue-600 hover:text-blue-800 text-xs underline">Detail</Link>
                                    </td>
                                </tr>
                            ))}
                            {warga.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">Data tidak ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {warga.last_page > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-center gap-1">
                        {warga.links.map((link, idx) => (
                            <Link key={idx} href={link.url || '#'} className={`px-3 py-1 text-sm rounded ${link.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'} ${!link.url && 'opacity-50 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
