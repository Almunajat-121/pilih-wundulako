import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import { Warga, Rt, PaginatedData } from '@/types';
import { useIsMobile } from '@/lib/useIsMobile';
import SearchInput from '@/Components/SearchInput';
import Pagination from '@/Components/Pagination';

interface Props {
    warga: PaginatedData<Warga>;
    rt: Rt;
    filters: { search?: string; status?: string };
}

export default function DaftarWarga({ warga, rt, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const isMobile = useIsMobile();
    const initialRender = useRef(true);

    const handleFilter = (key: string, value: string) => {
        router.get(`/petugas/wilayah/${rt.id}`, { ...filters, [key]: value, page: 1 }, { preserveState: true, preserveScroll: true });
    };

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }
        const delay = setTimeout(() => {
            router.get(`/petugas/wilayah/${rt.id}`, { ...filters, search, page: 1 }, { preserveState: true, preserveScroll: true });
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);

    const getStatusBadge = (status: string) => {
        if (status === 'sudah_memilih') return <span className="badge badge-moss">Sudah memilih</span>;
        if (status === 'tidak_ditemukan') return <span className="badge badge-brass">Tidak ditemukan</span>;
        if (status === 'menolak') return <span className="badge badge-maroon">Menolak</span>;
        return <span className="badge badge-slate">Belum dikunjungi</span>;
    };

    const isBermasalah = (w: Warga) => w.status_vote_rt === 'tidak_ditemukan' || w.status_vote_rt === 'menolak' || w.status_vote_rw === 'tidak_ditemukan' || w.status_vote_rw === 'menolak';
    const isSudah = (w: Warga) => w.status_vote_rt === 'sudah_memilih' || w.status_vote_rw === 'sudah_memilih';
    
    if (!isMobile) {
        return (
            <PetugasLayout title={`Daftar Warga - ${rt.nama}`} customHeader={
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link href="/petugas/dashboard" className="btn-link" style={{ color: 'var(--text-soft)' }}>&larr; Kembali</Link>
                        <div>
                            <h2 className="page-title">{rt.nama}</h2>
                            <p className="page-sub">Kelola dan input suara warga</p>
                        </div>
                    </div>
                </header>
            }>
                <div className="content-narrow">
                    <div className="card">
                        <div className="toolbar">
                            <div className="search-wrap">
                                <SearchInput value={search} onChange={setSearch} placeholder="Cari nama warga..." className="w-[280px]" />
                            </div>
                            <div className="toolbar-filters">
                                <div className="chip-row-desktop">
                                    <button className={`chip-desktop ${!filters.status ? 'active' : ''}`} onClick={() => handleFilter('status', '')}>Semua</button>
                                    <button className={`chip-desktop ${filters.status === 'belum_dikunjungi' ? 'active' : ''}`} onClick={() => handleFilter('status', 'belum_dikunjungi')}>Belum</button>
                                    <button className={`chip-desktop ${filters.status === 'sudah_memilih' ? 'active' : ''}`} onClick={() => handleFilter('status', 'sudah_memilih')}>Sudah memilih</button>
                                    <button className={`chip-desktop ${filters.status === 'bermasalah' ? 'active' : ''}`} onClick={() => handleFilter('status', 'bermasalah')}>Bermasalah</button>
                                </div>
                                <Link href={`/petugas/wilayah/${rt.id}/warga/baru`} className="btn btn-primary">+ Tambah Warga</Link>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nama warga</th>
                                        <th>Alamat</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {warga.data.map(w => {
                                        const finalStatus = isSudah(w) ? 'sudah_memilih' : isBermasalah(w) ? w.status_vote_rt : w.status_vote_rt;
                                        return (
                                            <tr key={w.id}>
                                                <td style={{ fontWeight: 600 }}>{w.nama}</td>
                                                <td style={{ color: 'var(--text-soft)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.alamat}</td>
                                                <td>{getStatusBadge(finalStatus)}</td>
                                                <td>
                                                    {!isSudah(w) ? (
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <Link href={`/petugas/warga/${w.id}/vote`} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Mulai voting</Link>
                                                            <Link href={`/petugas/warga/${w.id}/status`} className="btn" style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink)' }}>Ubah status</Link>
                                                        </div>
                                                    ) : (
                                                        <span className="status-note" style={{ color: 'var(--moss)' }}>
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>
                                                            Terekam
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {warga.data.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-soft)' }}>
                                                Tidak ada data warga ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {warga.last_page > 1 && (
                            <div style={{ padding: '16px', borderTop: '1px solid var(--line)' }}>
                                <Pagination links={warga.links} />
                            </div>
                        )}
                    </div>
                </div>
            </PetugasLayout>
        );
    }

    return (
        <PetugasLayout title={`Daftar Warga - ${rt.nama}`} customHeader={
            <header className="m-header-plain">
                <Link href="/petugas/dashboard" className="back-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </Link>
                <div>
                    <h2 className="m-header-title">{rt.nama}</h2>
                    <p className="m-header-sub">{rt.rw?.nama}</p>
                </div>
            </header>
        }>
            <div className="m-toolbar-plain" style={{ padding: '12px 18px 0' }}>
                <SearchInput value={search} onChange={setSearch} placeholder="Cari nama warga..." className="w-full" />
            </div>
            
            <div className="chip-row no-scrollbar" style={{ padding: '12px 18px' }}>
                <div className={`chip ${!filters.status ? 'active' : ''}`} onClick={() => handleFilter('status', '')}>Semua</div>
                <div className={`chip ${filters.status === 'belum_dikunjungi' ? 'active' : ''}`} onClick={() => handleFilter('status', 'belum_dikunjungi')}>Belum Dikunjungi</div>
                <div className={`chip ${filters.status === 'sudah_memilih' ? 'active' : ''}`} onClick={() => handleFilter('status', 'sudah_memilih')}>Sudah Memilih</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '86px' }}>
                {warga.data.map(w => {
                    const finalStatus = isSudah(w) ? 'sudah_memilih' : isBermasalah(w) ? w.status_vote_rt : w.status_vote_rt;
                    return (
                        <div className="m-card" key={w.id} onClick={() => router.get(`/petugas/warga/${w.id}/vote`)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p className="m-card-name" style={{ fontSize: '15px' }}>{w.nama}</p>
                                    <p className="m-card-sub" style={{ fontSize: '12px', marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{w.alamat}</p>
                                </div>
                                {getStatusBadge(finalStatus)}
                            </div>
                        </div>
                    );
                })}
                {warga.data.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500 text-sm mb-2">Tidak ada data warga.</p>
                        {search && <p className="text-gray-400 text-xs">Coba hapus filter pencarian.</p>}
                    </div>
                )}
                {warga.last_page > 1 && (
                    <Pagination links={warga.links} />
                )}
            </div>

            <Link href={`/petugas/wilayah/${rt.id}/warga/baru`} className="fab">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </Link>
        </PetugasLayout>
    );
}
