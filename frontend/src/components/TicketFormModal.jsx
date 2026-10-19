/**
 * Komponen Modal Form Tambah & Ubah Tiket Gangguan TI
 * Menggunakan komponen resmi @idds/react:
 * Modal, TextField, SelectDropdown, TextArea, Button, Alert, Spinner, Chip
 *
 * Mendukung validasi sisi klien & menampilkan error spesifik dari validasi backend.
 */
import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextField,
  SelectDropdown,
  TextArea,
  Button,
  Alert,
  Spinner,
  Chip,
  containsDangerousPatterns,
} from '@idds/react';
import {
  IconDeviceFloppy,
  IconX,
} from '@tabler/icons-react';

const KATEGORI_OPTIONS = [
  { label: 'Perangkat', value: 'Perangkat' },
  { label: 'Aplikasi', value: 'Aplikasi' },
  { label: 'Koneksi', value: 'Koneksi' },
];

const STATUS_OPTIONS = [
  { label: 'Baru', value: 'Baru' },
  { label: 'Diproses', value: 'Diproses' },
  { label: 'Selesai', value: 'Selesai' },
];

const UNIT_SUGGESTIONS = [
  { label: 'Sekretariat', value: 'Sekretariat' },
  { label: 'Dinas A', value: 'Dinas A' },
  { label: 'Dinas B', value: 'Dinas B' },
  { label: 'Unit Teknis', value: 'Unit Teknis' },
];

