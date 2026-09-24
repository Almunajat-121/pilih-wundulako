// TypeScript interfaces untuk semua model database
// Sesuai PRD v1.2 Bagian 5 — Data Model

export interface Rw {
    id: number;
    nama: string;
    created_at: string;
    updated_at: string;
    // Relations
    rt?: Rt[];
    kandidat?: Kandidat[];
}

export interface Rt {
    id: number;
    rw_id: number;
    nama: string;
    voting_aktif: boolean;
    created_at: string;
    updated_at: string;
    // Relations
    rw?: Rw;
    warga?: Warga[];
    kandidat?: Kandidat[];
    users?: User[];
    // Computed
    total_warga?: number;
    sudah_memilih_rt?: number;
    sudah_memilih_rw?: number;
    belum_dikunjungi?: number;
    tidak_ditemukan?: number;
    menolak?: number;
    progres_rt?: number; // percentage
    progres_rw?: number; // percentage
}

export type StatusVote = 'belum_dikunjungi' | 'sudah_memilih' | 'tidak_ditemukan' | 'menolak';
export type JenisVote = 'RT' | 'RW';
export type UserRole = 'admin' | 'petugas';
export type VoteStatus = 'valid' | 'void';

export interface User {
    id: number;
    nama: string;
    username: string;
    role: UserRole;
    is_active: boolean;
    failed_login_attempts: number;
    locked_until: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    wilayah?: Rt[];
}

export interface Warga {
    id: number;
    nama: string;
    alamat: string;
    rt_id: number;
    tanggal_lahir: string | null;
    status_vote_rt: StatusVote;
    status_vote_rw: StatusVote;
    jumlah_kunjungan: number;
    foto_ktp_path: string | null;
    dibuat_oleh: number | null;
    created_at: string;
    updated_at: string;
    // Relations
    rt?: Rt;
    pembuat?: User;
    votes?: Vote[];
    status_logs?: StatusLog[];
}

export interface Kandidat {
    id: number;
    nama: string;
    nomor_urut: number;
    jenis: JenisVote;
    rt_id: number | null;
    rw_id: number | null;
    foto_url: string | null;
    visi_misi: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    rt?: Rt;
    rw?: Rw;
    votes?: Vote[];
    // Computed
    jumlah_suara?: number;
    persentase?: number;
}

export interface Vote {
    id: number;
    warga_id: number;
    kandidat_id: number;
    jenis: JenisVote;
    petugas_id: number;
    status: VoteStatus;
    alasan_void: string | null;
    idempotency_key: string;
    created_at: string;
    updated_at: string;
    // Relations
    warga?: Warga;
    kandidat?: Kandidat;
    petugas?: User;
}

export interface StatusLog {
    id: number;
    warga_id: number;
    jenis: JenisVote;
    status_lama: string;
    status_baru: string;
    aktor_id: number;
    alasan: string | null;
    created_at: string;
    // Relations
    warga?: Warga;
    aktor?: User;
}

export interface VotingConfig {
    id: number;
    voting_aktif_global: boolean;
    tampilkan_live_count: boolean;
    updated_by: number | null;
    updated_at: string;
}

// Inertia shared props
export interface PageProps {
    auth: {
        user: User;
    };
    flash: {
        success?: string;
        error?: string;
        warning?: string;
    };
    errors: Record<string, string>;
}

// Pagination type dari Laravel
export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

// Live count data
export interface LiveCountKandidat {
    id: number;
    nama: string;
    nomor_urut: number;
    jenis: JenisVote;
    wilayah_nama: string;
    jumlah_suara: number;
    persentase: number;
}

export interface LiveCountData {
    kandidat: LiveCountKandidat[];
    total_warga: number;
    total_sudah_memilih_rt: number;
    total_sudah_memilih_rw: number;
    terakhir_diperbarui: string;
}
