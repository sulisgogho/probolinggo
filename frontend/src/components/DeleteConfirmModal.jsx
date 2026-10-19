/**
 * Komponen Modal Konfirmasi Hapus (Dialog)
 * Wajib ditampilkan sebelum menghapus data tiket secara permanen.
 * Menggunakan komponen resmi @idds/react: Modal, Alert, Button, Badge, Spinner, CardPlain
 */
import React, { useState } from 'react';
import { Modal, Alert, Button, Badge, Spinner, CardPlain } from '@idds/react';
import { IconTrash, IconX } from '@tabler/icons-react';
import { formatRupiah } from '../services/api';

export default function DeleteConfirmModal({ open, onClose, ticket, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  if (!ticket) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm(ticket.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !deleting && onClose()}
      title="Konfirmasi Hapus Catatan Gangguan TI"
      size="md"
      closeOnBackdrop={!deleting}
    >
      <div className="space-y-4 pt-1">
        <Alert
          variant="critical"
          title="Tindakan Permanen"
          message="Data tiket gangguan TI yang dihapus tidak dapat dikembalikan lagi."
        />

        <CardPlain className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kode Tiket</span>
            <Badge type="soft" variant="error" size="sm" rounded="full">
              {ticket.kode}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-slate-500">Nama Gangguan</span>
            <span className="font-semibold text-slate-900 text-right">{ticket.nama}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Unit Kerja</span>
            <span className="text-slate-700 font-medium">{ticket.unit}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Estimasi Biaya</span>
            <span className="text-slate-700 font-medium">{formatRupiah(ticket.nilai)}</span>
          </div>
        </CardPlain>

        <p className="text-sm text-slate-600">
          Apakah Anda yakin ingin menghapus catatan gangguan{' '}
          <strong className="text-slate-900">
            {ticket.kode} — {ticket.nama}
          </strong>
          ?
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button
            type="button"
            hierarchy="secondary"
            size="md"
            onClick={onClose}
            disabled={deleting}
            prefixIcon={<IconX size={16} />}
          >
            Batal
          </Button>
          <Button
            type="button"
            hierarchy="primary"
            size="md"
            onClick={handleConfirm}
            disabled={deleting}
            className="!bg-red-600 hover:!bg-red-700 !border-red-600"
            prefixIcon={
              deleting ? (
                <Spinner size={16} color="inherit" spinnerOnly />
              ) : (
                <IconTrash size={16} />
              )
            }
          >
            {deleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