export default function TicketFormModal({
  open,
  onClose,
  initialData,
  onSubmit,
  currentUser,
  suggestedNextCode,
}) {
  const isEditMode = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    kategori: 'Perangkat',
    unit: '',
    tanggal: '',
    nilai: '0',
    status: 'Baru',
    catatan: '',
  });

  const [errors, setErrors] = useState({});
  const [formBannerError, setFormBannerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setFormBannerError('');

    if (initialData) {
      setFormData({
        kode: initialData.kode || '',
        nama: initialData.nama || '',
        kategori: initialData.kategori || 'Perangkat',
        unit: initialData.unit || '',
        tanggal: initialData.tanggal ? String(initialData.tanggal).slice(0, 10) : '',
        nilai:
          initialData.nilai !== undefined && initialData.nilai !== null
            ? String(initialData.nilai)
            : '0',
        status: initialData.status || 'Baru',
        catatan: initialData.catatan || '',
      });
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const defaultUnit =
        currentUser?.role !== 'admin' && currentUser?.unit ? currentUser.unit : 'Sekretariat';

      setFormData({
        kode: suggestedNextCode || 'IT4-021',
        nama: '',
        kategori: 'Perangkat',
        unit: defaultUnit,
        tanggal: today,
        nilai: '0',
        status: 'Baru',
        catatan: '',
      });
    }
  }, [open, initialData, currentUser, suggestedNextCode]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Validasi sisi Frontend sebelum dikirim ke Backend
   */
  const validateClientSide = () => {
    const nextErrors = {};
    const kodeTrimmed = formData.kode.trim().toUpperCase();
    const namaTrimmed = formData.nama.trim();
    const unitTrimmed = formData.unit.trim();
    const tanggalTrimmed = formData.tanggal.trim();
    const nilaiRaw = String(formData.nilai).trim();

    if (!kodeTrimmed) {
      nextErrors.kode = 'Kode unik tiket wajib diisi.';
    } else if (!/^[A-Z0-9-_]{3,50}$/.test(kodeTrimmed)) {
      nextErrors.kode = 'Kode tiket harus 3-50 karakter (huruf, angka, tanda hubung - atau _).';
    }

    if (!namaTrimmed) {
      nextErrors.nama = 'Nama gangguan TI wajib diisi.';
    } else if (namaTrimmed.length < 3) {
      nextErrors.nama = 'Nama gangguan TI minimal 3 karakter.';
    } else if (containsDangerousPatterns(namaTrimmed)) {
      nextErrors.nama = 'Nama gangguan mengandung tag/skrip yang tidak diizinkan.';
    }

    if (!formData.kategori || !['Perangkat', 'Aplikasi', 'Koneksi'].includes(formData.kategori)) {
      nextErrors.kategori = 'Kategori wajib dipilih sesuai pilihan enum.';
    }

    if (!unitTrimmed) {
      nextErrors.unit = 'Unit kerja pelapor wajib diisi.';
    } else if (containsDangerousPatterns(unitTrimmed)) {
      nextErrors.unit = 'Nama unit mengandung karakter yang tidak diizinkan.';
    }

    if (!tanggalTrimmed) {
      nextErrors.tanggal = 'Tanggal gangguan wajib diisi.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggalTrimmed)) {
      nextErrors.tanggal = 'Format tanggal harus YYYY-MM-DD.';
    }

    if (nilaiRaw === '') {
      nextErrors.nilai = 'Estimasi biaya penanganan (rupiah) wajib diisi.';
    } else {
      const parsed = Number(nilaiRaw);
      if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
        nextErrors.nilai = 'Estimasi biaya penanganan harus berupa angka.';
      } else if (parsed < 0) {
        nextErrors.nilai = 'Estimasi biaya penanganan harus bernilai 0 atau lebih.';
      } else if (!Number.isInteger(parsed)) {
        nextErrors.nilai = 'Estimasi biaya penanganan harus berupa angka bulat (rupiah).';
      }
    }

    if (!formData.status || !['Baru', 'Diproses', 'Selesai'].includes(formData.status)) {
      nextErrors.status = 'Status wajib dipilih sesuai pilihan enum.';
    }

    if (formData.catatan && containsDangerousPatterns(formData.catatan)) {
      nextErrors.catatan = 'Catatan mengandung tag/skrip berbahaya yang tidak diizinkan.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormBannerError('');

    if (!validateClientSide()) {
      setFormBannerError('Mohon periksa kembali isian formulir yang ditandai merah.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        kode: formData.kode.trim().toUpperCase(),
        nama: formData.nama.trim(),
        kategori: formData.kategori,
        unit: formData.unit.trim(),
        tanggal: formData.tanggal.trim(),
        nilai: Number(formData.nilai),
        status: formData.status,
        catatan: formData.catatan.trim(),
      };

      await onSubmit(payload);
    } catch (err) {
      const resData = err.response?.data;
      if (resData?.errors && typeof resData.errors === 'object') {
        setErrors(resData.errors);
      }
      setFormBannerError(
        resData?.message || 'Gagal menyimpan data tiket. Periksa kembali isian formulir Anda.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isUnitLocked = currentUser?.role !== 'admin';

  return (
    <Modal
      open={open}
      onClose={() => !submitting && onClose()}
      title={isEditMode ? `Ubah Catatan Gangguan TI (${initialData.kode})` : 'Tambah Catatan Gangguan TI Baru'}
      size="lg"
      closeOnBackdrop={!submitting}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5 pt-1">
        {formBannerError && (
          <div role="alert">
            <Alert
              variant="critical"
              title="Gagal Menyimpan Data"
              message={formBannerError}
              dismissible
              onDismiss={() => setFormBannerError('')}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kode Unik Tiket */}
          <div>
            <TextField
              id="form-kode"
              label="Kode Unik Tiket *"
              placeholder="Contoh: IT4-021"
              value={formData.kode}
              onChange={(val) => updateField('kode', val.toUpperCase())}
              status={errors.kode ? 'error' : 'neutral'}
              statusMessage={errors.kode}
              helperText="Kode harus unik dan belum terdaftar di database"
              disabled={submitting}
              maxLength={50}
              required
            />
          </div>

          {/* Tanggal Kejadian */}
          <div>
            <TextField
              id="form-tanggal"
              type="date"
              label="Tanggal Laporan *"
              value={formData.tanggal}
              onChange={(val) => updateField('tanggal', val)}
              status={errors.tanggal ? 'error' : 'neutral'}
              statusMessage={errors.tanggal}
              helperText="Format tanggal kalender YYYY-MM-DD"
              showClearButton={false}
              disabled={submitting}
              required
            />
          </div>
        </div>

        {/* Nama Gangguan TI */}
        <div>
          <TextField
            id="form-nama"
            label="Nama Gangguan TI *"
            placeholder="Contoh: Printer gagal mencetak / Portal gagal dibuka"
            value={formData.nama}
            onChange={(val) => updateField('nama', val)}
            status={errors.nama ? 'error' : 'neutral'}
            statusMessage={errors.nama}
            disabled={submitting}
            maxLength={255}
            showCharCount
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kategori (Dropdown Enum Kamus Data) */}
          <div>
            <SelectDropdown
              label="Kategori Gangguan *"
              options={KATEGORI_OPTIONS}
              selected={formData.kategori}
              onSelect={(val) => updateField('kategori', val || '')}
              placeholder="Pilih Kategori"
              searchable={false}
              showPreviewValue={false}
              error={Boolean(errors.kategori)}
              disabled={submitting}
              required
              width="100%"
            />
            {errors.kategori && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.kategori}</p>
            )}
          </div>

          {/* Status (Dropdown Enum Kamus Data) */}
          <div>
            <SelectDropdown
              label="Status Penanganan *"
              options={STATUS_OPTIONS}
              selected={formData.status}
              onSelect={(val) => updateField('status', val || '')}
              placeholder="Pilih Status"
              searchable={false}
              showPreviewValue={false}
              error={Boolean(errors.status)}
              disabled={submitting}
              required
              width="100%"
            />
            {errors.status && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.status}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unit Kerja */}
          <div>
            <TextField
              id="form-unit"
              label="Unit Kerja Pelapor *"
              placeholder="Contoh: Sekretariat / Dinas A"
              value={formData.unit}
              onChange={(val) => updateField('unit', val)}
              status={errors.unit ? 'error' : 'neutral'}
              statusMessage={errors.unit}
              disabled={submitting || isUnitLocked}
              showClearButton={!isUnitLocked}
              required
            />
            {!isUnitLocked && (
              <div className="mt-2 space-y-1">
                <span className="text-xs text-slate-400 block">Pilih cepat unit:</span>
                <Chip
                  options={UNIT_SUGGESTIONS}
                  selected={formData.unit}
                  onSelect={(val) => updateField('unit', val)}
                  size="small"
                  variant="outline"
                />
              </div>
            )}
          </div>

          {/* Nilai / Estimasi Biaya Penanganan (Rupiah) */}
          <div>
            <TextField
              id="form-nilai"
              type="number"
              min="0"
              step="50000"
              label="Estimasi biaya penanganan (rupiah) *"
              placeholder="0"
              value={String(formData.nilai)}
              onChange={(val) => updateField('nilai', val)}
              status={errors.nilai ? 'error' : 'neutral'}
              statusMessage={errors.nilai}
              helperText="Nilai wajib 0 atau lebih (dalam Rupiah)"
              showClearButton={false}
              disabled={submitting}
              required
            />
          </div>
        </div>

        {/* Catatan Tambahan */}
        <div>
          <TextArea
            id="form-catatan"
            label="Catatan Penanganan / Keterangan"
            placeholder="Tuliskan rincian gejala gangguan, lokasi perangkat, atau tindak lanjut teknis..."
            value={formData.catatan}
            onChange={(val) => updateField('catatan', val)}
            status={errors.catatan ? 'error' : 'neutral'}
            statusMessage={errors.catatan}
            minRows={3}
            maxRows={6}
            maxLength={1000}
            showCharCount
            disabled={submitting}
          />
        </div>

        {/* Tombol Aksi Modal */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            hierarchy="secondary"
            size="md"
            onClick={onClose}
            disabled={submitting}
            prefixIcon={<IconX size={16} />}
          >
            Batal
          </Button>
          <Button
            type="submit"
            hierarchy="primary"
            size="md"
            disabled={submitting}
            prefixIcon={
              submitting ? (
                <Spinner size={16} color="inherit" spinnerOnly />
              ) : (
                <IconDeviceFloppy size={16} />
              )
            }
          >
            {submitting
              ? 'Menyimpan...'
              : isEditMode
                ? 'Simpan Perubahan'
                : 'Simpan Tiket Baru'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

