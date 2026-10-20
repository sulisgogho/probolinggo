/**
 * Komponen Ringkasan Dashboard (Khusus Halaman Menu "Dashboard" di Mobile & Tablet)
 * Memisahkan halaman Dashboard dari halaman Daftar Catatan agar tampilan mobile & tablet
 * fokus dan nyaman dilihat.
 *
 * Menggunakan komponen resmi @idds/react: CardPlain, Badge, Button, Skeleton, Divider
 */
import React, { useMemo } from 'react';
import { CardPlain, Badge, Button, Skeleton, Divider } from '@idds/react';
import {
  IconDevices,
  IconApps,
  IconWifi,
  IconArrowRight,
  IconBuilding,
  IconCalendar,
  IconEye,
  IconEdit,
} from '@tabler/icons-react';
import { formatRupiah, formatTanggalIndonesia } from '../services/api';
import { getKategoriBadgeProps, getStatusBadgeVariant } from './TicketTable';

export default function DashboardOverview({
  tickets,
  stats,
  loading,
  onOpenDetail,
  onOpenEdit,
  onGoToDaftar,
  onSelectKategoriFilter,
}) {
  // Hitung distribusi kategori dari daftar tiket
  const kategoriStats = useMemo(() => {
    const list = Array.isArray(tickets) ? tickets : [];
    const counts = { Perangkat: 0, Aplikasi: 0, Koneksi: 0 };
    for (const t of list) {
      if (counts[t.kategori] !== undefined) {
        counts[t.kategori] += 1;
      }
    }
    const total = list.length || 1;
    return [
      {
        name: 'Perangkat',
        count: counts.Perangkat,
        pct: Math.round((counts.Perangkat / total) * 100),
        icon: <IconDevices size={18} className="text-blue-600" />,
        bg: 'bg-blue-50 border-blue-100',
        barColor: 'bg-blue-600',
        badgeVariant: 'brand',
      },
      {
        name: 'Aplikasi',
        count: counts.Aplikasi,
        pct: Math.round((counts.Aplikasi / total) * 100),
        icon: <IconApps size={18} className="text-sky-600" />,
        bg: 'bg-sky-50 border-sky-100',
        barColor: 'bg-sky-500',
        badgeVariant: 'info',
      },
      {
        name: 'Koneksi',
        count: counts.Koneksi,
        pct: Math.round((counts.Koneksi / total) * 100),
        icon: <IconWifi size={18} className="text-amber-600" />,
        bg: 'bg-amber-50 border-amber-100',
        barColor: 'bg-amber-500',
        badgeVariant: 'warning',
      },
    ];
  }, [tickets]);

  const completionRate = useMemo(() => {
    const total = Number(stats?.total || 0);
    const selesai = Number(stats?.selesai || 0);
    if (!total) return 0;
    return Math.round((selesai / total) * 100);
  }, [stats]);

  const recentTickets = useMemo(() => {
    const list = Array.isArray(tickets) ? [...tickets] : [];
    return list
      .sort((a, b) => String(b.tanggal || '').localeCompare(String(a.tanggal || '')))
      .slice(0, 4);
  }, [tickets]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Grid 3 Kolom di Tablet: Distribusi Kategori & Progres Penyelesaian */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kategoriStats.map((kat) => (
          <CardPlain
            key={kat.name}
            className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all cursor-pointer"
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => onSelectKategoriFilter?.(kat.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectKategoriFilter?.(kat.name);
                }
              }}
              className="space-y-3 outline-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center ${kat.bg}`}
                  >
                    {kat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Kategori {kat.name}
                    </h3>
                    <p className="text-xs text-slate-500">Ketuk untuk filter daftar</p>
                  </div>
                </div>
                <Badge type="soft" variant={kat.badgeVariant} size="md" rounded="full">
                  {loading ? '...' : `${kat.count} Tiket`}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Proporsi Gangguan</span>
                  <span className="font-semibold text-slate-700">{kat.pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${kat.barColor}`}
                    style={{ width: `${kat.pct}%` }}
                  />
                </div>
              </div>
            </div>
          </CardPlain>
        ))}
      </div>

      {/* Daftar Ringkas Catatan Gangguan Terbaru */}
      <CardPlain className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between gap-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Catatan Gangguan Terbaru
              </h3>
              <Badge type="soft" variant="success" size="sm" rounded="full">
                {completionRate}% Selesai
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ringkasan tiket terbaru — buka menu Daftar untuk pencarian &amp; pengelolaan lengkap
            </p>
          </div>

          <Button
            type="button"
            hierarchy="secondary"
            size="sm"
            onClick={onGoToDaftar}
            suffixIcon={<IconArrowRight size={15} />}
          >
            Semua ({stats?.total ?? 0})
          </Button>
        </div>

        <Divider />

        <div className="p-4 bg-slate-50/60">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <CardPlain
                  key={i}
                  className="bg-white rounded-xl p-4 border border-slate-200 space-y-2.5"
                >
                  <Skeleton height="20px" width="45%" rounded="md" />
                  <Skeleton height="22px" width="85%" rounded="sm" />
                  <Skeleton height="32px" width="100%" rounded="md" />
                </CardPlain>
              ))}
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              Belum ada catatan gangguan TI yang tercatat.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {recentTickets.map((ticket) => {
                const katBadge = getKategoriBadgeProps(ticket.kategori);
                const statusVariant = getStatusBadgeVariant(ticket.status);

                return (
                  <CardPlain
                    key={`recent-${ticket.id}`}
                    className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                            {ticket.kode}
                          </span>
                          <Badge
                            type="soft"
                            variant={katBadge.variant}
                            size="sm"
                            rounded="full"
                            prefixIcon={katBadge.icon}
                          >
                            {ticket.kategori}
                          </Badge>
                        </div>
                        <Badge type="soft" variant={statusVariant} size="sm" rounded="full">
                          {ticket.status}
                        </Badge>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                        {ticket.nama}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <IconBuilding size={13} className="text-slate-400" />
                          {ticket.unit}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <IconCalendar size={13} className="text-slate-400" />
                          {formatTanggalIndonesia(ticket.tanggal)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {formatRupiah(ticket.nilai)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          hierarchy="secondary"
                          size="sm"
                          onClick={() => onOpenDetail(ticket)}
                          prefixIcon={<IconEye size={14} />}
                        >
                          Detail
                        </Button>
                        <Button
                          type="button"
                          hierarchy="secondary"
                          size="sm"
                          onClick={() => onOpenEdit(ticket)}
                          prefixIcon={<IconEdit size={14} />}
                        >
                          Ubah
                        </Button>
                      </div>
                    </div>
                  </CardPlain>
                );
              })}
            </div>
          )}
        </div>
      </CardPlain>
    </div>
  );
}

