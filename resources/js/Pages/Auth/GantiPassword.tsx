import React from 'react';
import { useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';

export default function GantiPassword() {
    const { data, setData, put, processing, errors } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/ganti-password');
    };

    return (
        <AuthLayout>
            <div className="login-card">
                <div className="login-head">
                    <div className="login-mark">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l4.5 4.5L20 6"/></svg>
                    </div>
                    <p className="login-brand">PilihPilih</p>
                    <p className="login-tag">Ganti Kata Sandi<br />Silakan perbarui kata sandi Anda.</p>
                </div>
                
                <div className="login-body">
                    <form onSubmit={submit}>
                        <div className="login-field">
                            <label>Kata Sandi Lama</label>
                            <input
                                type="password"
                                placeholder="Masukkan sandi lama"
                                value={data.current_password}
                                onChange={e => setData('current_password', e.target.value)}
                                required
                            />
                            {errors.current_password && <p className="mt-1 text-xs text-red-600">{errors.current_password}</p>}
                        </div>
                        
                        <div className="login-field">
                            <label>Kata Sandi Baru</label>
                            <input
                                type="password"
                                placeholder="Masukkan sandi baru"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                required
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                        </div>
                        
                        <div className="login-field">
                            <label>Konfirmasi Kata Sandi Baru</label>
                            <input
                                type="password"
                                placeholder="Ketik ulang sandi baru"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                required
                            />
                            {errors.password_confirmation && <p className="mt-1 text-xs text-red-600">{errors.password_confirmation}</p>}
                        </div>
                        
                        <button type="submit" className="login-submit" disabled={processing} style={{ marginTop: '24px' }}>
                            {processing ? 'Menyimpan...' : 'Simpan Sandi Baru'}
                        </button>
                    </form>
                    
                    <div className="login-foot">
                        <a href="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}>&larr; Kembali</a>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
