/**
 * Komponen Halaman Setting Pengguna (Profil, Hak Akses Unit Kerja, & Manajemen Sesi)
 * Menggunakan komponen resmi @idds/react:
 * CardPlain, Avatar, Badge, Button, Divider, Alert
 */
import React from 'react';
import {
  CardPlain,
  Avatar,
  Badge,
  Button,
  Divider,
  Alert,
} from '@idds/react';
import {
  IconShieldCheck,
  IconBuilding,
  IconUser,
  IconKey,
  IconRefresh,
  IconLogout,
  IconPlus,
  IconClipboardList,
  IconCircleCheck,
} from '@tabler/icons-react';

export default function UserSettingsView({
  user,
  stats,
  onLogout,
  onRefresh,
  isRefreshing,
  onOpenCreate,
  onGoToDaftar,
}) {
  const initials = (user?.nama_lengkap || user?.username || 'TI')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isAdmin = user?.role === 'admin';

  return (
    <section
      aria-label="Halaman Pengaturan dan Profil Pengguna"
      className="space-y-4 sm:space-y-6 max-w-4xl mx-auto"
    >
      {/* Kartu Utama Profil Pengguna */}
      <CardPlain className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar fallbackText={initials} size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {user?.nama_lengkap || user?.username}
                </h2>
                <Badge
                  type="soft"
                  variant={isAdmin ? 'info' : 'brand'}
                  size="sm"
                  rounded="full"
                  prefixIcon={<IconShieldCheck size={13} />}
                >
                  {isAdmin ? 'Administrator TI' : 'Petugas Operator Unit'}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                @{user?.username} &bull; {user?.unit || 'Semua Unit Kerja'}
              </p>
            </div>
          </div>

          <Badge
            type="soft"
            variant="success"
            size="md"
            rounded="full"
            prefixIcon={<IconCircleCheck size={14} />}
          >
            Sesi Aktif
          </Badge>
        </div>

        <Divider className="my-5" />

        {/* Grid Detail Informasi Akun (1 Kolom di Mobile, 2 Kolom di Tablet/Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          <CardPlain className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <IconUser size={15} className="text-blue-600" />
              <span>Nama Pengguna (Username)</span>
            </div>
            <p className="text-sm font-bold text-slate-900 font-mono">
              {user?.username || '-'}
            </p>
          </CardPlain>

          <CardPlain className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <IconBuilding size={15} className="text-blue-600" />
              <span>Unit Kerja Terdaftar</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {user?.unit || 'Seluruh Unit Kerja'}
            </p>
          </CardPlain>

          <CardPlain className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <IconShieldCheck size={15} className="text-blue-600" />
              <span>Tingkat Otorisasi (Role)</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {isAdmin
                ? 'Akses Penuh Lintas Unit (Admin)'
                : `Akses Unit Kerja (${user?.unit})`}
            </p>
          </CardPlain>

          <CardPlain className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <IconKey size={15} className="text-blue-600" />
              <span>Cakupan Tiket Terkelola</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {stats?.total ?? 0} Catatan Gangguan TI
            </p>
          </CardPlain>
        </div>

        <div className="mt-5">
          <Alert
            variant="info"
            title="Keamanan Sesi & Hak Akses Data"
            message={
              isAdmin
                ? 'Sebagai Administrator TI, Anda memiliki wewenang untuk menambah, memantau, mengubah, dan menghapus catatan gangguan TI pada seluruh unit kerja.'
                : `Akun Anda terikat pada unit kerja "${user?.unit}". Anda dapat mencatat dan memperbarui tiket gangguan TI untuk unit kerja Anda secara aman.`
            }
          />
        </div>
      </CardPlain>

      {/* Kartu Pintasan & Pengaturan Aplikasi */}
      <CardPlain className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Aksi Cepat &amp; Manajemen Sesi
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola sinkronisasi data sistem atau akhiri sesi login Anda pada perangkat ini.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            hierarchy="primary"
            size="md"
            onClick={onOpenCreate}
            prefixIcon={<IconPlus size={18} />}
            className="w-full justify-center"
          >
            Tambah Tiket Gangguan Baru
          </Button>

          <Button
            type="button"
            hierarchy="secondary"
            size="md"
            onClick={onGoToDaftar}
            prefixIcon={<IconClipboardList size={18} />}
            className="w-full justify-center"
          >
            Buka Daftar Catatan TI
          </Button>

          <Button
            type="button"
            hierarchy="secondary"
            size="md"
            onClick={onRefresh}
            disabled={isRefreshing}
            prefixIcon={
              <IconRefresh
                size={18}
                className={isRefreshing ? 'animate-spin text-blue-600' : ''}
              />
            }
            className="w-full justify-center"
          >
            {isRefreshing ? 'Menyinkronkan Data...' : 'Segarkan Data dari Server'}
          </Button>

          <Button
            type="button"
            hierarchy="secondary"
            size="md"
            onClick={onLogout}
            prefixIcon={<IconLogout size={18} className="text-red-600" />}
            className="w-full justify-center !border-red-200 !text-red-700 hover:!bg-red-50"
          >
            Keluar dari Akun (Logout)
          </Button>
        </div>
      </CardPlain>
    </section>
  );
}

