import React from 'react';
import { Head } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="login-wrap">
            <Head title="Login" />
            {children}
        </div>
    );
}
