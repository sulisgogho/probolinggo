/**
 * Komponen Navigasi Bawah (Bottom Bar) untuk Mobile & Tablet
 * Menyediakan 3 menu utama yang bersih, nyaman diakses satu tangan, tanpa badge angka yang menumpuk:
 * 1. Dashboard (Analisis Multi-Dimensi: Status, Kategori, Unit Kerja)
 * 2. Daftar (Daftar Catatan Gangguan TI, Pencarian, & Filter)
 * 3. Setting Pengguna (Profil Akun, Otorisasi Unit Kerja, & Sesi)
 */
import React from 'react';
import {
  IconLayoutDashboard,
  IconClipboardList,
  IconUserCog,
} from '@tabler/icons-react';

export default function MobileBottomNav({ activeMenu, onSelectMenu }) {
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
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_-4px_rgba(15,23,42,0.08)] safe-area-bottom"
    >
      <div className="max-w-md sm:max-w-xl mx-auto grid grid-cols-3 h-16 px-3">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectMenu(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isActive
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              {/* Indikator garis aktif di bagian atas item */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-blue-600 shadow-xs" />
              )}

              {/* Wadah ikon bersih tanpa tumpukan angka badge */}
              <div
                className={`flex items-center justify-center w-10 h-7 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <IconComponent size={21} stroke={isActive ? 2.2 : 1.8} />
              </div>

              {/* Label menu teks yang terbaca jelas */}
              <span className="text-xs leading-none tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
