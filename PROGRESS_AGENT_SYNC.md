# Progress & Sinkronisasi Agent AI (PilihPilih Wundulako)

**Status Aplikasi: LIVE & DEPLOYED**
- **URL Produksi:** https://pilih.wundulako.my.id
- **IP Server (AWS EC2):** 3.104.167.17
- **SSH Key:** d:\KKN\pilihpilih\pilih-wundulako.pem
- **Direktori Root Web (Server):** /var/www/pilihpilih

## 🚀 Deployment Workflow
1. Aplikasi menggunakan GitHub branch `main`.
2. Untuk men-deploy kode lokal (setelah diedit dan di-commit):
   ```bash
   git push origin main
   ssh -i d:\KKN\pilihpilih\pilih-wundulako.pem -o StrictHostKeyChecking=no ubuntu@3.104.167.17
   cd /tmp && sudo rm -rf pilih_repo
   git clone https://github.com/Almunajat-121/pilih-wundulako.git pilih_repo
   cd pilih_repo
   # Copy direktori app, database, resources, routes, phpunit.xml, tsconfig.json ke /var/www/pilihpilih/
   sudo cp -r app database resources routes phpunit.xml tsconfig.json /var/www/pilihpilih/
   cd /var/www/pilihpilih
   sudo php artisan migrate --force
   sudo npm run build
   sudo php artisan optimize:clear
   sudo chown -R www-data:www-data /var/www/pilihpilih
   ```

## 📋 Fitur & Perbaikan Penting Terbaru (Update Oktober 2026)
1. **Keamanan (Security Hardening):** File debug `public/test.php` dan `public/test_tinker.php` telah dihapus secara permanen dari web root & server AWS.
2. **Foto Bukti Kehadiran Warga:** Form bilik suara petugas (`FormVote.tsx`) dilengkapi input kamera langsung (`capture="environment"`) dengan preview & opsi hapus/retake. Backend (`StoreVoteRequest.php`) memvalidasi keberadaan `foto_bukti` dan mengompresnya via Intervention Image.
3. **Dukungan Suara Abstain:**
   - Tabel `votes` kolom `kandidat_id` kini `nullable` via migrasi.
   - Pilihan "Tidak memilih (abstain)" di form vote dapat diproses tanpa error `exists:kandidat`. Suara tercatat di `votes` dengan `kandidat_id = null`, dan status warga berubah menjadi `sudah_memilih` dengan log audit yang jelas.
4. **Validasi Kandidat Lintas Wilayah:** `StoreVoteRequest.php` memvalidasi bahwa kandidat RT yang dipilih berasal dari RT pemilih, dan kandidat RW berasal dari RW pemilih.
5. **Perbaikan Idempotensi:** `VoteService.php` menggunakan pengecekan `whereIn` mencakup suffix `_RT` dan `_RW`, mencegah SQL duplicate key error saat terjadi pengiriman ulang (*network retry*).
6. **Perbaikan Pencarian Nama Warga:** Menghapus escape backslash `\$search` di `Admin/WargaController.php` dan `Petugas/WargaController.php`. Fitur pencarian warga kini berfungsi dengan query `like %$search%`.
7. **Isolasi Database Testing:** `phpunit.xml` diarahkan ke `sqlite` in-memory (`:memory:`) untuk mencegah risiko penghapusan data produksi saat test suite dijalankan.
8. **TypeScript & UI Cleanup:** 
   - `tsconfig.json` disesuaikan untuk TypeScript modern (`@/*` -> `./resources/js/*` dan `"types": ["vite/client"]`). Semua error `tsc --noEmit` bersih (0 errors).
   - Menghapus template usang `welcome.blade.php`.
   - Memperbaiki ukuran ikon SVG tombol kembali (*back-btn*) dan centang (*status-note*) agar proporsional di mobile & desktop.
   - Menambahkan rute dan controller `GET /petugas/warga/{warga}/status` untuk mencegah error 405/layar putih pada menu ubah status.

## ⚡ Hasil Audit & Optimisasi Performa (Oktober 2026)
1. **Index Database:** Menambahkan composite & single index baru pada tabel `warga` (`status_vote_rt`, `status_vote_rw`, `(rt_id, status_vote_rt)`, `(rt_id, status_vote_rw)`) dan tabel `votes` (`(kandidat_id, status)`, `(jenis, status)`).
2. **Eliminasi N+1 Query & Memory Overhead:**
   - `Admin/DashboardController`: Mengganti eager loading seluruh model Warga (`Rw::with('rts.wargas')`) menjadi agregasi SQL langsung via `selectRaw` dan `groupBy('rt.rw_id')`, serta mengganti loop count kandidat menjadi `withCount(['votes' => ...])`.
   - `Petugas/DashboardController`: Mengganti 3*N count queries per RT menjadi 1 query agregasi terkonsolidasi via `whereIn('rt_id', $rtIds)`.
3. **Caching & Serialisasi Primitif:**
   - Menghindari deserialisasi `__PHP_Incomplete_Class` dengan menyimpan nilai primitif (boolean dan array murni) pada cache `tampilkan_live_count` dan `live_count_data`.
   - Invalidation cache otomatis saat transaksi vote masuk (`submitVote`), saat vote dibatalkan (`voidVote`), dan saat status config/wilayah diperbarui.
4. **Kompresi Gzip & Caching Aset Nginx:**
   - Mengaktifkan `gzip_types` untuk file JS, CSS, JSON, SVG di `/etc/nginx/sites-available/pilihpilih`. Ukuran payload bundle utama JS turun dari **339 KB** menjadi **107 KB** (~68% penghematan bandwidth).
   - Menambahkan header `Cache-Control: public, max-age=31536000, immutable` untuk aset build Vite (`/build/assets/*`), sehingga browser pengguna hanya mendownload aset 1 kali (0 ms & 0 KB untuk kunjungan berikutnya).
5. **Tuning PHP-FPM & Swap Memory:**
   - `pm.max_children` dinaikkan dari 5 menjadi 15, `pm.max_requests` diatur ke 1000 (mencegah memory leak). Kapasitas konkurensi request simultan meningkat 3x lipat.
   - Membuat swap space 2 GB dengan `vm.swappiness = 10` untuk mencegah crash OOM-killer saat lonjakan upload foto.
6. **Laravel Production Cache:** `php artisan optimize` (`config:cache`, `route:cache`, `view:cache`, `event:cache`) aktif di server produksi.
7. **Benchmark:** Waktu respons server (TTFB) turun drastis dari **~1.48 detik** menjadi **34 – 66 milidetik** (~25x lebih cepat).

## 📌 Note untuk Sesi Chat AI Selanjutnya
- Jika diminta membuat fitur baru, **pastikan melakukan pencarian grep atau membaca source code terbaru terlebih dahulu**.
- Kolom kandidat menggunakan `visi` dan `misi` secara terpisah (bukan `visi_misi`).
- Error Inertia ditangkap dan ditampilkan oleh `Toast.tsx`.
- Saat menguji frontend, gunakan skrip Playwright untuk memverifikasi desktop & mobile.
