/**
 * Komponen Kartu Ringkasan Statistik Dashboard
 * Pada mobile menggunakan grid 2 kolom yang ringkas dan nyaman dilihat,
 * sedangkan pada desktop menggunakan 5 kolom penuh (Full-Width).
 */
import React from 'react';
import { CardPlain, Badge, Skeleton } from '@idds/react';
import {
  IconTicket,
  IconAlertCircle,
  IconLoader2,
  IconCircleCheck,
  IconCash,
} from '@tabler/icons-react';
import { formatRupiah } from '../services/api';

export default function StatsCards({ stats, loading, onQuickStatusFilter, activeStatusFilter }) {
  const cards = [
    {
      id: 'Semua',
      title: 'Total Gangguan',
      value: stats?.total ?? 0,
      subtitle: 'Seluruh tiket tercatat',
      badgeText: 'Semua',
      badgeVariant: 'brand',
      icon: <IconTicket size={20} className="text-blue-600" />,
      iconBg: 'bg-blue-50 border-blue-100',
      interactive: true,
      colSpan: 'col-span-1',
    },
    {
      id: 'Baru',
      title: 'Status Baru',
      value: stats?.baru ?? 0,
      subtitle: 'Menunggu tindak lanjut',
      badgeText: 'Baru',
      badgeVariant: 'info',
      icon: <IconAlertCircle size={20} className="text-sky-600" />,
      iconBg: 'bg-sky-50 border-sky-100',
      interactive: true,
      colSpan: 'col-span-1',
    },
    {
      id: 'Diproses',
      title: 'Sedang Diproses',
      value: stats?.diproses ?? 0,
      subtitle: 'Dalam penanganan teknisi',
      badgeText: 'Diproses',
      badgeVariant: 'warning',
      icon: <IconLoader2 size={20} className="text-amber-600" />,
      iconBg: 'bg-amber-50 border-amber-100',
      interactive: true,
      colSpan: 'col-span-1',
    },
    {
      id: 'Selesai',
      title: 'Selesai Ditangani',
      value: stats?.selesai ?? 0,
      subtitle: 'Gangguan telah teratasi',
      badgeText: 'Selesai',
      badgeVariant: 'success',
      icon: <IconCircleCheck size={20} className="text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-100',
      interactive: true,
      colSpan: 'col-span-1',
    },
    {
      id: 'biaya',
      title: 'Estimasi Biaya Penanganan',
      value: formatRupiah(stats?.total_nilai ?? 0),
      subtitle: 'Akumulasi estimasi biaya penanganan (rupiah)',
      badgeText: 'Total Biaya',
      badgeVariant: 'neutral',
      icon: <IconCash size={20} className="text-indigo-600" />,
      iconBg: 'bg-indigo-50 border-indigo-100',
      interactive: false,
      colSpan: 'col-span-2 md:col-span-2 xl:col-span-1',
    },
  ];

  return (
    <section
      aria-label="Ringkasan Statistik Catatan Gangguan TI"
      className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4"
    >
      {cards.map((item) => {
        const isActive = item.interactive && activeStatusFilter === item.id;
        return (
          <CardPlain
            key={item.id}
            className={`${item.colSpan} bg-white rounded-xl p-3.5 sm:p-5 border transition-all duration-200 shadow-xs ${
              item.interactive ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]' : ''
            } ${
              isActive
                ? 'border-blue-600 ring-2 ring-blue-600/15'
                : 'border-slate-200/90 hover:border-slate-300'
            }`}
          >
            <div
              role={item.interactive ? 'button' : undefined}
              tabIndex={item.interactive ? 0 : undefined}
              onClick={() => item.interactive && onQuickStatusFilter?.(item.id)}
              onKeyDown={(e) => {
                if (item.interactive && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onQuickStatusFilter?.(item.id);
                }
              }}
              className="flex flex-col justify-between h-full gap-2.5 sm:gap-3 outline-none"
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 ${item.iconBg}`}
                >
                  {item.icon}
                </div>
                <Badge type="soft" variant={item.badgeVariant} size="sm" rounded="full">
                  {item.badgeText}
                </Badge>
              </div>

              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider line-clamp-1">
                  {item.title}
                </p>
                {loading ? (
                  <div className="mt-1.5">
                    <Skeleton height="24px" width="75%" rounded="md" />
                  </div>
                ) : (
                  <p className="text-lg sm:text-xl xl:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1 tracking-tight break-words">
                    {item.value}
                  </p>
                )}
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {item.subtitle}
                </p>
              </div>
            </div>
          </CardPlain>
        );
      })}
    </section>
  );
}
