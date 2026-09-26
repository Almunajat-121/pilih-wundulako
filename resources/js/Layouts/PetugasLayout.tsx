import React, { useEffect, useState } from 'react';
import { Link, usePage, Head, router } from '@inertiajs/react';
import Toast from '../Components/Toast';

interface PetugasLayoutProps {
    children: React.ReactNode;
    title?: string;
    customHeader?: React.ReactNode;
}

export default function PetugasLayout({ children, title, customHeader }: PetugasLayoutProps) {
    const { auth } = usePage().props as any;
    const { url } = usePage();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const start = () => setLoading(true);
        const finish = () => setLoading(false);

        router.on('start', start);
        router.on('finish', finish);

        return () => {
            router.off('start', start);
            router.off('finish', finish);
        };
    }, []);

    return (
        <div className="mobile">
            <div className="phone-shell">
                {title && <Head title={title} />}
                <Toast />
                
                {loading && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-50">
                        <div className="h-full bg-brass animate-pulse w-full"></div>
                    </div>
                )}
                
                {customHeader ? (
                    customHeader
                ) : (
                    <header className="m-header">
                        <div>
                            <p className="m-title">PilihPilih Wundulako</p>
                            <p className="m-sub">Halo, {auth?.user?.nama}</p>
                        </div>
                        <div className="m-header-actions">
                            <Link href="/logout" method="post" as="button" className="chip-btn">
                                Keluar
                            </Link>
                        </div>
                    </header>
                )}

                <main className="m-content">
                    {children}
                </main>

                <div className="fixed-frame">
                    <nav className="bottom-nav">
                        <Link 
                            href="/petugas/dashboard" 
                            className={`nav-tab ${url.startsWith('/petugas/dashboard') ? 'active' : ''}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11.5L12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/></svg>
                            <span>Beranda</span>
                        </Link>
                        <Link 
                            href="/ganti-password" 
                            className={`nav-tab ${url.startsWith('/ganti-password') ? 'active' : ''}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.8"/><path d="M4.5 20c0-4.1 3.4-6.8 7.5-6.8s7.5 2.7 7.5 6.8"/></svg>
                            <span>Profil</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
}
