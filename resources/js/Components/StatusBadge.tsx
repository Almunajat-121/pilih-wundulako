import React from 'react';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    let bg = '';
    let text = '';
    let label = status.replace(/_/g, ' ');
    
    // Capitalize first letter of each word
    label = label.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    switch (status.toLowerCase()) {
        case 'belum_dikunjungi':
            bg = 'bg-blue-100';
            text = 'text-blue-800';
            break;
        case 'sudah_memilih':
        case 'valid':
        case 'aktif':
            bg = 'bg-green-100';
            text = 'text-green-800';
            break;
        case 'tidak_ditemukan':
            bg = 'bg-yellow-100';
            text = 'text-yellow-800';
            break;
        case 'menolak':
            bg = 'bg-gray-100';
            text = 'text-gray-800';
            break;
        case 'void':
        case 'ditutup':
            bg = 'bg-red-100';
            text = 'text-red-800';
            break;
        default:
            bg = 'bg-gray-100';
            text = 'text-gray-800';
            break;
    }

    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return (
        <span className={`inline-flex items-center font-medium rounded-full ${bg} ${text} ${sizeClasses}`}>
            {label}
        </span>
    );
}
