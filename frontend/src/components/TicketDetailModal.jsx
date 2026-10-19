/**
 * Komponen Modal Rincian 1 Tiket Gangguan TI
 * Menggunakan komponen resmi @idds/react: Modal, Badge, Divider, Button, CardPlain
 */
import React from 'react';
import { Modal, Badge, Divider, Button, CardPlain } from '@idds/react';
import {
  IconCalendar,
  IconBuilding,
  IconCash,
  IconNotes,
  IconEdit,
  IconX,
  IconHash,
} from '@tabler/icons-react';
import { formatRupiah, formatTanggalIndonesia } from '../services/api';
import { getKategoriBadgeProps, getStatusBadgeVariant } from './TicketTable';

export default function TicketDetailModal({ open, onClose, ticket, onEdit }) {
  if (!ticket) return null;

  const katBadge = getKategoriBadgeProps(ticket.kategori);
  const statusVariant = getStatusBadgeVariant(ticket.status);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Rincian Catatan Gangguan TI — ${ticket.kode}`}
      size="lg"
    >
      <div className="space-y-5 pt-1">
        {/* Header Status & Kode */}
        <CardPlain className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/80 border border-blue-200 px-2.5 py-0.5 rounded-md">
                {ticket.kode}
              </span>
              <Badge
                type="soft"
                variant={katBadge.variant}
                size="md"
                rounded="full"
                prefixIcon={katBadge.icon}
              >
                {ticket.kategori}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-2">{ticket.nama}</h3>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-slate-500 mb-1">Status Penanganan</span>
            <Badge type="soft" variant={statusVariant} size="lg" rounded="full">
              {ticket.status}
            </Badge>
          </div>
        </CardPlain>

        {/* Grid Informasi Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CardPlain className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <IconBuilding size={15} className="text-slate-400" />
              <span>Unit Kerja Pelapor</span>
            </div>
            <p className="text-sm font-bold text-slate-900 mt-1">{ticket.unit}</p>
          </CardPlain>

          <CardPlain className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <IconCalendar size={15} className="text-slate-400" />
              <span>Tanggal Laporan</span>
            </div>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {formatTanggalIndonesia(ticket.tanggal)}
            </p>
            <p className="text-xs font-mono text-slate-400">{ticket.tanggal}</p>
          </CardPlain>

          <CardPlain className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <IconCash size={15} className="text-slate-400" />
              <span>Estimasi Biaya Penanganan</span>
            </div>
            <p className="text-sm font-bold text-blue-700 mt-1">
              {formatRupiah(ticket.nilai)}
            </p>
          </CardPlain>
        </div>

        <Divider />

        {/* Catatan Tambahan */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            <IconNotes size={15} className="text-slate-400" />
            <span>Catatan &amp; Rincian Penanganan</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {ticket.catatan ? (
              ticket.catatan
            ) : (
              <span className="italic text-slate-400">
                Belum ada catatan tambahan pada tiket gangguan ini.
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span className="inline-flex items-center gap-1">
            <IconHash size={13} /> ID Sistem: {ticket.id}
          </span>
          <span>Dataset: 04-gangguan-ti</span>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button
            type="button"
            hierarchy="secondary"
            size="md"
            onClick={onClose}
            prefixIcon={<IconX size={16} />}
          >
            Tutup
          </Button>
          <Button
            type="button"
            hierarchy="primary"
            size="md"
            onClick={() => {
              onClose();
              onEdit(ticket);
            }}
            prefixIcon={<IconEdit size={16} />}
          >
            Ubah Tiket Ini
          </Button>
        </div>
      </div>
    </Modal>
  );
}

