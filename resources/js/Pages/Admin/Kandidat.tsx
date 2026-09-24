import React, { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps, PaginatedData, Kandidat, Rw, Rt } from '../../types';

interface KandidatProps extends PageProps {
    kandidat: PaginatedData<Kandidat>;
    rw_list: Rw[];
    rt_list: Rt[];
    filters: {
        jenis?: string;
        wilayah?: string;
    };
}

export default function KandidatPage({ kandidat, rw_list, rt_list, filters }: KandidatProps) {
    const [showModal, setShowModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, reset, processing, errors, clearErrors } = useForm({
        nama: '',
        nomor_urut: '',
        jenis: 'RT' as 'RT' | 'RW',
        rt_id: '',
        rw_id: '',
        visi_misi: '',
        foto: null as File | null,
    });

    const handleFilter = (key: string, value: string) => {
        router.get('/admin/kandidat', { ...filters, [key]: value }, { preserveState: true, preserveScroll: true });
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/kandidat', {
            onSuccess: () => {
                setShowModal(false);
                reset();
                clearErrors();
            },
        });
    };

    const confirmDelete = (id: number) => {
        setDeletingId(id);
    };

    const handleDelete = () => {
        if (!deletingId) return;
        router.delete(`/admin/kandidat/${deletingId}`, {
            onSuccess: () => setDeletingId(null),
        });
    };

    return (
        <AdminLayout title="Kelola Kandidat">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select value={filters.jenis || ''} onChange={e => handleFilter('jenis', e.target.value)} className="border-gray-300 rounded-md text-sm">
                            <option value="">Semua Jenis</option>
                            <option value="RT">Ketua RT</option>
                            <option value="RW">Ketua RW</option>
                        </select>
                        <select value={filters.wilayah || ''} onChange={e => handleFilter('wilayah', e.target.value)} className="border-gray-300 rounded-md text-sm flex-1">
                            <option value="">Semua Wilayah</option>
                            {filters.jenis === 'RT' ? (
                                rw_list.map(rw => (
                                    <optgroup key={`rw-opt-${rw.id}`} label={`${rw.nama}`}>
                                        {rw.rt?.map((rt: any) => <option key={`rt-${rt.id}`} value={`rt-${rt.id}`}>{rt.nama}</option>)}
                                    </optgroup>
                                ))
                            ) : filters.jenis === 'RW' ? (
                                rw_list.map(rw => <option key={`rw-${rw.id}`} value={`rw-${rw.id}`}>{rw.nama}</option>)
                            ) : (
                                <>
                                    <optgroup label="RW">
                                        {rw_list.map(rw => <option key={`rw-${rw.id}`} value={`rw-${rw.id}`}>{rw.nama}</option>)}
                                    </optgroup>
                                    <optgroup label="RT">
                                        {rw_list.map(rw => (
                                            rw.rt?.map((rt: any) => <option key={`rt-${rt.id}`} value={`rt-${rt.id}`}>{rt.nama} ({rw.nama})</option>)
                                        ))}
                                    </optgroup>
                                </>
                            )}
                        </select>
                    </div>
                    <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm whitespace-nowrap">Tambah Kandidat</button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b text-sm text-gray-500">
                                <th className="p-3 font-medium">Foto</th>
                                <th className="p-3 font-medium">No. Urut</th>
                                <th className="p-3 font-medium">Nama</th>
                                <th className="p-3 font-medium">Jenis / Wilayah</th>
                                <th className="p-3 font-medium">Visi Misi</th>
                                <th className="p-3 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {kandidat.data.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 text-sm">
                                    <td className="p-3">
                                        {item.foto_url ? (
                                            <img src={item.foto_url} alt={item.nama} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">?</div>
                                        )}
                                    </td>
                                    <td className="p-3 font-semibold text-center">{item.nomor_urut}</td>
                                    <td className="p-3 font-medium text-gray-800">{item.nama}</td>
                                    <td className="p-3">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${item.jenis === 'RT' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                            {item.jenis} - {item.jenis === 'RT' ? item.rt?.nama : item.rw?.nama}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-500 truncate max-w-[200px]">{item.visi_misi || '-'}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => confirmDelete(item.id)} className="text-red-500 hover:text-red-700 p-1">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                            {kandidat.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">Data tidak ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {kandidat.last_page > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-center gap-1">
                        {kandidat.links.map((link, idx) => (
                            <Link key={idx} href={link.url || '#'} className={`px-3 py-1 text-sm rounded ${link.active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'} ${!link.url && 'opacity-50 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Tambah */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Tambah Kandidat</h3>
                            <button onClick={() => { setShowModal(false); reset(); clearErrors(); }} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleAdd} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input type="text" value={data.nama} onChange={e => setData('nama', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" required />
                                {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Urut</label>
                                    <input type="number" min="1" value={data.nomor_urut} onChange={e => setData('nomor_urut', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" required />
                                    {errors.nomor_urut && <p className="text-red-500 text-xs mt-1">{errors.nomor_urut}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pemilihan</label>
                                    <select value={data.jenis} onChange={e => { setData('jenis', e.target.value as any); setData('rt_id', ''); setData('rw_id', ''); }} className="w-full border-gray-300 rounded-md shadow-sm">
                                        <option value="RT">Ketua RT</option>
                                        <option value="RW">Ketua RW</option>
                                    </select>
                                    {errors.jenis && <p className="text-red-500 text-xs mt-1">{errors.jenis}</p>}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah</label>
                                {data.jenis === 'RT' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <select value={data.rw_id} onChange={e => { setData('rw_id', e.target.value); setData('rt_id', ''); }} className="w-full border-gray-300 rounded-md shadow-sm" required>
                                            <option value="">Pilih RW</option>
                                            {rw_list.map(rw => <option key={rw.id} value={rw.id}>{rw.nama}</option>)}
                                        </select>
                                        <select value={data.rt_id} onChange={e => setData('rt_id', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" required disabled={!data.rw_id}>
                                            <option value="">Pilih RT</option>
                                            {rw_list.find(rw => rw.id.toString() === data.rw_id)?.rt?.map((rt: any) => (
                                                <option key={rt.id} value={rt.id}>{rt.nama}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <select value={data.rw_id} onChange={e => setData('rw_id', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" required>
                                        <option value="">Pilih RW</option>
                                        {rw_list.map(rw => <option key={rw.id} value={rw.id}>{rw.nama}</option>)}
                                    </select>
                                )}
                                {errors.rt_id && <p className="text-red-500 text-xs mt-1">{errors.rt_id}</p>}
                                {errors.rw_id && <p className="text-red-500 text-xs mt-1">{errors.rw_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Visi Misi (Opsional)</label>
                                <textarea value={data.visi_misi} onChange={e => setData('visi_misi', e.target.value)} rows={3} className="w-full border-gray-300 rounded-md shadow-sm"></textarea>
                                {errors.visi_misi && <p className="text-red-500 text-xs mt-1">{errors.visi_misi}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Foto (Opsional)</label>
                                <input type="file" accept="image/*" onChange={e => setData('foto', e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {errors.foto && <p className="text-red-500 text-xs mt-1">{errors.foto}</p>}
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-3 border-t">
                                <button type="button" onClick={() => { setShowModal(false); reset(); clearErrors(); }} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Batal</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deletingId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Hapus</h3>
                        <p className="text-gray-600 mb-6 text-sm">Yakin menghapus kandidat ini? Semua data suara yang terkait akan ikut terhapus.</p>
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
