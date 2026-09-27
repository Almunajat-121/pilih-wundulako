import React from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import PetugasLayout from '../../Layouts/PetugasLayout';
import { PageProps } from '../../types';

export default function Profil() {
    const { auth } = usePage<PageProps>().props;

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <PetugasLayout title="Profil Saya">
            <div className="card" style={{ padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--brass)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>
                    {auth.user.nama.charAt(0)}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, fontFamily: "'Fraunces', serif", margin: '0 0 4px' }}>{auth.user.nama}</h2>
                <p style={{ margin: '0 0 16px', color: 'var(--text-soft)', fontSize: '14px' }}>@{auth.user.username}</p>
                <span className="badge badge-moss">Petugas Lapangan</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/ganti-password" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--line)', color: 'var(--text)', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <span style={{ fontWeight: 500 }}>Ganti Kata Sandi</span>
                    </div>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>

                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--line)', color: 'var(--maroon)', textDecoration: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        <span style={{ fontWeight: 500 }}>Keluar Aplikasi</span>
                    </div>
                </button>
            </div>
        </PetugasLayout>
    );
}
