# Sistem Catatan Gangguan TI (IT Helpdesk)

Aplikasi web manajemen dan pencatatan gangguan Teknologi Informasi (IT Helpdesk) berbasis **INA Digital Design System (IDDS)** untuk memantau laporan insiden perangkat keras, aplikasi layanan, serta infrastruktur jaringan lintas unit kerja.

> [!NOTE]
> Untuk panduan lengkap materi presentasi kepada pimpinan/stakeholder dan arsitektur teknis bagi tim pengembang, silakan pelajari dokumen resmi: **[`PANDUAN_PRESENTASI_DAN_ARSITEKTUR.md`](./PANDUAN_PRESENTASI_DAN_ARSITEKTUR.md)**.

---

## Tumpukan Teknologi (Tech Stack)

- **Frontend:** React.js (Vite), Tailwind CSS, INA Digital Design System (`@idds/react`, `@idds/styles`, `@tabler/icons-react`)
- **Backend:** Node.js, Express.js, JSON Web Token (`jsonwebtoken`), `bcryptjs`, `pg`
- **Database:** PostgreSQL 16
- **Infrastruktur:** Docker & Docker Compose (dengan *persistent volume* database)

---

## Fitur Utama

1. **Autentikasi & Manajemen Sesi Aman:**
   - Autentikasi berbasis JWT dengan masa berlaku terukur dan pencabutan sesi (*token revocation*) saat *logout*.
   - Pembagian hak akses (*Role-Based Access Control*): Administrator TI (lintas unit) dan Operator Unit Kerja.
2. **CRUD Catatan Gangguan TI (`04-gangguan-ti`):**
   - **Daftar & Pencarian:** Pencarian cepat berdasarkan kode tiket, nama gangguan, unit kerja, maupun catatan, dilengkapi filter **Kategori** (`Perangkat`, `Aplikasi`, `Koneksi`) dan **Status** (`Baru`, `Diproses`, `Selesai`).
   - **Detail Tiket:** Modal rincian informasi lengkap satu tiket gangguan TI.
   - **Tambah & Ubah Tiket:** Formulir pencatatan dan pembaruan tiket dengan validasi berlapis di sisi klien dan server.
   - **Hapus Tiket:** Dialog konfirmasi wajib sebelum penghapusan data secara permanen.
3. **Antarmuka Responsif (Mobile, Tablet, & Desktop):**
   - **Mobile & Tablet:** Dilengkapi navigasi **Bottom Bar 3 Menu** (**Dashboard**, **Daftar**, dan **Setting Pengguna**) serta tampilan berbasis *Card* (1 kolom di Mobile, 2 kolom di Tablet) agar nyaman diakses.
   - **Desktop:** Tata letak *full-width* proporsional dengan kartu metrik 5 kolom dan tabel data lengkap.
4. **Standar Keamanan Aplikasi:**
   - **Anti-SQL Injection:** Seluruh query database menggunakan *parameterized queries* (`$1, $2, ...`).
   - **Anti-XSS:** Sanitasi karakter HTML berbahaya dan penerapan *Content Security Policy (CSP)* serta *security headers*.
   - **Anti-IDOR:** Verifikasi kepemilikan unit kerja pada setiap operasi pembacaan maupun perubahan tiket.
   - **Anti-Mass Assignment:** Pembatasan ketat (*whitelisting*) properti payload yang diizinkan masuk ke database.
   - **Anti-Information Disclosure:** Penanganan error terpusat tanpa mengekspos detail internal server/database ke pengguna.

---

## Struktur Direktori

```text
.
├── docker-compose.yml              # Orkestrasi kontainer Database, Backend, dan Frontend
├── database/
│   └── init.sql                    # Skema tabel PostgreSQL & seeding 20 data contoh
├── dataset/
│   ├── csv_to_Look/
│   │   └── 04-gangguan-ti.xlsx     # Kamus data referensi
│   └── json/
│       └── 04-gangguan-ti.json     # Dataset referensi 04-gangguan-ti
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js                   # Entrypoint Express API Server
│   └── src/
│       ├── config/db.js            # Koneksi Pool PostgreSQL
│       ├── middleware/
│       │   ├── auth.js             # Verifikasi JWT & cek pencabutan sesi
│       │   ├── security.js         # Header keamanan, Rate Limiter, & Error Handler
│       │   └── validator.js        # Validasi skema payload & sanitasi input
│       └── routes/
│           ├── authRoutes.js       # Endpoint autentikasi (/api/auth)
│           └── ticketRoutes.js     # Endpoint CRUD tiket (/api/tickets)
└── frontend/
    ├── Dockerfile
    ├── nginx.conf                  # Konfigurasi Nginx SPA & Reverse Proxy API
    ├── package.json
    └── src/
        ├── main.jsx                # Inisialisasi tema IDDS (inagov) & ToastProvider
        ├── App.jsx                 # Integrasi layout utama & navigasi 3 menu
        ├── services/api.js         # Klien HTTP Axios & helper format data
        └── components/
            ├── Navbar.jsx
            ├── MobileBottomNav.jsx
            ├── StatsCards.jsx
            ├── DashboardOverview.jsx
            ├── TicketTable.jsx
            ├── TicketFormModal.jsx
            ├── TicketDetailModal.jsx
            ├── DeleteConfirmModal.jsx
            ├── UserSettingsView.jsx
            └── LoginView.jsx
```

---

## Cara Menjalankan Aplikasi

### 1. Menggunakan Docker Compose (Direkomendasikan)

Pastikan layanan Docker aktif, kemudian jalankan perintah berikut dari direktori utama proyek:

```bash
docker compose up -d --build
```

Akses layanan melalui peramban:
- **Aplikasi Web (Frontend):** `http://localhost:5173`
- **Health Check API (Backend):** `http://localhost:5000/api/health`

Untuk menghentikan layanan tanpa menghapus data yang tersimpan di volume database:

```bash
docker compose down
```

### 2. Menjalankan Secara Manual (Mode Pengembangan)

1. Pastikan layanan PostgreSQL aktif dan jalankan skrip inisialisasi skema pada `database/init.sql`.
2. Konfigurasikan variabel lingkungan pada `backend/.env` sesuai pengaturan koneksi lokal Anda.
3. Jalankan server backend:
   ```bash
   cd backend
   npm run dev
   ```
4. Jalankan server pengembangan frontend:
   ```bash
   cd frontend
   npm run dev
   ```

---

&copy; 2026 Diskominfo Kota Probolinggo

# probolinggo
