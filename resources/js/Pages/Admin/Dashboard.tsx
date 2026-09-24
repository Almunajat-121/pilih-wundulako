import React, { useEffect } from 'react';
import { usePage, router, Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps, Kandidat } from '../../types';

interface DashboardProps extends PageProps {
    stats: {
        total_warga: number;
        sudah_memilih_rt: number;
        sudah_memilih_rw: number;
        belum_dikunjungi: number;
        tidak_ditemukan: number;
        menolak: number;
    };
    progres_per_rw: Array<{
        rw_nama: string;
        total: number;
        sudah_rt: number;
        sudah_rw: number;
        persen_rt: number;
        persen_rw: number;
    }>;
    kandidat_rt: Kandidat[];
    kandidat_rw: Kandidat[];
}

export default function Dashboard({ stats, progres_per_rw, kandidat_rt, kandidat_rw }: DashboardProps) {
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ preserveState: true, preserveScroll: true });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AdminLayout title="Dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="text-gray-500 text-sm font-medium mb-1">Total Warga</div>
                    <div className="text-3xl font-bold text-gray-800">{stats.total_warga}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="text-gray-500 text-sm font-medium mb-1">Sudah Memilih RT</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.sudah_memilih_rt}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="text-gray-500 text-sm font-medium mb-1">Sudah Memilih RW</div>
                    <div className="text-3xl font-bold text-indigo-600">{stats.sudah_memilih_rw}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="text-gray-500 text-sm font-medium mb-1">Belum Dikunjungi</div>
                    <div className="text-3xl font-bold text-yellow-600">{stats.belum_dikunjungi}</div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Progres per RW</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b text-sm text-gray-500">
                                <th className="p-3 font-medium">RW</th>
                                <th className="p-3 font-medium text-center">Total Warga</th>
                                <th className="p-3 font-medium text-center">Progres RT</th>
                                <th className="p-3 font-medium text-center">Progres RW</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {progres_per_rw.map((rw, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3 font-medium text-gray-800">{rw.rw_nama}</td>
                                    <td className="p-3 text-center">{rw.total}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2 justify-center">
                                            <span className="text-sm">{rw.persen_rt.toFixed(1)}%</span>
                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rw.persen_rt}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2 justify-center">
                                            <span className="text-sm">{rw.persen_rw.toFixed(1)}%</span>
                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${rw.persen_rw}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {progres_per_rw.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-gray-500 text-sm">Tidak ada data RW</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-semibold text-gray-700">Perolehan Suara Ketua RT</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {kandidat_rt.map((kandidat) => (
                            <div key={kandidat.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-800">{kandidat.nama} <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-2">{kandidat.rt?.nama}</span></span>
                                    <span className="text-sm font-semibold">{kandidat.jumlah_suara} suara</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${kandidat.persentase || 0}%` }}></div>
                                    </div>
                                    <span className="text-sm text-gray-600 w-12 text-right">{kandidat.persentase?.toFixed(1) || 0}%</span>
                                </div>
                            </div>
                        ))}
                        {kandidat_rt.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-4">Belum ada data kandidat RT.</p>
                        )}
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-semibold text-gray-700">Perolehan Suara Ketua RW</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {kandidat_rw.map((kandidat) => (
                            <div key={kandidat.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-800">{kandidat.nama} <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded ml-2">{kandidat.rw?.nama}</span></span>
                                    <span className="text-sm font-semibold">{kandidat.jumlah_suara} suara</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${kandidat.persentase || 0}%` }}></div>
                                    </div>
                                    <span className="text-sm text-gray-600 w-12 text-right">{kandidat.persentase?.toFixed(1) || 0}%</span>
                                </div>
                            </div>
                        ))}
                        {kandidat_rw.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-4">Belum ada data kandidat RW.</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
