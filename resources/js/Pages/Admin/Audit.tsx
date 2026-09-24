import React, { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps, PaginatedData, Vote, StatusLog } from '../../types';

interface AuditProps extends PageProps {
    votes?: PaginatedData<Vote>;
    status_logs?: PaginatedData<StatusLog>;
    tab: 'votes' | 'status_logs';
    filters: any;
}

export default function Audit({ votes, status_logs, tab, filters }: AuditProps) {
    const [voidModal, setVoidModal] = useState<number | null>(null);
    const { data, setData, put, reset, processing, errors } = useForm({
        alasan: '',
    });

    const handleVoid = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/audit/votes/${voidModal}/void`, {
            onSuccess: () => {
                setVoidModal(null);
                reset();
            }
        });
    };

    return (
        <AdminLayout title="Audit Log">
            <div className="mb-6 flex gap-2">
                <Link href="/admin/audit?tab=votes" className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${tab === 'votes' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    Log Suara
                </Link>
                <Link href="/admin/audit?tab=status_logs" className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${tab === 'status_logs' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    Log Status Warga
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {tab === 'votes' && votes && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b text-sm text-gray-500">
                                    <th className="p-3 font-medium">Waktu</th>
                                    <th className="p-3 font-medium">Petugas</th>
                                    <th className="p-3 font-medium">Warga</th>
                                    <th className="p-3 font-medium">Kandidat Pilihan</th>
                                    <th className="p-3 font-medium">Jenis</th>
                                    <th className="p-3 font-medium">Status</th>
                                    <th className="p-3 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {votes.data.map(vote => (
                                    <tr key={vote.id} className="hover:bg-gray-50 text-sm">
                                        <td className="p-3 whitespace-nowrap">{new Date(vote.created_at).toLocaleString()}</td>
                                        <td className="p-3 font-medium">{vote.petugas?.nama}</td>
                                        <td className="p-3">{vote.warga?.nama}</td>
                                        <td className="p-3">{vote.kandidat?.nama}</td>
                                        <td className="p-3">{vote.jenis}</td>
                                        <td className="p-3">
                                            {vote.status === 'valid' ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Valid</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs" title={vote.alasan_void || ''}>Void</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {vote.status === 'valid' && (
                                                <button onClick={() => setVoidModal(vote.id)} className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 border border-red-200 rounded">VOID</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    
                    {tab === 'status_logs' && status_logs && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b text-sm text-gray-500">
                                    <th className="p-3 font-medium">Waktu</th>
                                    <th className="p-3 font-medium">Aktor</th>
                                    <th className="p-3 font-medium">Warga</th>
                                    <th className="p-3 font-medium">Jenis</th>
                                    <th className="p-3 font-medium">Perubahan Status</th>
                                    <th className="p-3 font-medium">Alasan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {status_logs.data.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 text-sm">
                                        <td className="p-3 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                                        <td className="p-3 font-medium">{log.aktor?.nama || 'Sistem'}</td>
                                        <td className="p-3">{log.warga?.nama}</td>
                                        <td className="p-3">{log.jenis}</td>
                                        <td className="p-3">
                                            <span className="text-gray-500">{log.status_lama}</span> 
                                            <span className="mx-2">→</span> 
                                            <span className="font-semibold text-gray-800">{log.status_baru}</span>
                                        </td>
                                        <td className="p-3 text-gray-600">{log.alasan || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {voidModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 text-red-600">Peringatan Void Suara</h3>
                        <p className="text-gray-600 mb-4 text-sm">Anda akan membatalkan (void) suara ini. Tindakan ini akan mengurangi perolehan suara kandidat dan mereset status warga. Harap masukkan alasan yang jelas.</p>
                        <form onSubmit={handleVoid}>
                            <textarea 
                                value={data.alasan} 
                                onChange={e => setData('alasan', e.target.value)} 
                                placeholder="Alasan void (min. 10 karakter)..." 
                                className="w-full border-gray-300 rounded-md shadow-sm mb-2" 
                                rows={3} 
                                required 
                                minLength={10}
                            ></textarea>
                            {errors.alasan && <p className="text-red-500 text-xs mb-4">{errors.alasan}</p>}
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => { setVoidModal(null); reset(); }} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md">Batal</button>
                                <button type="submit" disabled={processing || data.alasan.length < 10} className="px-4 py-2 text-sm text-white bg-red-600 rounded-md disabled:opacity-50">Void Suara</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
