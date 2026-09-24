import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatTanggal(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function formatWaktu(dateString: string): string {
    return new Date(dateString).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatStatus(status: string): string {
    const map: Record<string, string> = {
        belum_dikunjungi: 'Belum Dikunjungi',
        sudah_memilih: 'Sudah Memilih',
        tidak_ditemukan: 'Tidak Ditemukan',
        menolak: 'Menolak Memilih',
        valid: 'Valid',
        void: 'Void',
    };
    return map[status] || status;
}

export function statusColor(status: string): string {
    const map: Record<string, string> = {
        belum_dikunjungi: 'bg-blue-100 text-blue-700',
        sudah_memilih: 'bg-green-100 text-green-700',
        tidak_ditemukan: 'bg-yellow-100 text-yellow-700',
        menolak: 'bg-gray-100 text-gray-600',
        valid: 'bg-green-100 text-green-700',
        void: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
}

export function generateIdempotencyKey(): string {
    return crypto.randomUUID();
}

export function hitungPersentase(jumlah: number, total: number): string {
    if (total === 0) return '0';
    return ((jumlah / total) * 100).toFixed(1);
}
