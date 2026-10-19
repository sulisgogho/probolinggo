/**
 * Komponen Navigasi Bawah (Bottom Bar) untuk Mobile & Tablet
 * Menyediakan 3 menu utama agar layar tidak menumpuk dan nyaman diakses satu tangan:
 * 1. Dashboard (Ringkasan Statistik, Distribusi Kategori, & Pintasan Tambah Tiket)
 * 2. Daftar (Daftar Catatan Gangguan TI, Pencarian/Filter, & Tambah Tiket)
 * 3. Setting Pengguna (Profil Akun, Informasi Unit Kerja, Sinkronisasi, & Logout)
 *
 * Menggunakan komponen resmi @idds/react: Badge
 */
import React from 'react';
import { Badge } from '@idds/react';
import {
  IconLayoutDashboard,
  IconClipboardList,
  IconUserCog,
} from '@tabler/icons-react';

export default function MobileBottomNav({ activeMenu, onSelectMenu, totalTickets }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: IconLayoutDashboard,
    },
    {
      id: 'daftar',
      label: 'Daftar',
      icon: IconClipboardList,
      badge: typeof totalTickets === 'number' ? totalTickets : null,
    },
    {
      id: 'pengguna',
      label: 'Setting Pengguna',
      icon: IconUserCog,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Utama Bawah"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_-4px_rgba(15,23,42,0.08)]"
    >
      <div className="max-w-2xl mx-auto grid grid-cols-3 h-16 px-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectMenu(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl my-1 mx-1 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isActive
                  ? 'text-blue-600 bg-blue-50/80 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
              }`}
            >
              {/* Indikator garis aktif di bagian atas item */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-600" />
              )}

              <div className="relative flex items-center justify-center">
                <IconComponent size={21} stroke={isActive ? 2.2 : 1.8} />
                {item.badge !== null && item.badge !== undefined && (
                  <span className=" -top-1.5 -right-5 absolute">
                    <Badge
                      type="soft"
                      variant={isActive ? 'brand' : 'neutral'}
                      size="sm"
                      rounded="full"
                    >
                      {item.badge}
                    </Badge>
                  </span>
                )}
              </div>

              <span className="text-[11px] sm:text-xs leading-none tracking-tight truncate max-w-full px-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

