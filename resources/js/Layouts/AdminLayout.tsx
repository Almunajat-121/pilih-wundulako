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
        { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
        { name: 'Wilayah', href: '/admin/rw', icon: '📍' },
        { name: 'Kandidat', href: '/admin/kandidat', icon: '👥' },
        { name: 'Pengguna', href: '/admin/pengguna', icon: '⚙️' },
        { name: 'Data Warga', href: '/admin/warga', icon: '📋' },
        { name: 'Audit Log', href: '/admin/audit', icon: '🛡️' },
        { name: 'Pengaturan Voting', href: '/admin/voting-config', icon: '🔧' },
        { name: 'Laporan', href: '/admin/laporan', icon: '📥' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {title && <Head title={title} />}
            <Toast />
            
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 bg-gray-900 text-white w-64 flex flex-col z-30 transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-blue-400">PilihPilih Admin</h2>
                    <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>✕</button>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = typeof window !== 'undefined' && window.location.pathname.startsWith(item.href);
                        return (
                            <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                                <span>{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-800 bg-gray-900">
                    <p className="text-sm font-medium text-gray-400">Login sebagai</p>
                    <p className="text-sm text-gray-200 capitalize">{auth?.user?.role || 'Admin'}</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="bg-white border-b px-4 py-3 flex items-center justify-between z-10 shadow-sm md:justify-end">
                    <div className="flex items-center gap-3 md:hidden">
                        <button onClick={() => setSidebarOpen(true)} className="text-gray-600 text-xl">☰</button>
                        <span className="font-bold text-blue-700">PilihPilih</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700 hidden md:inline-block">Admin: {auth?.user?.nama}</span>
                        <Link href="/logout" method="post" as="button" className="text-sm text-red-600 font-semibold hover:text-red-800">
                            Logout
                        </Link>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    {title && <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>}
                    
                    {children}
                </main>
            </div>
        </div>
    );
}
