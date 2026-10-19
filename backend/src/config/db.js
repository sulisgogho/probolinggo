/**
 * Konfigurasi Koneksi Database PostgreSQL
 * Menggunakan Connection Pool dan Parameterized Query untuk mencegah SQL Injection (SQLi).
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'helpdesk_user',
  password: process.env.DB_PASSWORD || 'helpdesk_secret_2026',
  database: process.env.DB_NAME || 'it_helpdesk_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  // Log internal tanpa membocorkan detail kredensial ke publik
  console.error('[DB Pool Error]: Unexpected error on idle database client', err.message);
});

/**
 * Helper eksekusi query berparameter ($1, $2, dst.)
 * @param {string} text - Perintah SQL dengan placeholder parameter
 * @param {Array} params - Nilai parameter yang di-bind secara aman oleh driver pg
 */
const query = (text, params = []) => pool.query(text, params);

module.exports = {
  pool,
  query,
};

