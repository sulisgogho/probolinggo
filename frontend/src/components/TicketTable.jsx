/**
 * Komponen Daftar Catatan Gangguan TI (Responsif: Card View di Mobile & Full-Width Table di Desktop)
 * Menggunakan komponen resmi @idds/react:
 * InputSearch, SelectDropdown, Button, Badge, Pagination, Skeleton, CardPlain
 */
import React, { useMemo, useState, useEffect } from 'react';
import {
  InputSearch,
  SelectDropdown,
  Button,
  Badge,
  Pagination,
  Skeleton,
  CardPlain,
} from '@idds/react';
import {
  IconPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconFilterOff,
  IconInboxOff,
  IconDevices,
  IconApps,
  IconWifi,
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
  IconBuilding,
  IconCalendar,
  IconCash,
} from '@tabler/icons-react';
import { formatRupiah, formatTanggalIndonesia } from '../services/api';

const KATEGORI_OPTIONS = [
  { label: 'Semua Kategori', value: 'Semua' },
  { label: 'Perangkat', value: 'Perangkat' },
  { label: 'Aplikasi', value: 'Aplikasi' },
  { label: 'Koneksi', value: 'Koneksi' },
];

const STATUS_OPTIONS = [
  { label: 'Semua Status', value: 'Semua' },
  { label: 'Baru', value: 'Baru' },
  { label: 'Diproses', value: 'Diproses' },
  { label: 'Selesai', value: 'Selesai' },
];

export function getStatusBadgeVariant(status) {
  switch (status) {
    case 'Baru':
      return 'info';
    case 'Diproses':
      return 'warning';
    case 'Selesai':
      return 'success';
    default:
      return 'neutral';
  }
}

export function getKategoriBadgeProps(kategori) {
  switch (kategori) {
    case 'Perangkat':
      return {
        variant: 'brand',
        icon: <IconDevices size={13} />,
      };
    case 'Aplikasi':
      return {
        variant: 'info',
        icon: <IconApps size={13} />,
      };
    case 'Koneksi':
      return {
        variant: 'warning',
        icon: <IconWifi size={13} />,
      };
    default:
      return {
        variant: 'neutral',
        icon: null,
      };
  }
}

