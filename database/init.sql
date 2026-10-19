-- ============================================================================
-- SKRIP INISIALISASI DATABASE: SISTEM CATATAN GANGGUAN TI (IT HELPDESK)
-- Dataset Referensi: 04-gangguan-ti ("Catatan gangguan TI")
-- ============================================================================

SET client_encoding = 'UTF8';

-- 1. Tabel Pengguna (Autentikasi & Otorisasi RBAC / Anti-IDOR)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(100) NOT NULL,
    unit VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Daftar Hitam Token Sesi (Pencegahan Broken Session Management saat Logout)
CREATE TABLE IF NOT EXISTS revoked_tokens (
    jti VARCHAR(100) PRIMARY KEY,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Utama Catatan Gangguan TI (Sesuai Kamus Data 04-gangguan-ti)
-- Kolom wajib: id, kode, nama, kategori, unit, tanggal, nilai, status, catatan
CREATE TABLE IF NOT EXISTS gangguan_ti (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(50) NOT NULL UNIQUE,
    nama VARCHAR(255) NOT NULL,
    kategori VARCHAR(50) NOT NULL CHECK (kategori IN ('Perangkat', 'Aplikasi', 'Koneksi')),
    unit VARCHAR(150) NOT NULL,
    tanggal DATE NOT NULL,
    nilai BIGINT NOT NULL DEFAULT 0 CHECK (nilai >= 0),
    status VARCHAR(50) NOT NULL CHECK (status IN ('Baru', 'Diproses', 'Selesai')),
    catatan TEXT NOT NULL DEFAULT '',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks pencarian & filter untuk performa optimal
CREATE INDEX IF NOT EXISTS idx_gangguan_ti_kategori ON gangguan_ti(kategori);
CREATE INDEX IF NOT EXISTS idx_gangguan_ti_status ON gangguan_ti(status);
CREATE INDEX IF NOT EXISTS idx_gangguan_ti_tanggal ON gangguan_ti(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_gangguan_ti_unit ON gangguan_ti(unit);

-- ============================================================================
-- SEEDING DATA PENGGUNA (Password disimpan dalam bentuk bcrypt hash)
-- ============================================================================
INSERT INTO users (id, username, password_hash, nama_lengkap, unit, role) VALUES
    (1, 'admin', '$2a$10$V/V1dYhbRUluBYilKTwGguz8b.mvu0ZHjKX3.vGh05LNdp/erkK7G', 'Administrator Utama TI', 'Pusat Data & TI', 'admin'),
    (2, 'sekretariat', '$2a$10$29jBW4k2GHJZRlnY6X0bdeU7To/4tiQKZ6PhA7OCTg4mkjXQYtfJW', 'Petugas TI Sekretariat', 'Sekretariat', 'operator'),
    (3, 'dinas_a', '$2a$10$29jBW4k2GHJZRlnY6X0bdeU7To/4tiQKZ6PhA7OCTg4mkjXQYtfJW', 'Petugas TI Dinas A', 'Dinas A', 'operator'),
    (4, 'dinas_b', '$2a$10$29jBW4k2GHJZRlnY6X0bdeU7To/4tiQKZ6PhA7OCTg4mkjXQYtfJW', 'Petugas TI Dinas B', 'Dinas B', 'operator'),
    (5, 'unit_teknis', '$2a$10$29jBW4k2GHJZRlnY6X0bdeU7To/4tiQKZ6PhA7OCTg4mkjXQYtfJW', 'Petugas TI Unit Teknis', 'Unit Teknis', 'operator')
ON CONFLICT (username) DO NOTHING;

SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));

-- ============================================================================
-- SEEDING 20 DATA CONTOH TIKET GANGGUAN TI (Sesuai dataset/json/04-gangguan-ti.json)
-- ============================================================================
INSERT INTO gangguan_ti (id, kode, nama, kategori, unit, tanggal, nilai, status, catatan, created_by) VALUES
    (1,  'IT4-001', 'Printer gagal mencetak',        'Perangkat', 'Sekretariat', '2026-10-01', 250000,  'Baru',     'Data sintetis untuk latihan nomor 1.',  2),
    (2,  'IT4-002', 'Portal gagal dibuka',           'Aplikasi',  'Dinas A',     '2026-10-02', 500000,  'Diproses', 'Data sintetis untuk latihan nomor 2.',  3),
    (3,  'IT4-003', 'WiFi aula terputus',            'Koneksi',   'Dinas B',     '2026-10-03', 750000,  'Selesai',  'Data sintetis untuk latihan nomor 3.',  4),
    (4,  'IT4-004', 'Laptop tidak menyala',          'Perangkat', 'Unit Teknis', '2026-10-04', 1000000, 'Baru',     '',                                      5),
    (5,  'IT4-005', 'Aplikasi antrean lambat',       'Aplikasi',  'Sekretariat', '2026-10-05', 1250000, 'Diproses', 'Data sintetis untuk latihan nomor 5.',  2),
    (6,  'IT4-006', 'Koneksi loket putus',           'Koneksi',   'Dinas A',     '2026-10-06', 0,       'Selesai',  'Data sintetis untuk latihan nomor 6.',  3),
    (7,  'IT4-007', 'Scanner tidak terdeteksi',      'Perangkat', 'Dinas B',     '2026-10-07', 250000,  'Baru',     'Data sintetis untuk latihan nomor 7.',  4),
    (8,  'IT4-008', 'Portal arsip error',            'Aplikasi',  'Unit Teknis', '2026-10-08', 500000,  'Diproses', '',                                      5),
    (9,  'IT4-009', 'Jaringan lantai dua lambat',    'Koneksi',   'Sekretariat', '2026-10-09', 750000,  'Selesai',  'Data sintetis untuk latihan nomor 9.',  2),
    (10, 'IT4-010', 'Monitor berkedip',              'Perangkat', 'Dinas A',     '2026-10-10', 1000000, 'Baru',     'Data sintetis untuk latihan nomor 10.', 3),
    (11, 'IT4-011', 'Aplikasi surat macet',          'Aplikasi',  'Dinas B',     '2026-10-11', 1250000, 'Diproses', 'Data sintetis untuk latihan nomor 11.', 4),
    (12, 'IT4-012', 'Internet unit teknis putus',    'Koneksi',   'Unit Teknis', '2026-10-12', 0,       'Selesai',  '',                                      5),
    (13, 'IT4-013', 'UPS berbunyi',                  'Perangkat', 'Sekretariat', '2026-10-13', 250000,  'Baru',     'Data sintetis untuk latihan nomor 13.', 2),
    (14, 'IT4-014', 'Dashboard tidak memuat data',   'Aplikasi',  'Dinas A',     '2026-10-14', 500000,  'Diproses', 'Data sintetis untuk latihan nomor 14.', 3),
    (15, 'IT4-015', 'WiFi rapat tidak stabil',       'Koneksi',   'Dinas B',     '2026-10-15', 750000,  'Selesai',  'Data sintetis untuk latihan nomor 15.', 4),
    (16, 'IT4-016', 'Keyboard rusak',                'Perangkat', 'Unit Teknis', '2026-10-01', 1000000, 'Baru',     '',                                      5),
    (17, 'IT4-017', 'Aplikasi presensi error',       'Aplikasi',  'Sekretariat', '2026-10-02', 1250000, 'Diproses', 'Data sintetis untuk latihan nomor 17.', 2),
    (18, 'IT4-018', 'Koneksi ruang operator putus',  'Koneksi',   'Dinas A',     '2026-10-03', 0,       'Selesai',  'Data sintetis untuk latihan nomor 18.', 3),
    (19, 'IT4-019', 'Printer menarik kertas ganda',  'Perangkat', 'Dinas B',     '2026-10-04', 250000,  'Baru',     'Data sintetis untuk latihan nomor 19.', 4),
    (20, 'IT4-020', 'Portal aset gagal simpan',      'Aplikasi',  'Unit Teknis', '2026-10-05', 500000,  'Diproses', '',                                      5)
ON CONFLICT (kode) DO NOTHING;

-- Sinkronisasi sequence ID setelah seeding eksplisit
SELECT setval(pg_get_serial_sequence('gangguan_ti', 'id'), COALESCE((SELECT MAX(id) FROM gangguan_ti), 1));

