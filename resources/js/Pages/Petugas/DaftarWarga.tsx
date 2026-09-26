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

    const renderStatusBadge = (status: string) => {
        switch(status) {
            case 'belum_dikunjungi': return <span className="badge badge-slate">Belum memilih</span>;
            case 'sudah_memilih': return <span className="badge badge-moss">Sudah memilih</span>;
            case 'tidak_ditemukan': return <span className="badge badge-slate">Tidak ada</span>;
            case 'menolak': return <span className="badge badge-maroon">Menolak</span>;
            default: return <span className="badge badge-slate">Belum memilih</span>;
        }
    };

    const renderCardClass = (status: string) => {
        if (status === 'sudah_memilih') return 'm-card tone-moss';
        if (status === 'menolak') return 'm-card tone-maroon';
        return 'm-card';
    };

    const header = (
        <header className="m-header">
            <Link href="/petugas/dashboard" className="m-back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </Link>
            <div>
                <p className="m-title">Daftar Warga</p>
                <p className="m-sub">{rt.nama} / {rt.rw?.nama}</p>
            </div>
        </header>
    );

    return (
        <PetugasLayout title="Daftar Warga" customHeader={header}>
            <div className="m-toolbar">
                <div className="m-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                    <input 
                        type="text" 
                        placeholder="Cari nama warga..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="chip-row no-scrollbar">
                    {['', 'belum_dikunjungi', 'sudah_memilih', 'menolak', 'tidak_ditemukan'].map((statusOption) => {
                        let label = 'Semua';
                        if(statusOption === 'belum_dikunjungi') label = 'Belum';
                        if(statusOption === 'sudah_memilih') label = 'Sudah memilih';
                        if(statusOption === 'menolak') label = 'Menolak';
                        if(statusOption === 'tidak_ditemukan') label = 'Bermasalah';

                        return (
                            <button
                                key={statusOption}
                                onClick={() => setFilter(statusOption)}
                                className={`chip ${(filters.status || '') === statusOption ? 'active' : ''}`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {warga.data.length > 0 ? (
                    warga.data.map((w) => (
                        <div key={w.id} className={renderCardClass(w.status_vote_rt)}>
                            <div className="m-card-top">
                                <h3 className="m-card-name">{w.nama}</h3>
                                {renderStatusBadge(w.status_vote_rt)}
                            </div>
                            <p className="m-card-nik mono">Alamat: {w.alamat}</p>
                            
                            {w.status_vote_rt === 'sudah_memilih' && (
                                <p className="m-card-note" style={{ color: 'var(--moss)' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>
                                    Suara terekam
                                </p>
                            )}

                            {(w.status_vote_rt === 'belum_dikunjungi' || w.status_vote_rw === 'belum_dikunjungi') && (
                                <div className="m-card-actions">
                                    <Link href={`/petugas/warga/${w.id}/vote`} className="m-btn primary">
                                        Mulai voting
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[var(--line)]">
                        <span className="text-4xl block mb-2">📋</span>
                        <p className="text-[var(--text-soft)] text-sm">Tidak ada warga ditemukan.</p>
                    </div>
                )}
            </div>

            {warga.links && warga.data.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <Pagination links={warga.links} />
                </div>
            )}

            <Link href={`/petugas/wilayah/${rt.id}/warga/baru`} className="fab">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            </Link>
        </PetugasLayout>
    );
}
