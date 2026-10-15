import React, { useEffect } from 'react';
import LoadingButton from './LoadingButton';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    processing?: boolean;
}

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'primary',
    processing = false,
}: ConfirmDialogProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose]);

    if (!open) return null;

    const isDanger = variant === 'danger';

    return (
        <div className="modal-overlay" onClick={() => !processing && onClose()}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <div className="modal-badge" style={isDanger ? { color: 'var(--maroon)', background: 'var(--maroon-soft)' } : undefined}>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {isDanger ? (
                            <>
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </>
                        ) : (
                            <>
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </>
                        )}
                    </svg>
                    {isDanger ? 'Peringatan Konfirmasi' : 'Konfirmasi Tindakan'}
                </div>

                <h3 className="modal-title">{title}</h3>
                <p className="modal-desc">{message}</p>

                {isDanger && (
                    <div className="callout-warning">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <span>Tindakan ini tidak dapat dibatalkan. Harap teliti sebelum melanjutkan.</span>
                    </div>
                )}

                <div className="modal-actions">
                    <button
                        type="button"
                        disabled={processing}
                        onClick={onClose}
                        className="btn btn-outline"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        disabled={processing}
                        onClick={onConfirm}
                        className="btn"
                        style={isDanger ? { background: 'var(--maroon)', borderColor: 'var(--maroon)', color: '#fff' } : { background: 'var(--ink)', borderColor: 'var(--ink)', color: '#fff' }}
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75"></path>
                                </svg>
                                Memproses...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
