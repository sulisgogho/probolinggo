/**
 * Middleware Autentikasi JWT & Otorisasi Anti-IDOR
 * Melindungi dari:
 * - Broken Session Management (verifikasi JWT + pencabutan sesi / token blacklist)
 * - Insecure Direct Object Reference / IDOR (verifikasi kepemilikan data berdasarkan peran & unit)
 */
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';

// Cache di memori sebagai lapisan tambahan untuk token yang telah di-logout
const memoryRevokedJtis = new Set();

/**
 * Middleware verifikasi token JWT dan status pencabutan sesi (Logout)
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Sesi autentikasi tidak ditemukan, silakan login terlebih dahulu.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token autentikasi tidak valid.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'],
      });
    } catch (verifyErr) {
      return res.status(401).json({
        success: false,
        message: 'Sesi Anda telah berakhir atau token tidak sah. Silakan login kembali.',
      });
    }

    // Cek apakah JTI token sudah di-revoke (Broken Session Management protection)
    if (decoded.jti) {
      if (memoryRevokedJtis.has(decoded.jti)) {
        return res.status(401).json({
          success: false,
          message: 'Sesi ini telah diakhiri (logout). Silakan login kembali.',
        });
      }

      const revokedCheck = await db.query(
        'SELECT jti FROM revoked_tokens WHERE jti = $1 LIMIT 1',
        [decoded.jti]
      );
      if (revokedCheck.rowCount > 0) {
        memoryRevokedJtis.add(decoded.jti);
        return res.status(401).json({
          success: false,
          message: 'Sesi ini telah diakhiri (logout). Silakan login kembali.',
        });
      }
    }

    // Simpan konteks user yang terverifikasi ke request
    req.user = {
      id: decoded.sub,
      username: decoded.username,
      nama_lengkap: decoded.nama_lengkap,
      unit: decoded.unit,
      role: decoded.role,
      jti: decoded.jti,
      exp: decoded.exp,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Mencabut token saat pengguna logout agar tidak bisa digunakan kembali
 */
async function revokeToken(jti, expTimestamp) {
  if (!jti) return;
  memoryRevokedJtis.add(jti);
  const expiresAt = expTimestamp
    ? new Date(expTimestamp * 1000).toISOString()
    : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  await db.query(
    `INSERT INTO revoked_tokens (jti, expires_at)
     VALUES ($1, $2)
     ON CONFLICT (jti) DO NOTHING`,
    [jti, expiresAt]
  );

  // Bersihkan token kadaluarsa secara berkala
  await db.query('DELETE FROM revoked_tokens WHERE expires_at < NOW()');
}

/**
 * Helper Pengecekan Kepemilikan Data (Anti-IDOR)
 * - Pengguna dengan role 'admin' memiliki akses penuh ke seluruh unit.
 * - Pengguna dengan role 'operator' hanya dapat mengakses/mengubah/menghapus tiket
 *   milik unit kerjanya sendiri atau tiket yang dibuat olehnya.
 */
function canAccessTicket(user, ticket) {
  if (!user || !ticket) return false;
  if (user.role === 'admin') return true;
  return (
    ticket.created_by === user.id ||
    (ticket.unit && user.unit && ticket.unit.toLowerCase() === user.unit.toLowerCase())
  );
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  revokeToken,
  canAccessTicket,
};

