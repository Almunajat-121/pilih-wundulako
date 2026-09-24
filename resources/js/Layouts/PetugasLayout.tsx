import React, { useEffect, useState } from 'react';
import { Link, usePage, Head, router } from '@inertiajs/react';
import Toast from '../Components/Toast';

interface PetugasLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function PetugasLayout({ children, title }: PetugasLayoutProps) {
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
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans max-w-lg mx-auto shadow-md relative">
            {title && <Head title={title} />}
            <Toast />
            
            {loading && (
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 z-50">
                    <div className="h-full bg-blue-600 animate-pulse w-full"></div>
                </div>
            )}
            
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="font-bold text-blue-700">PilihPilih</div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">{auth?.user?.nama}</span>
                    <Link href="/logout" method="post" as="button" className="text-sm text-red-600 font-semibold hover:text-red-800">
                        Logout
                    </Link>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto pb-20 p-4">
                {title && <h1 className="text-xl font-bold text-gray-800 mb-4">{title}</h1>}
                {children}
            </main>

            {/* Bottom Nav */}
            <nav className="bg-white border-t fixed bottom-0 w-full max-w-lg flex shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10">
                <Link 
                    href="/petugas/dashboard" 
                    className={`flex-1 py-3 flex flex-col items-center justify-center transition-colors ${url.startsWith('/petugas/dashboard') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                >
                    <span className="text-xl mb-1">🏠</span>
                    <span className="text-xs font-medium">Dashboard</span>
                </Link>
                <Link 
                    href="/ganti-password" 
                    className={`flex-1 py-3 flex flex-col items-center justify-center transition-colors ${url.startsWith('/ganti-password') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                >
                    <span className="text-xl mb-1">👤</span>
                    <span className="text-xs font-medium">Profil</span>
                </Link>
            </nav>
        </div>
    );
}
