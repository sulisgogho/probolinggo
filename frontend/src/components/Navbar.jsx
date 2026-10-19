/**
 * Komponen Navbar Utama
 * Responsif untuk tampilan Mobile, Tablet, dan Desktop menggunakan komponen @idds/react:
 * Button, Badge, Avatar
 */
import React from 'react';
import { Button, Badge, Avatar } from '@idds/react';
import {
  IconHeadset,
  IconLogout,
  IconRefresh,
  IconShieldCheck,
  IconBuilding,
  IconPlus,
  IconLayoutDashboard,
  IconClipboardList,
  IconUserCog,
} from '@tabler/icons-react';

export default function Navbar({
  user,
  onLogout,
  onRefresh,
  isRefreshing,
  activeMenu,
  onSelectMenu,
  onOpenCreate,
}) {
  const initials = (user?.nama_lengkap || user?.username || 'TI')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Kiri: Identitas Aplikasi */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <IconHeadset size={21} stroke={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">
                Sistem Catatan Gangguan TI
              </h1>
              <span className="hidden md:inline-flex">
                <Badge type="soft" variant="brand" size="sm" rounded="full">
                  IT Helpdesk
                </Badge>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              Layanan Pemantauan &amp; Penanganan Insiden TI
            </p>
          </div>
        </div>

        {/* Tengah (Khusus Desktop lg+): Navigasi Menu */}
        <nav
          aria-label="Navigasi Menu Desktop"
          className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70"
        >
          <button
            type="button"
            onClick={() => onSelectMenu?.('dashboard')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'dashboard'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <IconLayoutDashboard size={15} />
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectMenu?.('daftar')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'daftar'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <IconClipboardList size={15} />
            <span>Daftar Catatan</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectMenu?.('pengguna')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'pengguna'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <IconUserCog size={15} />
            <span>Setting Pengguna</span>
          </button>
        </nav>

        {/* Kanan di Mobile & Tablet (< lg): Tombol Cepat Tambah Tiket & Muat Ulang */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <Button
            hierarchy="primary"
            size="sm"
            onClick={onOpenCreate}
            prefixIcon={<IconPlus size={16} />}
            aria-label="Tambah tiket gangguan baru"
          >
            <span>Tiket</span>
          </Button>
          <Button
            hierarchy="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            prefixIcon={
              <IconRefresh
                size={16}
                className={isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-600'}
              />
            }
            aria-label="Muat ulang data tiket"
          >
            <span className="hidden sm:inline">Segarkan</span>
          </Button>
        </div>

        {/* Kanan di Desktop (lg+): Muat Ulang, Profil Pengguna, & Tombol Keluar */}
        <div className="hidden lg:flex items-center gap-3.5 shrink-0">
          <Button
            hierarchy="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            prefixIcon={
              <IconRefresh
                size={16}
                className={isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-600'}
              />
            }
            aria-label="Muat ulang data tiket"
            title="Muat ulang data tiket"
          >
            <span>Muat Ulang</span>
          </Button>

          <div
            role="button"
            tabIndex={0}
            onClick={() => onSelectMenu?.('pengguna')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectMenu?.('pengguna');
              }
            }}
            className="flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer hover:opacity-85 transition-opacity"
            title="Buka Setting Pengguna"
          >
            <Avatar fallbackText={initials} size="md" />
            <div className="text-left leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-800">
                  {user?.nama_lengkap || user?.username}
                </span>
                <Badge
                  type="soft"
                  variant={user?.role === 'admin' ? 'info' : 'neutral'}
                  size="sm"
                  rounded="full"
                  prefixIcon={<IconShieldCheck size={12} />}
                >
                  {user?.role === 'admin' ? 'Admin TI' : 'Operator Unit'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                <IconBuilding size={13} className="text-slate-400" />
                <span>{user?.unit || 'Semua Unit'}</span>
              </div>
            </div>
          </div>

          <Button
            hierarchy="secondary"
            size="sm"
            onClick={onLogout}
            prefixIcon={<IconLogout size={16} className="text-red-600" />}
            className="!border-red-200 !text-red-700 hover:!bg-red-50"
            aria-label="Keluar dari sesi aplikasi"
          >
            <span>Keluar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
