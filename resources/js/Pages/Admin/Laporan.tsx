import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { PageProps } from '../../types';

interface LaporanProps extends PageProps {
    stats: {
        total_suara_masuk: number;
        total_warga: number;
        partisipasi: number;
        rt_selesai: number;
        total_rt: number;
    };
}

export default function Laporan({ stats }: LaporanProps) {
    const handleDownload = (type: 'excel' | 'pdf') => {
        window.location.href = `/admin/laporan/${type}`;
    };

    return (
        <AdminLayout title="Laporan & Unduh Data">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-gray-500 text-sm font-medium mb-1">Total Suara Masuk</h4>
                    <div className="text-3xl font-bold text-gray-800">{stats.total_suara_masuk} <span className="text-lg font-normal text-gray-500">/ {stats.total_warga}</span></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-gray-500 text-sm font-medium mb-1">Tingkat Partisipasi</h4>
                    <div className="text-3xl font-bold text-blue-600">{stats.partisipasi.toFixed(1)}%</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h4 className="text-gray-500 text-sm font-medium mb-1">RT Selesai Pemilihan</h4>
                    <div className="text-3xl font-bold text-green-600">{stats.rt_selesai} <span className="text-lg font-normal text-gray-500">/ {stats.total_rt}</span></div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Unduh Hasil Pemilihan</h2>
                    <p className="text-gray-600">Pilih format laporan yang ingin Anda unduh. Laporan berisi detail rekapitulasi suara per wilayah dan daftar warga yang telah menggunakan hak pilih.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => handleDownload('excel')} className="flex flex-col items-center justify-center p-6 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-colors group">
                        <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">dY?i</span>
                        <span className="font-bold text-green-800 text-lg">Download Excel</span>
                        <span className="text-sm text-green-600 mt-1">Format .xlsx</span>
                    </button>
                    
                    <button onClick={() => handleDownload('pdf')} className="flex flex-col items-center justify-center p-6 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-colors group">
                        <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">dY?i</span>
                        <span className="font-bold text-red-800 text-lg">Download PDF</span>
                        <span className="text-sm text-red-600 mt-1">Format Dokumen Cetak</span>
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}
