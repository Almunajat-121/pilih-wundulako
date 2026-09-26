import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import { Rt } from '@/types';

export default function Dashboard({ wilayah }: { wilayah: Rt[] }) {
    const { auth } = usePage().props as any;

    return (
        <PetugasLayout title="Dashboard">
            <h2 className="section-title" style={{ marginTop: '4px' }}>Tugas wilayah Anda</h2>

            <div className="flex flex-col gap-3">
                {wilayah && wilayah.length > 0 ? (
                    wilayah.map((rt) => {
                        const total = rt.total_warga || 0;
                        const sudah = rt.sudah_memilih_rt || 0;
                        const progress = total > 0 ? Math.round((sudah / total) * 100) : 0;
                        const isAktif = rt.voting_aktif;

                        return (
                            <Link key={rt.id} href={`/petugas/wilayah/${rt.id}`} className="task-card">
                                <div className="task-head">
                                    <div>
                                        <p className="task-rt">{rt.nama}</p>
                                        <p className="task-rw">{rt.rw?.nama}</p>
                                    </div>
                                    <span className={`badge ${isAktif ? 'badge-moss' : 'badge-slate'}`}>
                                        {isAktif ? 'Voting aktif' : 'Ditutup'}
                                    </span>
                                </div>
                                <div className="task-body">
                                    <div className="task-progress-label">
                                        <span style={{ color: 'var(--text-soft)', fontWeight: 500 }}>Progres kunjungan</span>
                                        <span className="num" style={{ fontWeight: 600, color: isAktif ? 'var(--brass)' : 'var(--moss)' }}>
                                            {sudah} / {total}
                                        </span>
                                    </div>
                                    <div className="progress">
                                        <span style={{ width: `${progress}%`, background: isAktif ? 'var(--brass)' : 'var(--moss)' }}></span>
                                    </div>
                                    {isAktif && (
                                        <p className="task-cta">Ketuk untuk lihat daftar warga &rarr;</p>
                                    )}
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[var(--line)]">
                        <span className="text-4xl block mb-2">📋</span>
                        <p className="text-[var(--text-soft)] text-sm">Tidak ada wilayah yang ditugaskan kepada Anda.</p>
                    </div>
                )}
            </div>
        </PetugasLayout>
    );
}
