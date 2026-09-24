import React from 'react';
import { useForm, Head } from '@inertiajs/react';

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Head title="Ganti Password" />
            <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6 bg-blue-700 text-white text-center">
                    <h2 className="text-2xl font-bold">PilihPilih</h2>
                    <p className="mt-1 text-blue-100 text-sm">Ganti Password</p>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
                        <input type="password" value={data.current_password} onChange={e => setData('current_password', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" required />
                        {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                        <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" required />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                        <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" required />
                        {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                    </div>
                    <div className="pt-4">
                        <button type="submit" disabled={processing} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
                            Simpan Password Baru
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
