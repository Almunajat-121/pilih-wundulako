import React from 'react';

interface LoadingButtonProps {
    processing: boolean;
    children: React.ReactNode;
    className?: string;
    type?: 'submit' | 'button';
    variant?: 'primary' | 'danger' | 'secondary';
    disabled?: boolean;
    onClick?: () => void;
}

export default function LoadingButton({
    processing,
    children,
    className = '',
    type = 'submit',
    variant = 'primary',
    disabled = false,
    onClick,
}: LoadingButtonProps) {
    
    let variantClasses = '';
    switch (variant) {
        case 'primary':
            variantClasses = 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-transparent';
            break;
        case 'danger':
            variantClasses = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent';
            break;
        case 'secondary':
            variantClasses = 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 border-gray-300 border';
            break;
    }

    const disabledClasses = disabled || processing ? 'opacity-75 cursor-not-allowed' : '';

    return (
        <button
            type={type}
            disabled={disabled || processing}
            onClick={onClick}
            className={`inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${variantClasses} ${disabledClasses} ${className}`}
        >
            {processing ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                </>
            ) : (
                children
            )}
        </button>
    );
}
