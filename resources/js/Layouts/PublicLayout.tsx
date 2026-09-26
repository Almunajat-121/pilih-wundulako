import React from 'react';
import { Head } from '@inertiajs/react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="public min-h-screen">
            <div className="public-wrap">
                {children}
            </div>
        </div>
    );
}
