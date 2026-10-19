/**
 * Routes CRUD Catatan Gangguan TI (IT Helpdesk)
 * Mengacu pada Kamus Data: dataset/json/04-gangguan-ti.json
 *
 * Fitur Keamanan yang Diterapkan:
 * - Parameterized SQL Queries ($1, $2, ...) -> Anti SQL Injection (SQLi)
 * - Kepemilikan Data (canAccessTicket)      -> Anti IDOR
 * - Whitelist Field (req.validatedTicket)   -> Anti Mass Assignment
 * - Sanitasi Input & Validasi Lampiran      -> Anti XSS & Unrestricted File Upload
 */
const express = require('express');
const db = require('../config/db');
const { authenticateToken, canAccessTicket } = require('../middleware/auth');
const {
  ALLOWED_KATEGORI,
  ALLOWED_STATUS,
  validateTicketPayload,
} = require('../middleware/validator');
const { sanitizeString } = require('../middleware/security');

const router = express.Router();

// Seluruh endpoint tiket memerlukan autentikasi JWT yang valid
router.use(authenticateToken);

/**
 * GET /api/tickets/meta
 * Mengembalikan metadata kamus data (pilihan enum kategori, status, dan label nilai)
 */
router.get('/meta', (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      dataset: '04-gangguan-ti',
      judul: 'Catatan gangguan TI',
      kategori: ALLOWED_KATEGORI,
      status: ALLOWED_STATUS,
      label_nilai: 'Estimasi biaya penanganan (rupiah)',
    },
  });
});

/**
 * GET /api/tickets
 * Menampilkan daftar catatan gangguan TI dengan fitur pencarian, filter, dan ringkasan statistik.
 */
