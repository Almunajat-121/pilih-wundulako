import React, { useState } from 'react';
import { Link, usePage, Head } from '@inertiajs/react';
import Toast from '../Components/Toast';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const { auth } = usePage().props as any;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { 
            name: 'Dashboard', href: '/admin/dashboard', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
        },
        { 
            name: 'Kelola Wilayah', href: '/admin/rw', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>
        },
        { 
            name: 'Data Kandidat', href: '/admin/kandidat', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M8.5 12.5 7 21l5-3 5 3-1.5-8.5"/></svg>
        },
        { 
            name: 'Pengguna & Petugas', href: '/admin/pengguna', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M15 20c0-2.6 1.5-4.6 3.5-4.9"/></svg>
        },
        { 
            name: 'Data Warga', href: '/admin/warga', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M6 16.5c0-1.5 1-2.5 2-2.5s2 1 2 2.5"/><path d="M14 10h5M14 14h3"/></svg>
        },
        { 
            name: 'Audit & Log Suara', href: '/admin/audit', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2.5" width="6" height="3" rx="1"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4"/></svg>
        },
        { 
            name: 'Pengaturan Voting', href: '/admin/voting-config', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        },
        { 
            name: 'Laporan', href: '/admin/laporan', 
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
        },
    ];

    return (
        <div className="admin-layout">
            {title && <Head title={`${title} - Admin`} />}
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
                    {navItems.map((item) => {
                        const isActive = typeof window !== 'undefined' && window.location.pathname.startsWith(item.href);
                        return (
                            <Link key={item.name} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                                {item.icon}
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                
                <div className="sidebar-foot">
                    <div className="voting-chip"><span className="dot"></span> Sistem Administrator</div>
                </div>
            </div>

            <div className="main">
                <header className="topbar">
                    <div>
                        <h2 className="page-title">{title}</h2>
                        <p className="page-sub">Sistem Manajemen Pemilihan RT/RW Wundulako</p>
                    </div>
                    <div className="topbar-right">
                        <span className="user-name">Halo, {auth?.user?.nama || 'Administrator'}</span>
                        <Link href="/logout" method="post" as="button" className="logout-link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
                            Keluar
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
