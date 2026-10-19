/**
 * Middleware Validasi Input & Proteksi Mass Assignment
 * Mengacu pada Kamus Data 04-gangguan-ti ("Catatan gangguan TI"):
 * - kode     : Wajib, unik, format kode tiket (misal: IT4-001)
 * - nama     : Wajib, nama/deskripsi singkat gangguan TI
 * - kategori : Wajib, enum ('Perangkat', 'Aplikasi', 'Koneksi')
 * - unit     : Wajib, nama unit pelapor (misal: Sekretariat, Dinas A, Dinas B, Unit Teknis)
 * - tanggal  : Wajib, format tanggal YYYY-MM-DD yang valid secara kalender
 * - nilai    : Wajib, angka bulat >= 0 (Estimasi biaya penanganan dalam rupiah)
 * - status   : Wajib, enum ('Baru', 'Diproses', 'Selesai')
 * - catatan  : Opsional, string catatan tambahan
 */
const {
  sanitizeString,
  hasDangerousPayload,
} = require('./security');

const ALLOWED_KATEGORI = ['Perangkat', 'Aplikasi', 'Koneksi'];
const ALLOWED_STATUS = ['Baru', 'Diproses', 'Selesai'];

/**
 * Validasi ketat format dan eksistensi tanggal kalender YYYY-MM-DD
 */
function isValidCalendarDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = dateStr.match(regex);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 2000 || year > 2100) return false;
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day >= 1 && day <= daysInMonth;
}

/**
 * Middleware validasi payload pembuatan / pembaruan tiket gangguan TI
 * Sekaligus menerapkan Mass Assignment Protection (hanya mengambil field yang diizinkan).
 */
