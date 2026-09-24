import React from 'react';
import { Head } from '@inertiajs/react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Head title="Hasil Pemilihan" />
            <header className="bg-blue-700 text-white py-6 px-4 shadow-md text-center">
                <h1 className="text-2xl font-bold">PilihPilih</h1>
                <p className="mt-1 text-blue-100">Hasil Pemilihan RT/RW Kelurahan Wundulako</p>
            </header>

            <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6">
                {children}
            </main>

            <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} KKN - Kelurahan Wundulako</p>
            </footer>
        </div>
    );
}
