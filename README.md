# PilihPilih Wundulako 🇮🇩

Aplikasi **E-Voting Door-to-Door** berbasis web untuk memfasilitasi pemilihan Ketua RT dan RW secara langsung di lapangan. Aplikasi ini dirancang khusus untuk Kelurahan Wundulako, memungkinkan petugas membawa *smartphone* mereka dari rumah ke rumah untuk mendaftarkan dan memverifikasi pilihan warga.

## 🚀 Fitur Utama
*   **Aplikasi Petugas (Mobile-First)**: UI/UX dioptimalkan untuk layar HP. Petugas dapat mendata warga dan menginputkan hasil *vote* langsung di lokasi.
*   **Sistem Transaksi Suara Aman**: Menggunakan mekanisme *Database Transaction Row Locking* dan *Idempotency Key* untuk mencegah *double-voting* saat koneksi internet putus-nyambung.
*   **PWA Ready**: Dapat diinstal (*Add to Home Screen*) di Android layaknya aplikasi *native* dengan dukungan toleransi jaringan dasar (*Service Worker*).
*   **Dashboard Admin**: Panel lengkap untuk manajemen data wilayah (RT/RW), kandidat, petugas, serta log audit aktivitas.
*   **Ekspor Data**: Mendukung ekspor hasil rekapitulasi ke format Excel (Multi-sheet) dan PDF.
*   **Live Count**: Halaman publik untuk memantau perolehan suara *real-time*.

## 🛠️ Tech Stack
*   **Backend:** Laravel 11, PHP 8.2+
*   **Frontend Bridge:** Inertia.js
*   **Frontend UI:** React 18, Tailwind CSS, shadcn/ui components
*   **Database:** MySQL 8+

---

## 💻 Cara Menjalankan di Komputer Lokal (Local Development)

Ikuti langkah-langkah di bawah ini untuk melakukan *clone* dan menjalankan aplikasi ini di laptop Anda sendiri.

### 1. Prasyarat (*Prerequisites*)
Pastikan aplikasi berikut sudah terinstal di komputer Anda:
*   [PHP](https://www.php.net/downloads.php) (minimal versi 8.2)
*   [Composer](https://getcomposer.org/)
*   [Node.js](https://nodejs.org/) (minimal versi 18) & NPM
*   [MySQL](https://www.mysql.com/) atau MariaDB (via XAMPP, Laragon, dll)
*   [Git](https://git-scm.com/)

### 2. Instalasi
1. **Clone repository ini:**
   ```bash
   git clone https://github.com/Almunajat-121/pilih-wundulako.git
   cd pilih-wundulako
   ```

2. **Install dependensi PHP & Node.js:**
   ```bash
   composer install
   npm install
   ```

3. **Konfigurasi Environment:**
   Duplikat file `.env.example` menjadi `.env`:
   ```bash
   # Di Windows Command Prompt
   copy .env.example .env
   
   # Di Linux / Mac / Git Bash
   cp .env.example .env
   ```
   Lalu, *generate* application key:
   ```bash
   php artisan key:generate
   ```

4. **Konfigurasi Database:**
   * Buat database kosong baru di MySQL Anda, misalnya bernama `db_pilihpilih`.
   * Buka file `.env` di teks editor, dan sesuaikan bagian ini dengan pengaturan MySQL Anda:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=db_pilihpilih
     DB_USERNAME=root
     DB_PASSWORD=
     ```

5. **Migrasi Database & Seed Data Sample:**
   Jalankan perintah ini untuk membuat semua tabel dan memasukkan data sampel awal (Admin, Petugas, Kandidat, dan Warga):
   ```bash
   php artisan migrate:fresh --seed --seeder=SampleDataSeeder
   ```
   *(Penting: perintah ini akan menghapus semua data jika database sebelumnya tidak kosong).*

### 3. Menjalankan Aplikasi
Anda memerlukan dua terminal (*command prompt*) yang berjalan bersamaan.

**Terminal 1 (Menjalankan Frontend Vite):**
```bash
npm run dev
```

**Terminal 2 (Menjalankan Backend Laravel):**
```bash
php artisan serve
```

Aplikasi sekarang dapat diakses di browser melalui: **http://localhost:8000**

### 🔑 Akun Default (Login)
Setelah menjalankan *seeder*, Anda dapat masuk ke aplikasi menggunakan akun administrator default:
*   **Username:** `admin`
*   **Password:** `admin123`

---

## 📚 Panduan Desain (Bagi Developer)
Bagi pengembang yang ingin mengubah UI atau menambah fitur, silakan baca:
*   [AI_RULES.md](./AI_RULES.md) untuk aturan *coding*, penamaan, dan struktur folder.
*   [DESIGN.md](./DESIGN.md) untuk mempelajari struktur komponen UI dan *design system* yang digunakan.
