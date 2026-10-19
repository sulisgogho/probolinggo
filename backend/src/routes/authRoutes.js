/**
 * Routes Autentikasi & Manajemen Sesi (JWT)
 * Endpoint:
 * - POST /api/auth/login  : Login pengguna & penerbitan JWT dengan jti unik
 * - POST /api/auth/logout : Pencabutan sesi aktif (Token Revocation)
 * - GET  /api/auth/me     : Verifikasi profil pengguna aktif
 */
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const {
  JWT_SECRET,
  authenticateToken,
  revokeToken,
} = require('../middleware/auth');
const {
  sanitizeString,
  loginRateLimiter,
  resetLoginAttempts,
} = require('../middleware/security');

const router = express.Router();

/**
 * POST /api/auth/login
 * Mengautentikasi pengguna secara aman dengan parameterized query dan bcrypt
 */
router.post('/login', loginRateLimiter, async (req, res, next) => {
  try {
    // Mass Assignment Protection: hanya ambil username dan password
    const rawUsername = req.body?.username;
    const rawPassword = req.body?.password;

    const username = sanitizeString(typeof rawUsername === 'string' ? rawUsername : '').toLowerCase();
    const password = typeof rawPassword === 'string' ? rawPassword : '';

    const errors = {};
    if (!username) {
      errors.username = 'Nama pengguna (username) wajib diisi.';
    }
    if (!password) {
      errors.password = 'Kata sandi (password) wajib diisi.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi nama pengguna dan kata sandi.',
        errors,
      });
    }

    // Parameterized Query untuk mencegah SQL Injection (SQLi)
    const userResult = await db.query(
      `SELECT id, username, password_hash, nama_lengkap, unit, role
       FROM users
       WHERE LOWER(username) = $1
       LIMIT 1`,
      [username]
    );

    if (userResult.rowCount === 0) {
      // Gunakan pesan generik agar tidak membocorkan apakah username terdaftar (Anti User Enumeration)
      return res.status(401).json({
        success: false,
        message: 'Nama pengguna atau kata sandi yang Anda masukkan salah.',
      });
    }

    const user = userResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Nama pengguna atau kata sandi yang Anda masukkan salah.',
      });
    }

    // Reset rate limiter setelah berhasil login
    resetLoginAttempts(req);

    // Buat ID token kriptografis (jti) untuk manajemen sesi yang aman (Anti Broken Session Management)
    const jti = crypto.randomUUID();
    const expiresIn = process.env.JWT_EXPIRES_IN || '2h';

    const token = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        unit: user.unit,
        role: user.role,
        jti,
      },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Autentikasi berhasil.',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nama_lengkap: user.nama_lengkap,
          unit: user.unit,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 * Mencabut token JWT aktif agar tidak dapat digunakan kembali setelah logout
 */
router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    await revokeToken(req.user.jti, req.user.exp);
    return res.status(200).json({
      success: true,
      message: 'Sesi Anda telah berhasil diakhiri.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Mengembalikan informasi pengguna yang sedang login
 */
router.get('/me', authenticateToken, async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        username: req.user.username,
        nama_lengkap: req.user.nama_lengkap,
        unit: req.user.unit,
        role: req.user.role,
      },
    },
  });
});

module.exports = router;

