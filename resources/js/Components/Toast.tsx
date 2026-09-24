import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

interface ToastMessage {
    id: number;
    type: 'success' | 'error' | 'warning';
    message: string;
}

export default function Toast() {
    const { flash } = usePage<any>().props;
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        if (flash?.success) {
            addToast('success', flash.success);
        }
        if (flash?.error) {
            addToast('error', flash.error);
        }
        if (flash?.warning) {
            addToast('warning', flash.warning);
        }
    }, [flash]);

    const addToast = (type: 'success' | 'error' | 'warning', message: string) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 left-4 sm:left-auto flex flex-col gap-2 z-50">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`relative overflow-hidden flex items-center p-4 rounded-lg shadow-lg border text-sm sm:text-base w-full sm:w-80 sm:min-w-80 transition-all duration-300 animate-slide-in
                        ${toast.type === 'success' ? 'bg-white border-green-500 text-slate-800' : ''}
                        ${toast.type === 'error' ? 'bg-white border-red-500 text-slate-800' : ''}
                        ${toast.type === 'warning' ? 'bg-white border-yellow-500 text-slate-800' : ''}
                    `}
                >
                    <div className="flex items-center gap-3 w-full">
                        <span className={`text-xl ${toast.type === 'success' ? 'text-green-500' : toast.type === 'error' ? 'text-red-500' : 'text-yellow-500'}`}>
                            {toast.type === 'success' && '✓'}
                            {toast.type === 'error' && '✗'}
                            {toast.type === 'warning' && '⚠'}
                        </span>
                        <p className="flex-1 font-medium">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-black/10 w-full animate-shrink-width" />
                </div>
            ))}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slide-in {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes shrink-width {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out forwards;
                }
                @media (max-width: 639px) {
                    @keyframes slide-in-mobile {
                        from { transform: translateY(-100%); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .animate-slide-in {
                        animation: slide-in-mobile 0.3s ease-out forwards;
                    }
                }
                .animate-shrink-width {
                    animation: shrink-width 4s linear forwards;
                }
            `}} />
        </div>
    );
}