router.get('/', async (req, res, next) => {
  try {
    const search = sanitizeString(req.query.search || '');
    const kategori = sanitizeString(req.query.kategori || '');
    const status = sanitizeString(req.query.status || '');
    const unitFilter = sanitizeString(req.query.unit || '');

    const conditions = [];
    const values = [];

    // Proteksi IDOR pada daftar data:
    // Operator hanya dapat melihat tiket milik unit kerjanya atau yang dibuat olehnya,
    // sedangkan Admin dapat melihat seluruh tiket lintas unit.
    if (req.user.role !== 'admin') {
      values.push(req.user.unit, req.user.id);
      conditions.push(`(LOWER(unit) = LOWER($${values.length - 1}) OR created_by = $${values.length})`);
    } else if (unitFilter && unitFilter !== 'Semua') {
      values.push(unitFilter);
      conditions.push(`LOWER(unit) = LOWER($${values.length})`);
    }

    if (kategori && kategori !== 'Semua' && ALLOWED_KATEGORI.includes(kategori)) {
      values.push(kategori);
      conditions.push(`kategori = $${values.length}`);
    }

    if (status && status !== 'Semua' && ALLOWED_STATUS.includes(status)) {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      const paramIdx = values.length;
      conditions.push(
        `(kode ILIKE $${paramIdx} OR nama ILIKE $${paramIdx} OR unit ILIKE $${paramIdx} OR catatan ILIKE $${paramIdx})`
      );
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        id,
        kode,
        nama,
        kategori,
        unit,
        TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
        CAST(nilai AS BIGINT) AS nilai,
        status,
        catatan,
        created_by,
        created_at,
        updated_at
      FROM gangguan_ti
      ${whereClause}
      ORDER BY tanggal DESC, id DESC
    `;

    const result = await db.query(sql, values);

    // Pastikan tipe data nilai berupa Number di JSON
    const rows = result.rows.map((row) => ({
      ...row,
      nilai: Number(row.nilai),
    }));

    // Hitung ringkasan statistik berdasarkan cakupan akses pengguna
    const statsParams = [];
    let statsWhere = '';
    if (req.user.role !== 'admin') {
      statsParams.push(req.user.unit, req.user.id);
      statsWhere = 'WHERE LOWER(unit) = LOWER($1) OR created_by = $2';
    }

    const statsResult = await db.query(
      `SELECT
        COUNT(*)::INT AS total,
        COUNT(*) FILTER (WHERE status = 'Baru')::INT AS baru,
        COUNT(*) FILTER (WHERE status = 'Diproses')::INT AS diproses,
        COUNT(*) FILTER (WHERE status = 'Selesai')::INT AS selesai,
        COALESCE(SUM(nilai), 0)::BIGINT AS total_nilai
       FROM gangguan_ti
       ${statsWhere}`,
      statsParams
    );

    const statsRow = statsResult.rows[0] || {
      total: 0,
      baru: 0,
      diproses: 0,
      selesai: 0,
      total_nilai: 0,
    };

    return res.status(200).json({
      success: true,
      data: rows,
      stats: {
        total: Number(statsRow.total),
        baru: Number(statsRow.baru),
        diproses: Number(statsRow.diproses),
        selesai: Number(statsRow.selesai),
        total_nilai: Number(statsRow.total_nilai),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/tickets/:id
 * Mengambil rincian 1 tiket gangguan TI dengan pengecekan kepemilikan (Anti-IDOR)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const ticketId = Number(req.params.id);
    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID tiket tidak valid.',
      });
    }

    const result = await db.query(
      `SELECT
        g.id,
        g.kode,
        g.nama,
        g.kategori,
        g.unit,
        TO_CHAR(g.tanggal, 'YYYY-MM-DD') AS tanggal,
        CAST(g.nilai AS BIGINT) AS nilai,
        g.status,
        g.catatan,
        g.created_by,
        g.created_at,
        g.updated_at,
        u.nama_lengkap AS pelapor_nama
      FROM gangguan_ti g
      LEFT JOIN users u ON g.created_by = u.id
      WHERE g.id = $1
      LIMIT 1`,
      [ticketId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data tiket gangguan TI tidak ditemukan.',
      });
    }

    const ticket = result.rows[0];

    // Proteksi IDOR: Cek apakah pengguna berhak melihat tiket ini
    if (!canAccessTicket(req.user, ticket)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak (Proteksi IDOR): Anda tidak memiliki izin untuk melihat tiket milik unit kerja lain.',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...ticket,
        nilai: Number(ticket.nilai),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/tickets
 * Menambahkan tiket gangguan TI baru dengan validasi lengkap & cek duplikasi kode di database
 */
router.post('/', validateTicketPayload, async (req, res, next) => {
  try {
    const {
      kode,
      nama,
      kategori,
      unit,
      tanggal,
      nilai,
      status,
      catatan,
    } = req.validatedTicket;

    // Jika bukan admin, pastikan operator hanya membuat tiket untuk unit kerjanya sendiri
    if (req.user.role !== 'admin' && unit.toLowerCase() !== req.user.unit.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `Sebagai operator ${req.user.unit}, Anda hanya dapat membuat tiket untuk unit ${req.user.unit}.`,
        errors: {
          unit: `Unit kerja harus sesuai dengan unit akun Anda (${req.user.unit}).`,
        },
      });
    }

    // Cek duplikasi kode unik tiket di database
    const duplicateCheck = await db.query(
      'SELECT id FROM gangguan_ti WHERE UPPER(kode) = $1 LIMIT 1',
      [kode]
    );

    if (duplicateCheck.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Kode tiket "${kode}" sudah digunakan. Gunakan kode unik lainnya.`,
        errors: {
          kode: `Kode tiket "${kode}" sudah terdaftar di dalam database.`,
        },
      });
    }

    const insertResult = await db.query(
      `INSERT INTO gangguan_ti (kode, nama, kategori, unit, tanggal, nilai, status, catatan, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING
         id,
         kode,
         nama,
         kategori,
         unit,
         TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
         CAST(nilai AS BIGINT) AS nilai,
         status,
         catatan,
         created_by,
         created_at,
         updated_at`,
      [kode, nama, kategori, unit, tanggal, nilai, status, catatan, req.user.id]
    );

    const createdTicket = insertResult.rows[0];

    return res.status(201).json({
      success: true,
      message: `Tiket gangguan TI (${createdTicket.kode}) berhasil ditambahkan.`,
      data: {
        ...createdTicket,
        nilai: Number(createdTicket.nilai),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/tickets/:id
 * Memperbarui data tiket gangguan TI dengan proteksi IDOR & cek duplikasi kode
 */
router.put('/:id', validateTicketPayload, async (req, res, next) => {
  try {
    const ticketId = Number(req.params.id);
    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID tiket tidak valid.',
      });
    }

    // Ambil data tiket saat ini untuk verifikasi eksistensi dan kepemilikan (Anti-IDOR)
    const existingResult = await db.query(
      'SELECT id, kode, unit, created_by FROM gangguan_ti WHERE id = $1 LIMIT 1',
      [ticketId]
    );

    if (existingResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data tiket yang akan diubah tidak ditemukan.',
      });
    }

    const existingTicket = existingResult.rows[0];

    // Proteksi IDOR: Pastikan pengguna memiliki otorisasi atas tiket ini
    if (!canAccessTicket(req.user, existingTicket)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak (Proteksi IDOR): Anda tidak berhak mengubah tiket milik unit kerja lain.',
      });
    }

    const {
      kode,
      nama,
      kategori,
      unit,
      tanggal,
      nilai,
      status,
      catatan,
    } = req.validatedTicket;

    if (req.user.role !== 'admin' && unit.toLowerCase() !== req.user.unit.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `Anda hanya diizinkan menetapkan unit kerja ${req.user.unit}.`,
        errors: {
          unit: `Unit kerja harus tetap ${req.user.unit}.`,
        },
      });
    }

    // Cek apakah kode tiket baru bentrok dengan tiket lain di database
    const duplicateCheck = await db.query(
      'SELECT id FROM gangguan_ti WHERE UPPER(kode) = $1 AND id <> $2 LIMIT 1',
      [kode, ticketId]
    );

    if (duplicateCheck.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Kode tiket "${kode}" sudah digunakan oleh tiket lain.`,
        errors: {
          kode: `Kode tiket "${kode}" sudah terdaftar pada tiket lain di database.`,
        },
      });
    }

    const updateResult = await db.query(
      `UPDATE gangguan_ti
       SET
         kode = $1,
         nama = $2,
         kategori = $3,
         unit = $4,
         tanggal = $5,
         nilai = $6,
         status = $7,
         catatan = $8,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING
         id,
         kode,
         nama,
         kategori,
         unit,
         TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
         CAST(nilai AS BIGINT) AS nilai,
         status,
         catatan,
         created_by,
         created_at,
         updated_at`,
      [kode, nama, kategori, unit, tanggal, nilai, status, catatan, ticketId]
    );

    const updated = updateResult.rows[0];

    return res.status(200).json({
      success: true,
      message: `Tiket gangguan TI (${updated.kode}) berhasil diperbarui.`,
      data: {
        ...updated,
        nilai: Number(updated.nilai),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/tickets/:id
 * Menghapus tiket gangguan TI secara permanen dengan proteksi IDOR
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const ticketId = Number(req.params.id);
    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID tiket tidak valid.',
      });
    }

    const existingResult = await db.query(
      'SELECT id, kode, nama, unit, created_by FROM gangguan_ti WHERE id = $1 LIMIT 1',
      [ticketId]
    );

    if (existingResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data tiket yang akan dihapus tidak ditemukan.',
      });
    }

    const existingTicket = existingResult.rows[0];

    // Proteksi IDOR: Cek kepemilikan sebelum menghapus
    if (!canAccessTicket(req.user, existingTicket)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak (Proteksi IDOR): Anda tidak berhak menghapus tiket milik unit kerja lain.',
      });
    }

    await db.query('DELETE FROM gangguan_ti WHERE id = $1', [ticketId]);

    return res.status(200).json({
      success: true,
      message: `Tiket gangguan TI (${existingTicket.kode} - ${existingTicket.nama}) berhasil dihapus.`,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

