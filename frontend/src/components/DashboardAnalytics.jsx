/**
 * Komponen Analisis Gangguan TI untuk Dashboard (Mobile, Tablet, & Desktop)
 * Memfasilitasi Tim Analis dan Pengambil Keputusan untuk menganalisis data
 * berdasarkan urutan:
 * 1. Semua Dimensi
 * 2. Status Penanganan (Baru, Diproses, Selesai)
 * 3. Kategori Gangguan (Perangkat, Aplikasi, Koneksi)
 * 4. Unit Kerja Pelapor (Sekretariat, Dinas A, Dinas B, Unit Teknis)
 *
 * Menggunakan komponen resmi @idds/react: CardPlain, Badge, Button, Skeleton, Divider
 */
import React, { useState, useMemo } from 'react';
import { CardPlain, Badge, Button, Skeleton, Divider } from '@idds/react';
import {
  IconChartBar,
  IconBuilding,
  IconDevices,
  IconApps,
  IconWifi,
  IconChecklist,
  IconAlertCircle,
  IconLoader2,
  IconCircleCheck,
  IconCash,
  IconArrowRight,
  IconLayersIntersect,
  IconCalendar,
  IconEye,
  IconEdit,
} from '@tabler/icons-react';
import { formatRupiah, formatTanggalIndonesia } from '../services/api';
import { getKategoriBadgeProps, getStatusBadgeVariant } from './TicketTable';

