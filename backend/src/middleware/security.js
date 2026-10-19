/**
 * Middleware & Utilitas Keamanan Aplikasi
 * Melindungi dari:
 * - Cross-Site Scripting (XSS)
 * - Information Disclosure
 * - Brute-Force Login
 */

// Daftar pola berbahaya (XSS / Script Injection)
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /\bon\w+\s*=/gi,
  /<iframe\b/gi,
  /<object\b/gi,
  /<embed\b/gi,
  /<svg\b[^>]*onload/gi,
];

/**
 * Sanitasi string untuk mencegah Cross-Site Scripting (XSS)
 * Menghapus karakter kontrol dan tag HTML berbahaya.
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  let cleaned = input.trim();
  // Hapus tag HTML/elemen script berbahaya
  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');
  for (const pattern of DANGEROUS_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned.trim();
}

/**
 * Mengecek apakah string mengandung payload XSS / injeksi skrip
 */
function hasDangerousPayload(input) {
  if (typeof input !== 'string') return false;
  if (/<\/?[a-z][\s\S]*>/i.test(input)) return true;
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Middleware HTTP Security Headers
 */
function securityHeaders(req, res, next) {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; frame-ancestors 'none'; base-uri 'self';"
  );
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  next();
}

/**
 * Rate Limiter sederhana berbasis memori untuk proteksi Brute-Force pada endpoint Login
 */
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 menit

function loginRateLimiter(req, res, next) {
  const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  const record = loginAttempts.get(clientIp);

  if (record && now - record.firstAttempt < WINDOW_MS) {
    if (record.count >= MAX_LOGIN_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: 'Terlalu banyak percobaan login. Silakan coba kembali setelah 15 menit.',
      });
    }
    record.count += 1;
  } else {
    loginAttempts.set(clientIp, { count: 1, firstAttempt: now });
  }
  next();
}

function resetLoginAttempts(req) {
  const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';
  loginAttempts.delete(clientIp);
}

/**
 * Centralized Error Handler untuk mencegah Information Disclosure
 * Tidak pernah menampilkan pesan error mentah dari database / stack trace ke pengguna.
 */
function errorHandler(err, req, res, next) {
  // Catat log lengkap hanya di sisi server untuk keperluan audit internal
  console.error('[Internal Server Error]:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    errorCode: err.code,
    errorMessage: err.message,
  });

  if (res.headersSent) {
    return next(err);
  }

  // Tangani JSON malformat pada request body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Format data JSON yang dikirimkan tidak valid.',
    });
  }

  // Tangani payload terlalu besar
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Ukuran data yang dikirimkan melebihi batas maksimum yang diizinkan.',
    });
  }

  // Tangani constraint unik PostgreSQL (23505) secara aman tanpa membocorkan struktur tabel
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Kode tiket sudah digunakan pada data lain.',
      errors: {
        kode: 'Kode unik tiket sudah terdaftar di database. Gunakan kode lain.',
      },
    });
  }

  // Tangani check constraint PostgreSQL (23514) atau invalid input syntax (22P02)
  if (err.code === '23514' || err.code === '22P02' || err.code === '22007') {
    return res.status(400).json({
      success: false,
      message: 'Data yang dikirimkan tidak memenuhi aturan validasi.',
    });
  }

  // Pesan generik yang aman untuk error tak terduga
  return res.status(500).json({
    success: false,
    message: 'Terjadi gangguan pada server saat memproses permintaan Anda. Silakan coba beberapa saat lagi.',
  });
}

module.exports = {
  sanitizeString,
  hasDangerousPayload,
  securityHeaders,
  loginRateLimiter,
  resetLoginAttempts,
  errorHandler,
};

