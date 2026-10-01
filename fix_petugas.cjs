const fs = require('fs');

const code = import React, { useEffect, useState } from 'react';
import { Link, usePage, Head, router } from '@inertiajs/react';
import Toast from '../Components/Toast';
import { useIsMobile } from '../lib/useIsMobile';

interface PetugasLayoutProps {
    children: React.ReactNode;
    title?: string;
    customHeader?: React.ReactNode;
}

export default function PetugasLayout({ children, title, customHeader }: PetugasLayoutProps) {
    const { auth } = usePage().props as any;
    const { url } = usePage();
    const [loading, setLoading] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        const start = () => setLoading(true);
        const finish = () => setLoading(false);

        const removeStart = router.on('start', start);
        const removeFinish = router.on('finish', finish);

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    // Get unique RTs and RWs
    const wilayah = auth?.user?.wilayah || [];
    const rts = Array.from(new Set(wilayah.map((w: any) => w.nama)));
    const rws = Array.from(new Set(wilayah.map((w: any) => w.rw?.nama).filter(Boolean)));

    if (!isMobile) {
        return (
            <div className="layout-desktop">
                {title && <Head title={title} />}
                <Toast />
                
                <div className="sidebar">
                    <div className="brand">
                        <div className="brand-mark">
                            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l4.5 4.5L20 6"/></svg>
                        </div>
                        <div>
                            <div className="brand-name">PilihPilih</div>
                            <div className="brand-sub">Kelurahan Wundulako</div>
                        </div>
                    </div>
                    <nav className="nav">
                        <Link href="/petugas/dashboard" className={
av-item }>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11.5L12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/></svg>
                            Beranda
                        </Link>
                        <Link href="/ganti-password" className={
av-item }>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.8"/><path d="M4.5 20c0-4.1 3.4-6.8 7.5-6.8s7.5 2.7 7.5 6.8"/></svg>
                            Profil
                        </Link>
                    </nav>
                    <div className="sidebar-foot">
                        <p style={{fontSize:'11px',color:'#8992A8',margin:'0 0 8px',fontWeight:600,letterSpacing:'.02em'}}>WILAYAH TUGAS</p>
                        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                            {rts.map((rt: any, i: number) => (
                                <span key={\t-\\} style={{fontSize:'11px',padding:'3px 9px',borderRadius:'5px',background:'rgba(169,122,46,.16)',color:'#D7B876',border:'1px solid rgba(169,122,46,.3)',fontWeight:500}}>{rt}</span>
                            ))}
                            {rws.map((rw: any, i: number) => (
                                <span key={\w-\\} style={{fontSize:'11px',padding:'3px 9px',borderRadius:'5px',background:'rgba(255,255,255,.08)',color:'#9FA7BC',border:'1px solid rgba(255,255,255,.12)',fontWeight:500}}>{rw}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="main">
                    {loading && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-50">
                            <div className="h-full bg-brass animate-pulse w-full"></div>
                        </div>
                    )}
                    <header className="topbar">
                        <div>
                            <h2 className="page-title">{title}</h2>
                        </div>
                        <div className="topbar-right">
                            <span className="user-name">Halo, {auth?.user?.nama}</span>
                            <Link href="/logout" method="post" as="button" className="logout-link">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg> Keluar
                            </Link>
                        </div>
                    </header>
                    <main className="content">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

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
                            className={\
av-tab \\}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11.5L12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/></svg>
                            <span>Beranda</span>
                        </Link>
                        <Link 
                            href="/ganti-password" 
                            className={\
av-tab \\}
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
\;

fs.writeFileSync('resources/js/Layouts/PetugasLayout.tsx', code);