export default function DashboardAnalytics({
  tickets,
  stats,
  loading,
  onOpenDetail,
  onOpenEdit,
  onGoToDaftar,
  onApplyFilterAndGoToDaftar,
}) {
  // Tab dimensi analisis aktif: 'semua' | 'status' | 'kategori' | 'unit'
  const [activeDimension, setActiveDimension] = useState('semua');

  // Daftar acuan unit kerja
  const unitList = ['Sekretariat', 'Dinas A', 'Dinas B', 'Unit Teknis'];

  // Total tiket dan biaya keseluruhan
  const totalCount = stats?.total ?? (Array.isArray(tickets) ? tickets.length : 0);
  const totalCost = stats?.total_nilai ?? useMemo(() => {
    return (Array.isArray(tickets) ? tickets : []).reduce(
      (acc, curr) => acc + Number(curr.nilai || 0),
      0
    );
  }, [tickets]);

  // Kalkulasi Analisis Berdasarkan STATUS PENANGANAN
  const statusAnalysis = useMemo(() => {
    const list = Array.isArray(tickets) ? tickets : [];
    const map = {
      Baru: {
        status: 'Baru',
        count: 0,
        cost: 0,
        unitCounts: {},
        kategoriCounts: {},
        badgeVariant: 'info',
        icon: <IconAlertCircle size={20} className="text-sky-600" />,
        iconBg: 'bg-sky-50 border-sky-200',
        barColor: 'bg-sky-500',
        subtitle: 'Menunggu tindak lanjut teknisi',
      },
      Diproses: {
        status: 'Diproses',
        count: 0,
        cost: 0,
        unitCounts: {},
        kategoriCounts: {},
        badgeVariant: 'warning',
        icon: <IconLoader2 size={20} className="text-amber-600" />,
        iconBg: 'bg-amber-50 border-amber-200',
        barColor: 'bg-amber-500',
        subtitle: 'Sedang dalam penanganan teknisi',
      },
      Selesai: {
        status: 'Selesai',
        count: 0,
        cost: 0,
        unitCounts: {},
        kategoriCounts: {},
        badgeVariant: 'success',
        icon: <IconCircleCheck size={20} className="text-emerald-600" />,
        iconBg: 'bg-emerald-50 border-emerald-200',
        barColor: 'bg-emerald-600',
        subtitle: 'Gangguan telah berhasil teratasi',
      },
    };

    list.forEach((t) => {
      if (map[t.status]) {
        map[t.status].count += 1;
        map[t.status].cost += Number(t.nilai || 0);
        map[t.status].unitCounts[t.unit] = (map[t.status].unitCounts[t.unit] || 0) + 1;
        map[t.status].kategoriCounts[t.kategori] = (map[t.status].kategoriCounts[t.kategori] || 0) + 1;
      }
    });

    const totalTickets = list.length || 1;
    const allCost = list.reduce((a, b) => a + Number(b.nilai || 0), 0) || 1;

    return Object.values(map).map((st) => {
      const pctTickets = Math.round((st.count / totalTickets) * 100);
      const pctCost = Math.round((st.cost / allCost) * 100);
      return {
        ...st,
        pctTickets,
        pctCost,
      };
    });
  }, [tickets]);

  // Kalkulasi Analisis Berdasarkan KATEGORI GANGGUAN
  const kategoriAnalysis = useMemo(() => {
    const list = Array.isArray(tickets) ? tickets : [];
    const map = {
      Perangkat: {
        name: 'Perangkat',
        count: 0,
        cost: 0,
        statusCounts: { Baru: 0, Diproses: 0, Selesai: 0 },
        unitCounts: {},
        icon: <IconDevices size={20} className="text-blue-600" />,
        bg: 'bg-blue-50 border-blue-200',
        barColor: 'bg-blue-600',
        badgeVariant: 'brand',
      },
      Aplikasi: {
        name: 'Aplikasi',
        count: 0,
        cost: 0,
        statusCounts: { Baru: 0, Diproses: 0, Selesai: 0 },
        unitCounts: {},
        icon: <IconApps size={20} className="text-sky-600" />,
        bg: 'bg-sky-50 border-sky-200',
        barColor: 'bg-sky-500',
        badgeVariant: 'info',
      },
      Koneksi: {
        name: 'Koneksi',
        count: 0,
        cost: 0,
        statusCounts: { Baru: 0, Diproses: 0, Selesai: 0 },
        unitCounts: {},
        icon: <IconWifi size={20} className="text-amber-600" />,
        bg: 'bg-amber-50 border-amber-200',
        barColor: 'bg-amber-500',
        badgeVariant: 'warning',
      },
    };

    list.forEach((t) => {
      if (map[t.kategori]) {
        map[t.kategori].count += 1;
        map[t.kategori].cost += Number(t.nilai || 0);
        if (map[t.kategori].statusCounts[t.status] !== undefined) {
          map[t.kategori].statusCounts[t.status] += 1;
        }
        map[t.kategori].unitCounts[t.unit] = (map[t.kategori].unitCounts[t.unit] || 0) + 1;
      }
    });

    const totalTickets = list.length || 1;
    const allCost = list.reduce((a, b) => a + Number(b.nilai || 0), 0) || 1;

    return Object.values(map).map((kat) => {
      const pctTickets = Math.round((kat.count / totalTickets) * 100);
      const pctCost = Math.round((kat.cost / allCost) * 100);
      const completionRate = kat.count > 0 ? Math.round((kat.statusCounts.Selesai / kat.count) * 100) : 0;
      const avgCost = kat.count > 0 ? Math.round(kat.cost / kat.count) : 0;

      // Unit yang paling sering melaporkan kategori ini
      let topUnit = '-';
      let maxUnitCount = -1;
      Object.entries(kat.unitCounts).forEach(([u, c]) => {
        if (c > maxUnitCount) {
          maxUnitCount = c;
          topUnit = u;
        }
      });

      return {
        ...kat,
        pctTickets,
        pctCost,
        completionRate,
        avgCost,
        topUnit,
      };
    });
  }, [tickets]);

  // Kalkulasi Analisis Berdasarkan UNIT KERJA
  const unitAnalysis = useMemo(() => {
    const list = Array.isArray(tickets) ? tickets : [];
    const map = {};
    unitList.forEach((u) => {
      map[u] = {
        unit: u,
        count: 0,
        cost: 0,
        statusCounts: { Baru: 0, Diproses: 0, Selesai: 0 },
        kategoriCounts: { Perangkat: 0, Aplikasi: 0, Koneksi: 0 },
      };
    });

    list.forEach((t) => {
      if (!map[t.unit]) {
        map[t.unit] = {
          unit: t.unit,
          count: 0,
          cost: 0,
          statusCounts: { Baru: 0, Diproses: 0, Selesai: 0 },
          kategoriCounts: { Perangkat: 0, Aplikasi: 0, Koneksi: 0 },
        };
      }
      map[t.unit].count += 1;
      map[t.unit].cost += Number(t.nilai || 0);
      if (map[t.unit].statusCounts[t.status] !== undefined) {
        map[t.unit].statusCounts[t.status] += 1;
      }
      if (map[t.unit].kategoriCounts[t.kategori] !== undefined) {
        map[t.unit].kategoriCounts[t.kategori] += 1;
      }
    });

    const totalTickets = list.length || 1;
    const allCost = list.reduce((a, b) => a + Number(b.nilai || 0), 0) || 1;

    return Object.values(map)
      .map((item) => {
        // Tentukan kategori dominan di unit ini
        let topKat = '-';
        let maxKatCount = -1;
        Object.entries(item.kategoriCounts).forEach(([k, c]) => {
          if (c > maxKatCount) {
            maxKatCount = c;
            topKat = k;
          }
        });

        const pctTickets = Math.round((item.count / totalTickets) * 100);
        const pctCost = Math.round((item.cost / allCost) * 100);
        const completionRate = item.count > 0 ? Math.round((item.statusCounts.Selesai / item.count) * 100) : 0;
        const avgCost = item.count > 0 ? Math.round(item.cost / item.count) : 0;

        return {
          ...item,
          pctTickets,
          pctCost,
          topKat,
          completionRate,
          avgCost: item.count > 0 ? Math.round(item.cost / item.count) : 0,
        };
      })
      .sort((a, b) => b.cost - a.cost);
  }, [tickets]);

  // 4 Catatan Gangguan Terbaru untuk referensi cepat
  const recentTickets = useMemo(() => {
    const list = Array.isArray(tickets) ? [...tickets] : [];
    return list
      .sort((a, b) => String(b.tanggal || '').localeCompare(String(a.tanggal || '')))
      .slice(0, 4);
  }, [tickets]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* =================================================================== */}
      {/* HEADER ANALISIS & PEMILIHAN DIMENSI INTERAKTIF                     */}
      {/* Urutan: Semua Dimensi -> Status -> Kategori -> Unit Kerja          */}
      {/* =================================================================== */}
      <CardPlain className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Analisis Distribusi Gangguan TI
              </h2>
              <Badge type="soft" variant="brand" size="sm" rounded="full">
                Analitik Multi-Dimensi
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-mono">
              {activeDimension === 'semua' && (
                <>
                  Menampilkan seluruh <strong className="text-slate-900">{totalCount} tiket</strong> (
                  <strong className="text-blue-700">{formatRupiah(totalCost)}</strong>) berdasarkan Status, Kategori, dan Unit Kerja
                </>
              )}
              {activeDimension === 'status' && (
                <>
                  Menampilkan analisis <strong className="text-slate-900">3 Status Penanganan</strong> (
                  <strong className="text-slate-900">{totalCount} tiket</strong> &bull;{' '}
                  <strong className="text-blue-700">{formatRupiah(totalCost)}</strong>)
                </>
              )}
              {activeDimension === 'kategori' && (
                <>
                  Menampilkan analisis <strong className="text-slate-900">3 Kategori Gangguan</strong> (
                  <strong className="text-slate-900">{totalCount} tiket</strong> &bull;{' '}
                  <strong className="text-blue-700">{formatRupiah(totalCost)}</strong>)
                </>
              )}
              {activeDimension === 'unit' && (
                <>
                  Menampilkan analisis <strong className="text-slate-900">4 Unit Kerja Pelapor</strong> (
                  <strong className="text-slate-900">{totalCount} tiket</strong> &bull;{' '}
                  <strong className="text-blue-700">{formatRupiah(totalCost)}</strong>)
                </>
              )}
            </p>
          </div>

          {/* Tab Pemilihan Dimensi: Semua Dimensi -> Status -> Kategori -> Unit Kerja (Pas di Layar Mobile Tanpa Geser) */}
          <div className="grid grid-cols-4 sm:flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setActiveDimension('semua')}
              className={`px-1 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${
                activeDimension === 'semua'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IconLayersIntersect size={14} className="shrink-0" />
              <span className="hidden sm:inline">Semua Dimensi</span>
              <span className="sm:hidden">Semua</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDimension('status')}
              className={`px-1 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${
                activeDimension === 'status'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IconChecklist size={14} className="shrink-0" />
              <span>Status</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDimension('kategori')}
              className={`px-1 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${
                activeDimension === 'kategori'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IconDevices size={14} className="shrink-0" />
              <span>Kategori</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDimension('unit')}
              className={`px-1 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1 ${
                activeDimension === 'unit'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IconBuilding size={14} className="shrink-0" />
              <span className="hidden sm:inline">Unit Kerja</span>
              <span className="sm:hidden">Unit</span>
            </button>
          </div>
        </div>
      </CardPlain>

      {/* =================================================================== */}
      {/* 1. ANALISIS BERDASARKAN STATUS PENANGANAN                           */}
      {/* =================================================================== */}
      {(activeDimension === 'semua' || activeDimension === 'status') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                <IconChecklist size={18} className="text-blue-600 shrink-0" />
                <span>Analisis Berdasarkan Status</span>
              </h3>
              <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
                Pelacakan efisiensi siklus penanganan tiket (Baru &rarr; Diproses &rarr; Selesai) dan potensi penumpukan insiden.
              </p>
            </div>
            {activeDimension !== 'status' && (
              <button
                type="button"
                onClick={() => setActiveDimension('status')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
              >
                Fokus Status <IconArrowRight size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {statusAnalysis.map((st) => (
              <CardPlain
                key={st.status}
                className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between gap-3 hover:border-blue-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${st.iconBg}`}>
                        {st.icon}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{st.status}</h4>
                        <p className="text-xs text-slate-500">{st.count} Tiket ({st.pctTickets}%)</p>
                      </div>
                    </div>
                    <Badge type="soft" variant={st.badgeVariant} size="md" rounded="full">
                      {st.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600">{st.subtitle}</p>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Alokasi Biaya:</span>
                    <span className="font-bold text-slate-900">{formatRupiah(st.cost)}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Rasio Tiket</span>
                      <span className="font-semibold text-slate-700">{st.pctTickets}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${st.barColor}`}
                        style={{ width: `${st.pctTickets}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <Button
                    type="button"
                    hierarchy="secondary"
                    size="sm"
                    onClick={() => onApplyFilterAndGoToDaftar?.({ status: st.status })}
                    suffixIcon={<IconArrowRight size={13} />}
                  >
                    Buka Tiket {st.status}
                  </Button>
                </div>
              </CardPlain>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. ANALISIS BERDASARKAN KATEGORI GANGGUAN                           */}
      {/* =================================================================== */}
      {(activeDimension === 'semua' || activeDimension === 'kategori') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                <IconDevices size={18} className="text-blue-600 shrink-0" />
                <span>Analisis Berdasarkan Kategori</span>
              </h3>
              <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
                Pemeriksaan distribusi insiden antara Perangkat Keras, Aplikasi Layanan, dan Jaringan Koneksi.
              </p>
            </div>
            {activeDimension !== 'kategori' && (
              <button
                type="button"
                onClick={() => setActiveDimension('kategori')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
              >
                Fokus Kategori <IconArrowRight size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            {kategoriAnalysis.map((kat) => (
              <CardPlain
                key={kat.name}
                className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between gap-3 hover:border-blue-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${kat.bg}`}>
                        {kat.icon}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{kat.name}</h4>
                        <p className="text-xs text-slate-500">{kat.count} Tiket Tercatat</p>
                      </div>
                    </div>
                    <Badge type="soft" variant={kat.badgeVariant} size="md" rounded="full">
                      {kat.pctTickets}% Total
                    </Badge>
                  </div>

                  {/* Metrik Biaya & SLA */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Total Biaya:</span>
                      <span className="font-bold text-slate-900">{formatRupiah(kat.cost)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Rata-rata/Tiket:</span>
                      <span className="font-semibold text-slate-800">{formatRupiah(kat.avgCost)}</span>
                    </div>
                  </div>

                  {/* Proporsi Beban Anggaran */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Porsi Anggaran Penanganan</span>
                      <span className="font-semibold text-slate-700">{kat.pctCost}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${kat.barColor}`}
                        style={{ width: `${kat.pctCost}%` }}
                      />
                    </div>
                  </div>

                  {/* Sebaran Status per Kategori */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-600">
                    <span>Pelapor Terbanyak:</span>
                    <strong className="text-slate-900">{kat.topUnit}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <Button
                    type="button"
                    hierarchy="secondary"
                    size="sm"
                    onClick={() => onApplyFilterAndGoToDaftar?.({ kategori: kat.name })}
                    suffixIcon={<IconArrowRight size={13} />}
                  >
                    Buka Tiket {kat.name}
                  </Button>
                </div>
              </CardPlain>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. ANALISIS BERDASARKAN UNIT KERJA                                 */}
      {/* =================================================================== */}
      {(activeDimension === 'semua' || activeDimension === 'unit') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                <IconBuilding size={18} className="text-blue-600 shrink-0" />
                <span>Analisis Berdasarkan Unit Kerja</span>
              </h3>
              <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
                Perbandingan volume insiden, estimasi biaya penanganan, dan kategori masalah dominan per unit kerja.
              </p>
            </div>
            {activeDimension !== 'unit' && (
              <button
                type="button"
                onClick={() => setActiveDimension('unit')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
              >
                Fokus Unit <IconArrowRight size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
            {unitAnalysis.map((item) => (
              <CardPlain
                key={item.unit}
                className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between gap-3 hover:border-blue-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{item.unit}</h4>
                      <p className="text-xs text-slate-500">{item.count} Laporan Gangguan</p>
                    </div>
                    <Badge type="soft" variant="brand" size="sm" rounded="full">
                      {item.pctTickets}% Tiket
                    </Badge>
                  </div>

                  {/* Metrik Biaya */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Estimasi Biaya:</span>
                      <span className="font-bold text-blue-700">{formatRupiah(item.cost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Rata-rata/Insiden:</span>
                      <span className="font-semibold text-slate-700">{formatRupiah(item.avgCost)}</span>
                    </div>
                  </div>

                  {/* Progress Bar Penyelesaian */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Penyelesaian ({item.completionRate}%)</span>
                      <span>{item.statusCounts.Selesai} dari {item.count} selesai</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${item.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Rincian Status Tiket */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] pt-1">
                    <div className="p-1 rounded bg-sky-50 border border-sky-100">
                      <span className="text-sky-700 font-bold block">{item.statusCounts.Baru}</span>
                      <span className="text-slate-500 text-[10px]">Baru</span>
                    </div>
                    <div className="p-1 rounded bg-amber-50 border border-amber-100">
                      <span className="text-amber-700 font-bold block">{item.statusCounts.Diproses}</span>
                      <span className="text-slate-500 text-[10px]">Diproses</span>
                    </div>
                    <div className="p-1 rounded bg-emerald-50 border border-emerald-100">
                      <span className="text-emerald-700 font-bold block">{item.statusCounts.Selesai}</span>
                      <span className="text-slate-500 text-[10px]">Selesai</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Masalah dominan: <strong className="text-slate-700">{item.topKat}</strong>
                  </span>
                  <Button
                    type="button"
                    hierarchy="secondary"
                    size="sm"
                    onClick={() => onApplyFilterAndGoToDaftar?.({ unit: item.unit })}
                    suffixIcon={<IconArrowRight size={13} />}
                  >
                    Rincian
                  </Button>
                </div>
              </CardPlain>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. MATRIKS TABULASI SILANG: UNIT X KATEGORI X BIAYA                */}
      {/* =================================================================== */}
      {(activeDimension === 'semua' || activeDimension === 'unit') && (
        <CardPlain className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                <IconChartBar size={18} className="text-blue-600 shrink-0" />
                <span className="sm:hidden">Matriks Unit Kerja</span>
                <span className="hidden sm:inline">Matriks Tabulasi Analisis Unit Kerja</span>
              </h3>
              <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
                Rincian sebaran kategori insiden dan akumulasi estimasi biaya untuk setiap unit kerja pelapor.
              </p>
            </div>
            <Button
              type="button"
              hierarchy="secondary"
              size="sm"
              onClick={onGoToDaftar}
              suffixIcon={<IconArrowRight size={14} />}
              className="shrink-0 text-xs"
            >
              <span className="sm:hidden">Tabel</span>
              <span className="hidden sm:inline">Lihat Tabel Lengkap</span>
            </Button>
          </div>

          {/* Tampilan Desktop & Tablet Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Unit Kerja</th>
                  <th className="py-3 px-3 text-center">Perangkat</th>
                  <th className="py-3 px-3 text-center">Aplikasi</th>
                  <th className="py-3 px-3 text-center">Koneksi</th>
                  <th className="py-3 px-3 text-center">Total Tiket</th>
                  <th className="py-3 px-4 text-right">Estimasi Biaya</th>
                  <th className="py-3 px-4 text-center">Status Penyelesaian</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unitAnalysis.map((u) => (
                  <tr key={u.unit} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{u.unit}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700">{u.kategoriCounts.Perangkat}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700">{u.kategoriCounts.Aplikasi}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700">{u.kategoriCounts.Koneksi}</td>
                    <td className="py-3 px-3 text-center">
                      <Badge type="soft" variant="neutral" size="sm" rounded="full">
                        {u.count} Tiket
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-700 font-mono">
                      {formatRupiah(u.cost)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${u.completionRate}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700 text-[11px]">{u.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        type="button"
                        hierarchy="secondary"
                        size="sm"
                        onClick={() => onApplyFilterAndGoToDaftar?.({ unit: u.unit })}
                        prefixIcon={<IconEye size={13} />}
                      >
                        Buka
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tampilan Mobile Card Matrix */}
          <div className="block md:hidden p-4 space-y-3 bg-slate-50/60">
            {unitAnalysis.map((u) => (
              <CardPlain key={u.unit} className="bg-white rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{u.unit}</span>
                  <span className="font-bold text-blue-700">{formatRupiah(u.cost)}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center text-[11px] pt-1 border-t border-slate-100">
                  <div className="p-1 rounded bg-slate-50">
                    <span className="text-slate-500 block text-[10px]">Perangkat</span>
                    <span className="font-bold text-slate-800">{u.kategoriCounts.Perangkat}</span>
                  </div>
                  <div className="p-1 rounded bg-slate-50">
                    <span className="text-slate-500 block text-[10px]">Aplikasi</span>
                    <span className="font-bold text-slate-800">{u.kategoriCounts.Aplikasi}</span>
                  </div>
                  <div className="p-1 rounded bg-slate-50">
                    <span className="text-slate-500 block text-[10px]">Koneksi</span>
                    <span className="font-bold text-slate-800">{u.kategoriCounts.Koneksi}</span>
                  </div>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Penyelesaian: {u.completionRate}%</span>
                  <Button
                    type="button"
                    hierarchy="secondary"
                    size="sm"
                    onClick={() => onApplyFilterAndGoToDaftar?.({ unit: u.unit })}
                    prefixIcon={<IconEye size={12} />}
                  >
                    Lihat Tiket
                  </Button>
                </div>
              </CardPlain>
            ))}
          </div>
        </CardPlain>
      )}

      {/* =================================================================== */}
      {/* 5. DAFTAR RINGKAS CATATAN GANGGUAN TERBARU                         */}
      {/* =================================================================== */}
      <CardPlain className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between gap-2 border-b border-slate-200">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-lg font-bold text-slate-900">
                Catatan Gangguan Terbaru
              </h3>
              <Badge type="soft" variant="success" size="sm" rounded="full">
                Selesai: {stats?.selesai ?? 0} dari {stats?.total ?? 0}
              </Badge>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
              Tiket insiden terakhir yang dilaporkan lintas unit kerja.
            </p>
          </div>

          <Button
            type="button"
            hierarchy="secondary"
            size="sm"
            onClick={onGoToDaftar}
            suffixIcon={<IconArrowRight size={15} />}
            className="shrink-0 text-xs"
          >
            Semua ({stats?.total ?? 0})
          </Button>
        </div>

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