export default function TicketTable({
  tickets,
  loading,
  searchQuery,
  onSearchChange,
  selectedKategori,
  onKategoriChange,
  selectedStatus,
  onStatusChange,
  onResetFilter,
  onOpenCreate,
  onOpenDetail,
  onOpenEdit,
  onOpenDelete,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'kode', direction: 'asc' });

  // Reset halaman ke 1 saat filter atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedKategori, selectedStatus]);

  // Pengurutan data di sisi klien
  const sortedTickets = useMemo(() => {
    const list = Array.isArray(tickets) ? [...tickets] : [];
    if (!sortConfig.key) return list;

    return list.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (sortConfig.key === 'nilai') {
        const diff = Number(valA || 0) - Number(valB || 0);
        return sortConfig.direction === 'asc' ? diff : -diff;
      }

      const strA = String(valA ?? '').toLowerCase();
      const strB = String(valB ?? '').toLowerCase();
      const cmp = strA.localeCompare(strB, 'id', { numeric: true });
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [tickets, sortConfig]);

  const totalItems = sortedTickets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedTickets = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    return sortedTickets.slice(startIdx, startIdx + pageSize);
  }, [sortedTickets, currentPage, pageSize, totalPages]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <IconArrowsSort size={14} className="text-slate-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <IconSortAscending size={14} className="text-blue-600" />
    ) : (
      <IconSortDescending size={14} className="text-blue-600" />
    );
  };

  const hasActiveFilter =
    Boolean(searchQuery?.trim()) ||
    (selectedKategori && selectedKategori !== 'Semua') ||
    (selectedStatus && selectedStatus !== 'Semua');

  return (
    <section
      aria-label="Daftar Data Catatan Gangguan TI"
      className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden"
    >
      {/* Header Tabel & Baris Pencarian/Filter */}
      <div className="p-4 sm:p-6 border-b border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Daftar Catatan Gangguan TI
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Menampilkan {loading ? '...' : totalItems} tiket gangguan berdasarkan filter aktif
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <Button
              hierarchy="primary"
              size="md"
              onClick={onOpenCreate}
              prefixIcon={<IconPlus size={18} />}
              className="w-full sm:w-auto justify-center"
            >
              Tambah Tiket Gangguan
            </Button>
          </div>
        </div>

        {/* Baris Filter & Pencarian Menggunakan Komponen IDDS (Nyaman di Mobile, Tablet, & Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 sm:gap-3.5 items-end pt-1">
          <div className="sm:col-span-2 md:col-span-12 xl:col-span-5">
            <label
              htmlFor="search-ticket-input"
              className="block text-xs font-semibold text-slate-600 mb-1.5"
            >
              Pencarian Cepat
            </label>
            <InputSearch
              value={searchQuery}
              onChange={(val) => onSearchChange(typeof val === 'string' ? val : val?.target?.value ?? '')}
              placeholder="Cari kode (IT4-001), nama gangguan, unit..."
              debounce={200}
              className="w-full"
            />
          </div>

          <div className="sm:col-span-1 md:col-span-5 xl:col-span-3">
            <SelectDropdown
              label="Filter Kategori"
              options={KATEGORI_OPTIONS}
              selected={selectedKategori}
              onSelect={(val) => onKategoriChange(val || 'Semua')}
              placeholder="Semua Kategori"
              searchable={false}
              showPreviewValue={false}
              size="md"
              width="100%"
            />
          </div>

          <div className="sm:col-span-1 md:col-span-5 xl:col-span-3">
            <SelectDropdown
              label="Filter Status"
              options={STATUS_OPTIONS}
              selected={selectedStatus}
              onSelect={(val) => onStatusChange(val || 'Semua')}
              placeholder="Semua Status"
              searchable={false}
              showPreviewValue={false}
              size="md"
              width="100%"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-2 xl:col-span-1 flex justify-end">
            <Button
              hierarchy="secondary"
              size="md"
              onClick={onResetFilter}
              disabled={!hasActiveFilter}
              className="w-full justify-center"
              title="Atur ulang pencarian dan filter"
              aria-label="Atur ulang pencarian dan filter"
              prefixIcon={<IconFilterOff size={16} />}
            >
              <span className="xl:sr-only">Reset</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAMPILAN MOBILE (1 KOLOM) & TABLET (2 KOLOM): CARD GRID NYAMAN        */}
      {/* ===================================================================== */}
      <div className="block xl:hidden p-4 sm:p-5 bg-slate-50/60">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <CardPlain
                key={`mobile-skeleton-${idx}`}
                className="bg-white rounded-xl p-4 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton height="22px" width="80px" rounded="md" />
                  <Skeleton height="22px" width="75px" rounded="full" />
                </div>
                <Skeleton height="20px" width="85%" rounded="sm" />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Skeleton height="36px" width="100%" rounded="md" />
                  <Skeleton height="36px" width="100%" rounded="md" />
                </div>
                <Skeleton height="34px" width="100%" rounded="md" />
              </CardPlain>
            ))}
          </div>
        ) : paginatedTickets.length === 0 ? (
          <div className="py-12 px-4 text-center bg-white rounded-xl border border-slate-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
              <IconInboxOff size={28} stroke={1.5} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Tidak Ada Catatan Gangguan TI
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 max-w-xs mx-auto">
              {hasActiveFilter
                ? 'Tidak ada tiket yang cocok dengan pencarian atau filter Anda.'
                : 'Belum ada data catatan gangguan TI yang tersimpan.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {hasActiveFilter && (
                <Button
                  hierarchy="secondary"
                  size="sm"
                  onClick={onResetFilter}
                  prefixIcon={<IconFilterOff size={15} />}
                >
                  Reset Filter
                </Button>
              )}
              <Button
                hierarchy="primary"
                size="sm"
                onClick={onOpenCreate}
                prefixIcon={<IconPlus size={15} />}
              >
                Tambah Tiket
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {paginatedTickets.map((ticket) => {
              const katBadge = getKategoriBadgeProps(ticket.kategori);
              const statusVariant = getStatusBadgeVariant(ticket.status);

              return (
                <CardPlain
                  key={`mobile-card-${ticket.id}`}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between gap-3"
                >
                  <div className="space-y-3">
                    {/* Baris Atas Card: Kode Tiket, Kategori, & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(ticket)}
                          className="font-mono text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-2.5 py-1 rounded-md transition-colors"
                        >
                          {ticket.kode}
                        </button>
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

                    {/* Judul / Nama Gangguan */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {ticket.nama}
                      </h3>
                      {ticket.catatan && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {ticket.catatan}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Kotak Rincian Unit, Tanggal, dan Estimasi Biaya */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <IconBuilding size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate font-medium">{ticket.unit}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700 justify-end">
                        <IconCalendar size={14} className="text-slate-400 shrink-0" />
                        <span>{formatTanggalIndonesia(ticket.tanggal)}</span>
                      </div>
                      <div className="col-span-2 pt-1.5 border-t border-slate-200/70 flex items-center justify-between">
                        <span className="text-slate-500 inline-flex items-center gap-1">
                          <IconCash size={14} className="text-slate-400" />
                          Estimasi Biaya:
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatRupiah(ticket.nilai)}
                        </span>
                      </div>
                    </div>

                    {/* Tombol Aksi Mobile & Tablet yang Nyaman Disentuh */}
                    <div className="grid grid-cols-3 gap-2 pt-0.5">
                      <Button
                        hierarchy="secondary"
                        size="sm"
                        onClick={() => onOpenDetail(ticket)}
                        prefixIcon={<IconEye size={15} />}
                        className="w-full justify-center"
                      >
                        Detail
                      </Button>
                      <Button
                        hierarchy="secondary"
                        size="sm"
                        onClick={() => onOpenEdit(ticket)}
                        prefixIcon={<IconEdit size={15} />}
                        className="w-full justify-center"
                      >
                        Ubah
                      </Button>
                      <Button
                        hierarchy="secondary"
                        size="sm"
                        onClick={() => onOpenDelete(ticket)}
                        prefixIcon={<IconTrash size={15} className="text-red-600" />}
                        className="w-full justify-center !border-red-200 !text-red-700 hover:!bg-red-50"
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                </CardPlain>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* TAMPILAN DESKTOP LEBAR (XL): FULL-WIDTH TABLE                         */}
      {/* ===================================================================== */}
      <div className="hidden xl:block overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => handleSort('kode')}
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 focus:outline-none"
                >
                  <span>Kode</span>
                  {renderSortIcon('kode')}
                </button>
              </th>
              <th className="py-3.5 px-4 whitespace-nowrap min-w-[220px]">
                <button
                  type="button"
                  onClick={() => handleSort('nama')}
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 focus:outline-none"
                >
                  <span>Nama Gangguan TI</span>
                  {renderSortIcon('nama')}
                </button>
              </th>
              <th className="py-3.5 px-4 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => handleSort('kategori')}
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 focus:outline-none"
                >
                  <span>Kategori</span>
                  {renderSortIcon('kategori')}
                </button>
              </th>
              <th className="py-3.5 px-4 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => handleSort('unit')}
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 focus:outline-none"
                >
                  <span>Unit Kerja</span>
                  {renderSortIcon('unit')}
                </button>
              </th>
              <th className="py-3.5 px-4 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => handleSort('tanggal')}
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 focus:outline-none"
                >
                  <span>Tanggal</span>
                  {renderSortIcon('tanggal')}
                </button>
              </th>
              <th className="py-3.5 px-4 whitespace-nowrap text-right">
                <button
                  type="button"
                  onClick={() => handleSort('nilai')}
                  className="inline-flex items-center justify-end gap-1.5 hover:text-slate-900 focus:outline-none ml-auto"
                >
                  <span>Estimasi Biaya (Rp)</span>
                  {renderSortIcon('nilai')}
                </button>
              </th>
              <th className="py-3.5 px-4 whitespace-nowrap text-center">
                <button
                  type="button"
                  onClick={() => handleSort('status')}
                  className="inline-flex items-center justify-center gap-1.5 hover:text-slate-900 focus:outline-none"
                >
                  <span>Status</span>
                  {renderSortIcon('status')}
                </button>
              </th>
              <th className="py-3.5 px-4 min-w-[200px]">Catatan</th>
              <th className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 text-sm">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="bg-white">
                  <td className="py-4 px-4 sm:px-6">
                    <Skeleton height="20px" width="80px" rounded="sm" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton height="20px" width="190px" rounded="sm" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton height="24px" width="95px" rounded="full" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton height="20px" width="110px" rounded="sm" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton height="20px" width="95px" rounded="sm" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Skeleton height="20px" width="110px" rounded="sm" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Skeleton height="24px" width="85px" rounded="full" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton height="20px" width="160px" rounded="sm" />
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <Skeleton height="32px" width="120px" rounded="md" />
                  </td>
                </tr>
              ))
            ) : paginatedTickets.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 px-6 text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
                      <IconInboxOff size={32} stroke={1.5} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Tidak Ada Catatan Gangguan TI Ditemukan
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 mb-5">
                      {hasActiveFilter
                        ? 'Tidak ada tiket yang cocok dengan kata kunci pencarian atau filter yang Anda pilih.'
                        : 'Belum ada data catatan gangguan TI yang tersimpan pada sistem.'}
                    </p>
                    <div className="flex items-center gap-3">
                      {hasActiveFilter && (
                        <Button
                          hierarchy="secondary"
                          size="sm"
                          onClick={onResetFilter}
                          prefixIcon={<IconFilterOff size={16} />}
                        >
                          Reset Filter
                        </Button>
                      )}
                      <Button
                        hierarchy="primary"
                        size="sm"
                        onClick={onOpenCreate}
                        prefixIcon={<IconPlus size={16} />}
                      >
                        Tambah Tiket Baru
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTickets.map((ticket) => {
                const katBadge = getKategoriBadgeProps(ticket.kategori);
                const statusVariant = getStatusBadgeVariant(ticket.status);

                return (
                  <tr
                    key={ticket.id}
                    className="hover:bg-blue-50/40 transition-colors duration-150 group"
                  >
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(ticket)}
                        className="font-mono text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-2.5 py-1 rounded-md transition-colors"
                        title="Lihat detail tiket"
                      >
                        {ticket.kode}
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{ticket.nama}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        type="soft"
                        variant={katBadge.variant}
                        size="md"
                        rounded="full"
                        prefixIcon={katBadge.icon}
                      >
                        {ticket.kategori}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700">{ticket.unit}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <span className="block text-slate-800 font-medium">
                        {formatTanggalIndonesia(ticket.tanggal)}
                      </span>
                      <span className="block text-xs text-slate-400 font-mono">
                        {ticket.tanggal}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right font-semibold text-slate-800">
                      {formatRupiah(ticket.nilai)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <Badge type="soft" variant={statusVariant} size="md" rounded="full">
                        {ticket.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {ticket.catatan ? (
                        <p className="text-slate-600 text-xs sm:text-sm line-clamp-2">
                          {ticket.catatan}
                        </p>
                      ) : (
                        <span className="text-xs italic text-slate-400">Tidak ada catatan</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Button
                          hierarchy="secondary"
                          size="sm"
                          onClick={() => onOpenDetail(ticket)}
                          prefixIcon={<IconEye size={15} />}
                          aria-label={`Lihat detail tiket ${ticket.kode}`}
                          title="Detail Tiket"
                        >
                          Detail
                        </Button>
                        <Button
                          hierarchy="secondary"
                          size="sm"
                          onClick={() => onOpenEdit(ticket)}
                          prefixIcon={<IconEdit size={15} />}
                          aria-label={`Ubah tiket ${ticket.kode}`}
                          title="Ubah Tiket"
                        >
                          Ubah
                        </Button>
                        <Button
                          hierarchy="secondary"
                          size="sm"
                          onClick={() => onOpenDelete(ticket)}
                          prefixIcon={<IconTrash size={15} className="text-red-600" />}
                          className="!border-red-200 !text-red-700 hover:!bg-red-50"
                          aria-label={`Hapus tiket ${ticket.kode}`}
                          title="Hapus Tiket"
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Navigasi Halaman Menggunakan Komponen Pagination IDDS */}
      {!loading && totalItems > 0 && (
        <div className="p-4 sm:px-6 border-t border-slate-200 bg-slate-50/50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            fullWidth
          />
        </div>
      )}
    </section>
  );
}
