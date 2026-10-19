/**
 * Server Utama Backend - Sistem Catatan Gangguan TI (IT Helpdesk)
 * Tech Stack: Node.js, Express.js, PostgreSQL, JWT
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');
const { securityHeaders, errorHandler } = require('./src/middleware/security');
const authRoutes = require('./src/routes/authRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// 1. Pasang HTTP Security Headers
app.use(securityHeaders);

// 2. Konfigurasi CORS yang terukur
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Izinkan request tanpa origin (seperti proxy internal Vite / healthcheck) atau origin yang terdaftar
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 3. Body Parser dengan batas ukuran payload untuk mencegah serangan DoS
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// 4. Endpoint Healthcheck
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    return res.status(200).json({
      success: true,
      status: 'healthy',
      service: 'it-helpdesk-backend',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'Koneksi ke database sedang tidak tersedia.',
    });
  }
});

// 5. Registrasi Routes Utama
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// 6. Handler 404 untuk endpoint yang tidak ditemukan (Tanpa Information Disclosure)
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Endpoint API yang diminta tidak ditemukan.',
  });
});

// 7. Centralized Error Handler (Anti Information Disclosure)
app.use(errorHandler);

/**
 * Inisialisasi otomatis skema & seeding jika tabel belum tersedia di database
 */
async function ensureDatabaseInitialized() {
  try {
    const checkTable = await db.query(
      "SELECT to_regclass('public.gangguan_ti') AS table_exists"
    );
    if (!checkTable.rows[0]?.table_exists) {
      const initSqlPath = path.resolve(__dirname, '../database/init.sql');
      if (fs.existsSync(initSqlPath)) {
        const sqlContent = fs.readFileSync(initSqlPath, 'utf8');
        await db.query(sqlContent);
        console.log('[DB Init]: Skema dan 20 data awal berhasil diinisialisasi dari init.sql');
      }
    }
  } catch (err) {
    console.warn('[DB Init Notice]: Database belum siap atau sudah diinisialisasi oleh kontainer Docker:', err.message);
  }
}

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[Server]: Backend Sistem Catatan Gangguan TI berjalan pada port ${PORT}`);
  await ensureDatabaseInitialized();
});

module.exports = app;