function validateTicketPayload(req, res, next) {
  const body = req.body || {};
  const errors = {};

  // 1. MASS ASSIGNMENT PROTECTION:
  // Hanya ekstrak properti yang ada dalam kamus data, abaikan properti asing seperti role, is_admin, id, created_by
  const rawKode = body.kode !== undefined && body.kode !== null ? String(body.kode).trim() : '';
  const rawNama = body.nama !== undefined && body.nama !== null ? String(body.nama).trim() : '';
  const rawKategori = body.kategori !== undefined && body.kategori !== null ? String(body.kategori).trim() : '';
  const rawUnit = body.unit !== undefined && body.unit !== null ? String(body.unit).trim() : '';
  const rawTanggal = body.tanggal !== undefined && body.tanggal !== null ? String(body.tanggal).trim() : '';
  const rawNilai = body.nilai;
  const rawStatus = body.status !== undefined && body.status !== null ? String(body.status).trim() : '';
  const rawCatatan = body.catatan !== undefined && body.catatan !== null ? String(body.catatan) : '';

  // 2. CEK PAYLOAD XSS BERBAHAYA
  const textFields = [
    { key: 'kode', val: rawKode, label: 'Kode tiket' },
    { key: 'nama', val: rawNama, label: 'Nama gangguan' },
    { key: 'unit', val: rawUnit, label: 'Unit kerja' },
    { key: 'catatan', val: rawCatatan, label: 'Catatan' },
  ];

  for (const field of textFields) {
    if (hasDangerousPayload(field.val)) {
      errors[field.key] = `${field.label} mengandung karakter atau tag skrip yang tidak diizinkan (proteksi XSS).`;
    }
  }

  // 3. VALIDASI KODE TIKET (Wajib & Format)
  const kode = sanitizeString(rawKode).toUpperCase();
  if (!kode) {
    errors.kode = 'Kode unik tiket wajib diisi.';
  } else if (kode.length < 3 || kode.length > 50) {
    errors.kode = 'Kode tiket harus terdiri dari 3 hingga 50 karakter.';
  } else if (!/^[A-Z0-9-_]+$/.test(kode)) {
    errors.kode = 'Kode tiket hanya boleh berisi huruf, angka, tanda hubung (-), atau garis bawah (_).';
  }

  // 4. VALIDASI NAMA GANGGUAN (Wajib)
  const nama = sanitizeString(rawNama);
  if (!nama) {
    errors.nama = 'Nama gangguan TI wajib diisi.';
  } else if (nama.length < 3 || nama.length > 255) {
    errors.nama = 'Nama gangguan TI harus antara 3 hingga 255 karakter.';
  }

  // 5. VALIDASI KATEGORI (Wajib & Sesuai Enum Kamus Data)
  const kategori = sanitizeString(rawKategori);
  if (!kategori) {
    errors.kategori = 'Kategori gangguan wajib dipilih.';
  } else if (!ALLOWED_KATEGORI.includes(kategori)) {
    errors.kategori = `Kategori harus salah satu dari pilihan resmi: ${ALLOWED_KATEGORI.join(', ')}.`;
  }

  // 6. VALIDASI UNIT KERJA (Wajib)
  const unit = sanitizeString(rawUnit);
  if (!unit) {
    errors.unit = 'Unit kerja pelapor wajib diisi.';
  } else if (unit.length < 2 || unit.length > 150) {
    errors.unit = 'Nama unit kerja harus antara 2 hingga 150 karakter.';
  }

  // 7. VALIDASI TANGGAL (Wajib & Format Kalender YYYY-MM-DD)
  const tanggal = sanitizeString(rawTanggal).slice(0, 10);
  if (!tanggal) {
    errors.tanggal = 'Tanggal laporan gangguan wajib diisi.';
  } else if (!isValidCalendarDate(tanggal)) {
    errors.tanggal = 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD yang benar.';
  }

  // 8. VALIDASI NILAI / ESTIMASI BIAYA PENANGANAN (Wajib, Angka >= 0)
  let parsedNilai = null;
  if (rawNilai === undefined || rawNilai === null || String(rawNilai).trim() === '') {
    errors.nilai = 'Estimasi biaya penanganan (rupiah) wajib diisi (minimal 0).';
  } else {
    const numNilai = Number(rawNilai);
    if (!Number.isFinite(numNilai) || Number.isNaN(numNilai)) {
      errors.nilai = 'Estimasi biaya penanganan harus berupa angka yang valid.';
    } else if (numNilai < 0) {
      errors.nilai = 'Estimasi biaya penanganan tidak boleh kurang dari 0.';
    } else if (!Number.isInteger(numNilai)) {
      errors.nilai = 'Estimasi biaya penanganan harus berupa bilangan bulat (rupiah).';
    } else if (numNilai > 1000000000000) {
      errors.nilai = 'Estimasi biaya penanganan melebihi batas wajar sistem.';
    } else {
      parsedNilai = numNilai;
    }
  }

  // 9. VALIDASI STATUS (Wajib & Sesuai Enum Kamus Data)
  const status = sanitizeString(rawStatus);
  if (!status) {
    errors.status = 'Status penanganan wajib dipilih.';
  } else if (!ALLOWED_STATUS.includes(status)) {
    errors.status = `Status harus salah satu dari pilihan resmi: ${ALLOWED_STATUS.join(', ')}.`;
  }

  // 10. VALIDASI CATATAN (Opsional, maksimal 1000 karakter)
  const catatan = sanitizeString(rawCatatan);
  if (catatan.length > 1000) {
    errors.catatan = 'Catatan tambahan maksimal 1000 karakter.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validasi data gagal. Periksa kembali isian formulir Anda.',
      errors,
    });
  }

  // Simpan hanya data bersih yang sudah tervalidasi ke req.validatedTicket
  req.validatedTicket = {
    kode,
    nama,
    kategori,
    unit,
    tanggal,
    nilai: parsedNilai,
    status,
    catatan,
  };

  next();
}

module.exports = {
  ALLOWED_KATEGORI,
  ALLOWED_STATUS,
  isValidCalendarDate,
  validateTicketPayload,
};

