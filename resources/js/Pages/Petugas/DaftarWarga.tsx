import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import { Warga, Rt, PaginatedData } from '@/types';
import SearchInput from '@/Components/SearchInput';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';
import Pagination from '@/Components/Pagination';

interface DaftarWargaProps {
    warga: PaginatedData<Warga>;
    rt: Rt;
    filters: { search?: string; status?: string };
}

export default function DaftarWarga({ warga, rt, filters }: DaftarWargaProps) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search !== filters.search) {
                router.get(`/petugas/wilayah/${rt.id}`, { search, status: filters.status }, { preserveState: true, preserveScroll: true });
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, rt.id, filters.status, filters.search]);

    const setFilter = (status: string) => {
        router.get(`/petugas/wilayah/${rt.id}`, { search, status: status === filters.status ? '' : status }, { preserveState: true, preserveScroll: true });
    };

    return (
        <PetugasLayout title="Daftar Warga">
            <div className="mb-4 flex items-center gap-3">
                <Link href="/petugas/dashboard" className="text-gray-500 hover:text-gray-700">
                    <span>⬅️ Kembali</span>
                </Link>
                <h2 className="text-lg font-bold text-gray-800">{rt.nama} — {rt.rw?.nama}</h2>
            </div>

            {/* Search */}
            <div className="mb-4">
                <SearchInput 
                    value={search} 
                    onChange={setSearch} 
                    placeholder="Cari nama warga..." 
                />
            </div>

            {/* Filter chips */}
            <div className="flex overflow-x-auto gap-2 pb-2 mb-4 no-scrollbar">
                {['', 'belum_dikunjungi', 'sudah_memilih', 'tidak_ditemukan', 'menolak'].map((statusOption) => (
                    <button
                        key={statusOption}
                        onClick={() => setFilter(statusOption)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            (filters.status || '') === statusOption 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {statusOption === '' ? 'Semua' : statusOption.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {warga.data.length > 0 ? (
                    <div className="divide-y">
                        {warga.data.map((w) => (
                            <div key={w.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex-1 pr-4">
                                    <h3 className="font-bold text-gray-900">{w.nama}</h3>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{w.alamat}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <StatusBadge status={w.status_vote_rt} size="sm" />
                                    {w.status_vote_rt === 'belum_dikunjungi' || w.status_vote_rw === 'belum_dikunjungi' ? (
                                        <Link href={`/petugas/warga/${w.id}/vote`} className="text-xs font-semibold text-blue-600 border border-blue-600 px-3 py-1 rounded-full hover:bg-blue-50">
                                            Vote
                                        </Link>
                                    ) : (
                                        <button onClick={() => alert('Warga ini sudah menentukan pilihan.')} className="text-xs font-medium text-gray-400">
                                            Info
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                        title="Tidak ada warga ditemukan" 
                        description={search || filters.status ? "Coba ubah kata kunci pencarian atau filter status." : "Belum ada data warga di wilayah ini."} 
                    />
                )}
            </div>

            {/* Pagination Controls */}
            {warga.links && warga.data.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <Pagination links={warga.links} />
                </div>
            )}

            {/* FAB Tambah Warga */}
            <Link
                href={`/petugas/wilayah/${rt.id}/warga/baru`}
                className="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 transition-transform"
            >
                <span className="text-2xl font-light">+</span>
            </Link>
        </PetugasLayout>
    );
}
