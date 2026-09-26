import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';

export default function Login() {
    const { flash } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <AuthLayout>
            <div className="login-card">
                <div className="login-head">
                    <div className="login-mark">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l4.5 4.5L20 6"/></svg>
                    </div>
                    <p className="login-brand">PilihPilih</p>
                    <p className="login-tag">Sistem Pemilihan RT/RW Digital<br />Kelurahan Wundulako</p>
                </div>
                
                <div className="login-body">
                    {flash?.error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6 text-sm text-center">
                            {flash.error}
                        </div>
                    )}
                    
                    <form onSubmit={submit}>
                        <div className="login-field">
                            <label>Username</label>
                            <input
                                type="text"
                                placeholder="Masukkan username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                            />
                            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
                        </div>
                        
                        <div className="login-field">
                            <label>Kata sandi</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                        </div>
                        
                        <label className="login-remember">
                            <input type="checkbox" />
                            Ingat saya
                        </label>
                        
                        <button type="submit" className="login-submit" disabled={processing}>
                            {processing ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>
                    
                    <div className="login-foot">
                        <a href="/publik">Lihat live count publik &rarr;</a>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
