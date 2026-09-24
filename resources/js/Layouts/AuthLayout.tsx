import React from 'react';
import { Head } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 p-4">
            <Head title="Login" />
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">PilihPilih Wundulako</h1>
                    <p className="mt-2 text-sm text-gray-600">Aplikasi Pemilihan Ketua RT/RW</p>
                </div>
                {children}
            </div>
        </div>
    );
}
