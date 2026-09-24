import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import PetugasLayout from '@/Layouts/PetugasLayout';
import { Rt } from '@/types';

export default function Dashboard({ wilayah }: { wilayah: Rt[] }) {
    const { auth } = usePage().props as any;

    return (
        <PetugasLayout title="Dashboard">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Selamat datang, {auth?.user?.nama}</h2>
                <p className="text-sm text-gray-500">Pilih wilayah untuk mulai mencatat suara.</p>
            </div>

            <div className="space-y-4">
                {wilayah && wilayah.length > 0 ? (
                    wilayah.map((rt) => {
                        const total = rt.total_warga || 0;
                        const sudah = rt.sudah_memilih_rt || 0;
                        const progress = total > 0 ? Math.round((sudah / total) * 100) : 0;
                        const isAktif = rt.voting_aktif;

                        return (
                            <Link key={rt.id} href={`/petugas/wilayah/${rt.id}`} className="block">
                                <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-lg text-gray-800">
                                            {rt.nama} — {rt.rw?.nama}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isAktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {isAktif ? 'Aktif' : 'Ditutup'}
                                        </span>
                                    </div>
                                    
                                    <div className="mb-2 flex justify-between items-end">
                                        <span className="text-sm font-medium text-gray-600">
                                            Progres Voting
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {sudah} dari {total} warga sudah memilih
                                        </span>
                                    </div>
                                    
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <span className="text-4xl block mb-2">📋</span>
                        <p className="text-gray-500 text-sm">Tidak ada wilayah yang ditugaskan kepada Anda.</p>
                    </div>
                )}
            </div>
        </PetugasLayout>
    );
}
