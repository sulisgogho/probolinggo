/**
 * Komponen Utama Aplikasi (App.jsx)
 * Mengintegrasikan:
 * - Autentikasi JWT (Login & Logout)
 * - Navigasi 3 Menu (Bottom Bar di Mobile/Tablet & Pill Menu di Desktop):
 *   1. Dashboard (Ringkasan Statistik, Distribusi Kategori, Tiket Terbaru, & Pintasan Tambah Tiket)
 *   2. Daftar (Daftar Catatan Gangguan TI, Pencarian/Filter, & Tambah Tiket)
 *   3. Setting Pengguna (Profil Akun, Informasi Unit Kerja, Sinkronisasi, & Logout)
 * - Desain Responsif Penuh untuk Mobile (1 Kolom Card), Tablet (2-3 Kolom Grid), dan Desktop (Full-Width Table)
 * - Umpan Balik UI: Loading, Error Banner (Alert IDDS), Empty State, dan Toast Notification (useToast IDDS)
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, useToast } from '@idds/react';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import DashboardAnalytics from './components/DashboardAnalytics';
import UserSettingsView from './components/UserSettingsView';
import LoginView from './components/LoginView';
import TicketTable from './components/TicketTable';
import TicketFormModal from './components/TicketFormModal';
import TicketDetailModal from './components/TicketDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import {
  getStoredSession,
  saveSession,
  clearStoredSession,
  loginApi,
  logoutApi,
  fetchTicketsApi,
  createTicketApi,
  updateTicketApi,
  deleteTicketApi,
} from './services/api';

export default function App() {
  const { toast } = useToast();

  // State Autentikasi
  const [session, setSession] = useState(() => getStoredSession());

  // State Menu Aktif ('dashboard' | 'daftar' | 'pengguna')
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // State Data & Statistik
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    baru: 0,
    diproses: 0,
    selesai: 0,
    total_nilai: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState('');

  // State Pencarian & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // State Modal CRUD
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [detailTicket, setDetailTicket] = useState(null);
  const [deletingTicket, setDeletingTicket] = useState(null);

  // Dengarkan event sesi berakhir (401 dari interceptor API)
  useEffect(() => {
    const handleSessionExpired = () => {
      setSession(null);
      toast({
        state: 'destructive',
        style: 'solid',
        title: 'Sesi Berakhir',
        description: 'Sesi autentikasi Anda telah berakhir. Silakan masuk kembali.',
        position: 'top-right',
        duration: 4000,
      });
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, [toast]);

  // Fungsi memuat daftar tiket dari Backend API
  const loadTickets = useCallback(async () => {
    if (!session?.token) return;
    setLoading(true);
    setErrorBanner('');

    try {
      const response = await fetchTicketsApi({
        search: searchQuery.trim() || undefined,
        kategori: selectedKategori !== 'Semua' ? selectedKategori : undefined,
        status: selectedStatus !== 'Semua' ? selectedStatus : undefined,
      });

      if (response?.success) {
        setTickets(response.data || []);
        if (response.stats) {
          setStats(response.stats);
        }
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Gagal memuat data catatan gangguan TI dari server. Pastikan layanan backend dan database aktif.';
      setErrorBanner(message);
    } finally {
      setLoading(false);
    }
  }, [session?.token, searchQuery, selectedKategori, selectedStatus]);

  useEffect(() => {
    if (session?.token) {
      loadTickets();
    }
  }, [session?.token, loadTickets]);

  // Generate saran kode unik berikutnya secara otomatis (misal IT4-021)
  const suggestedNextCode = useMemo(() => {
    let maxNum = 20;
    for (const item of tickets) {
      const match = String(item.kode || '').match(/^IT4-(\d+)$/i);
      if (match) {
        const num = Number(match[1]);
        if (num > maxNum) maxNum = num;
      }
    }
    return `IT4-${String(maxNum + 1).padStart(3, '0')}`;
  }, [tickets]);

  // Handler Sukses Login
  const handleLoginSuccess = (token, user) => {
    saveSession(token, user);
    setSession({ token, user });
    setActiveMenu('dashboard');
    toast({
      state: 'positive',
      style: 'solid',
      title: 'Berhasil Masuk',
      description: `Selamat datang kembali, ${user.nama_lengkap || user.username}.`,
      position: 'top-right',
      duration: 3500,
    });
  };

  // Handler Logout
  const handleLogout = async () => {
    await logoutApi();
    clearStoredSession();
    setSession(null);
    setTickets([]);
    setActiveMenu('dashboard');
    toast({
      state: 'default',
      style: 'solid',
      title: 'Sesi Diakhiri',
      description: 'Anda telah berhasil keluar dari sistem.',
      position: 'top-right',
      duration: 3000,
    });
  };

  // Handler Buka Modal Tambah Tiket
  const handleOpenCreate = () => {
    setEditingTicket(null);
    setIsFormOpen(true);
  };

  // Handler Simpan (Tambah / Ubah)
  const handleFormSubmit = async (payload) => {
    if (editingTicket?.id) {
      const res = await updateTicketApi(editingTicket.id, payload);
      toast({
        state: 'positive',
        style: 'solid',
        title: 'Data Diperbarui',
        description: res.message || `Tiket ${payload.kode} berhasil diperbarui.`,
        position: 'top-right',
        duration: 3500,
      });
    } else {
      const res = await createTicketApi(payload);
      toast({
        state: 'positive',
        style: 'solid',
        title: 'Tiket Ditambahkan',
        description: res.message || `Tiket ${payload.kode} berhasil disimpan.`,
        position: 'top-right',
        duration: 3500,
      });
    }

    setIsFormOpen(false);
    setEditingTicket(null);
    await loadTickets();
  };

  // Handler Hapus Tiket
  const handleConfirmDelete = async (ticketId) => {
    try {
      const res = await deleteTicketApi(ticketId);
      toast({
        state: 'positive',
        style: 'solid',
        title: 'Tiket Dihapus',
        description: res.message || 'Data tiket berhasil dihapus secara permanen.',
        position: 'top-right',
        duration: 3500,
      });
      setDeletingTicket(null);
      await loadTickets();
    } catch (err) {
      const errMsg =
        err.response?.data?.message || 'Gagal menghapus tiket gangguan TI.';
      toast({
        state: 'destructive',
        style: 'solid',
        title: 'Gagal Menghapus',
        description: errMsg,
        position: 'top-right',
        duration: 4000,
      });
    }
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setSelectedKategori('Semua');
    setSelectedStatus('Semua');
  };

  // Handler Analisis: Filter dari kartu Dashboard langsung membuka tab Daftar
  const handleApplyFilterAndGoToDaftar = ({ unit, kategori, status }) => {
    if (unit) {
      setSearchQuery(unit);
    }
    if (kategori) {
      setSelectedKategori(kategori);
    }
    if (status) {
      setSelectedStatus(status);
    }
    setActiveMenu('daftar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Jika belum login, tampilkan halaman LoginView
  if (!session?.token) {
    return <LoginView onLoginSuccess={handleLoginSuccess} loginApiCall={loginApi} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navigasi Atas */}
      <Navbar
        user={session.user}
        onLogout={handleLogout}
        onRefresh={loadTickets}
        isRefreshing={loading}
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
        onOpenCreate={handleOpenCreate}
      />

      {/* Kontainer Utama Lebar (Full-Width dengan Padding Proporsional) */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3.5 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 space-y-5 sm:space-y-6">
        {/* Umpan Balik Error Global (Jika Terjadi Kesalahan Jaringan / Server) */}
        {errorBanner && (
          <div role="alert">
            <Alert
              variant="critical"
              title="Kendala Memuat Data"
              message={errorBanner}
              dismissible
              onDismiss={() => setErrorBanner('')}
            />
          </div>
        )}

        {/* =================================================================== */}
        {/* MENU 1: DASHBOARD (ANALISIS MULTI-DIMENSI: STATUS, KATEGORI, UNIT)  */}
        {/* =================================================================== */}
        {activeMenu === 'dashboard' && (
          <DashboardAnalytics
            tickets={tickets}
            stats={stats}
            loading={loading}
            onOpenDetail={(ticket) => setDetailTicket(ticket)}
            onOpenEdit={(ticket) => {
              setEditingTicket(ticket);
              setIsFormOpen(true);
            }}
            onGoToDaftar={() => {
              setActiveMenu('daftar');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onApplyFilterAndGoToDaftar={handleApplyFilterAndGoToDaftar}
          />
        )}

        {/* =================================================================== */}
        {/* MENU 2: DAFTAR CATATAN GANGGUAN TI & TAMBAH TIKET                   */}
        {/* =================================================================== */}
        {activeMenu === 'daftar' && (
          <TicketTable
            tickets={tickets}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedKategori={selectedKategori}
            onKategoriChange={setSelectedKategori}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onResetFilter={handleResetFilter}
            onOpenCreate={handleOpenCreate}
            onOpenDetail={(ticket) => setDetailTicket(ticket)}
            onOpenEdit={(ticket) => {
              setEditingTicket(ticket);
              setIsFormOpen(true);
            }}
            onOpenDelete={(ticket) => setDeletingTicket(ticket)}
          />
        )}

        {/* =================================================================== */}
        {/* MENU 3: SETTING PENGGUNA                                            */}
        {/* =================================================================== */}
        {activeMenu === 'pengguna' && (
          <UserSettingsView
            user={session.user}
            stats={stats}
            onLogout={handleLogout}
            onRefresh={loadTickets}
            isRefreshing={loading}
            onOpenCreate={handleOpenCreate}
            onGoToDaftar={() => setActiveMenu('daftar')}
          />
        )}
      </main>

      {/* Footer Aplikasi (Dengan padding bawah ekstra di mobile/tablet agar tidak tertutup Bottom Bar) */}
      <footer className="border-t border-slate-200 bg-white mt-auto pb-16 lg:pb-0">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-5 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Diskominfo Kota Probolinggo
        </div>
      </footer>

      {/* Navigasi Bottom Bar untuk Mobile & Tablet (3 Menu: Dashboard, Daftar, Setting Pengguna) */}
      <MobileBottomNav
        activeMenu={activeMenu}
        onSelectMenu={(menuId) => {
          setActiveMenu(menuId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modal Tambah / Ubah Tiket */}
      <TicketFormModal
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTicket(null);
        }}
        initialData={editingTicket}
        onSubmit={handleFormSubmit}
        currentUser={session.user}
        suggestedNextCode={suggestedNextCode}
      />

      {/* Modal Detail 1 Tiket */}
      <TicketDetailModal
        open={Boolean(detailTicket)}
        onClose={() => setDetailTicket(null)}
        ticket={detailTicket}
        onEdit={(ticket) => {
          setEditingTicket(ticket);
          setIsFormOpen(true);
        }}
      />

      {/* Modal Konfirmasi Hapus */}
      <DeleteConfirmModal
        open={Boolean(deletingTicket)}
        onClose={() => setDeletingTicket(null)}
        ticket={deletingTicket}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
