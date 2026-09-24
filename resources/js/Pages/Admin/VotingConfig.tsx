import React from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps, VotingConfig, Rt } from '../../types';

interface ConfigProps extends PageProps {
    config: VotingConfig;
    rt_list: Rt[];
}

export default function VotingConfigPage({ config, rt_list }: ConfigProps) {
    const handleToggleGlobal = () => {
        if (confirm(`Yakin ingin ${config.voting_aktif_global ? 'menutup' : 'membuka'} voting untuk seluruh kelurahan?`)) {
            router.put('/admin/pengaturan/global', { voting_aktif_global: !config.voting_aktif_global });
        }
    };

    const handleToggleLiveCount = () => {
        if (confirm(`Yakin ingin ${config.tampilkan_live_count ? 'menyembunyikan' : 'menampilkan'} live count ke publik?`)) {
            router.put('/admin/pengaturan/live-count', { tampilkan_live_count: !config.tampilkan_live_count });
        }
    };

    const handleToggleRt = (id: number, current: boolean) => {
        router.put(`/admin/pengaturan/rt/${id}`, { voting_aktif: !current });
    };

    return (
        <AdminLayout title="Pengaturan Voting">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Voting Seluruh Kelurahan</h3>
                        <p className="text-sm text-gray-500 mb-6">Mengontrol status voting secara global. Jika dimatikan, semua RT otomatis tidak dapat melakukan voting terlepas dari pengaturan per-RT.</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${config.voting_aktif_global ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="font-semibold">{config.voting_aktif_global ? 'Voting Aktif' : 'Voting Ditutup'}</span>
                        </div>
                        <button onClick={handleToggleGlobal} className={`px-4 py-2 rounded-md text-white font-medium text-sm transition-colors ${config.voting_aktif_global ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                            {config.voting_aktif_global ? 'Tutup Voting' : 'Buka Voting'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Tampilkan Live Count ke Publik</h3>
                        <p className="text-sm text-gray-500 mb-6">Jika diaktifkan, warga dapat melihat perolehan suara secara langsung melalui halaman publik. Disarankan diaktifkan setelah voting selesai.</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${config.tampilkan_live_count ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className="font-semibold">{config.tampilkan_live_count ? 'Ditampilkan' : 'Disembunyikan'}</span>
                        </div>
                        <button onClick={handleToggleLiveCount} className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${config.tampilkan_live_count ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                            {config.tampilkan_live_count ? 'Sembunyikan' : 'Tampilkan'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Pengaturan per RT</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b text-sm text-gray-500">
                                <th className="p-3 font-medium">Wilayah RT</th>
                                <th className="p-3 font-medium">Wilayah RW</th>
                                <th className="p-3 font-medium text-center">Status Voting</th>
                                <th className="p-3 font-medium text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rt_list.map(rt => (
                                <tr key={rt.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium text-gray-800">{rt.nama}</td>
                                    <td className="p-3 text-gray-600">{rt.rw?.nama}</td>
                                    <td className="p-3 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${rt.voting_aktif ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className={`text-sm font-medium ${rt.voting_aktif ? 'text-green-700' : 'text-red-700'}`}>{rt.voting_aktif ? 'Aktif' : 'Ditutup'}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button 
                                            onClick={() => handleToggleRt(rt.id, rt.voting_aktif)} 
                                            disabled={!config.voting_aktif_global}
                                            className={`px-3 py-1 rounded text-xs font-semibold border ${rt.voting_aktif ? 'bg-white text-red-600 border-red-200 hover:bg-red-50' : 'bg-white text-green-600 border-green-200 hover:bg-green-50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {rt.voting_aktif ? 'Tutup' : 'Buka'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
