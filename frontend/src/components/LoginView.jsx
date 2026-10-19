/**
 * Komponen Halaman Login
 * Menggunakan komponen resmi @idds/react: TextField, PasswordInput, Button, Alert, Spinner, Badge, CardPlain.
 * Pada mode mobile, langsung menampilkan kartu form Portal Petugas & Administrator agar cepat diakses.
 */
import React, { useState } from 'react';
import {
  TextField,
  PasswordInput,
  Button,
  Alert,
  Spinner,
  Badge,
  CardPlain,
  containsDangerousPatterns,
} from '@idds/react';
import {
  IconHeadset,
  IconUser,
  IconLock,
  IconLogin2,
  IconShieldLock,
  IconServer,
  IconDeviceDesktopAnalytics,
} from '@tabler/icons-react';

export default function LoginView({ onLoginSuccess, loginApiCall }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const nextErrors = {};
    const trimmedUser = username.trim();

    if (!trimmedUser) {
      nextErrors.username = 'Nama pengguna wajib diisi.';
    } else if (containsDangerousPatterns(trimmedUser)) {
      nextErrors.username = 'Input nama pengguna mengandung karakter tidak valid.';
    }

    if (!password) {
      nextErrors.password = 'Kata sandi wajib diisi.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await loginApiCall({
        username: username.trim(),
        password,
      });
      if (response?.success && response?.data) {
        onLoginSuccess(response.data.token, response.data.user);
      }
    } catch (err) {
      const resData = err.response?.data;
      if (resData?.errors) {
        setErrors(resData.errors);
      }
      setServerError(
        resData?.message || 'Gagal menghubungi server autentikasi. Periksa koneksi jaringan Anda.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col lg:flex-row">
      {/* Panel Informasi Sistem — Hanya tampil pada layar Desktop (hidden di mobile) */}
      <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-4 py-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <IconHeadset size={20} />
            </div>
            <div>
              <span className="text-sm font-bold tracking-wide block">
                SISTEM CATATAN GANGGUAN TI
              </span>
              <span className="text-xs text-blue-200 block">
                Layanan Terpadu Penanganan Insiden TI
              </span>
            </div>
          </div>

          <h1 className="mt-10 text-4xl lg:text-5xl font-bold tracking-tight leading-tight max-w-2xl">
            Kelola Laporan &amp; Penanganan Gangguan TI Secara Terukur
          </h1>
          <p className="mt-4 text-slate-300 text-lg max-w-xl leading-relaxed">
            Platform pencatatan insiden perangkat keras, aplikasi layanan, serta infrastruktur
            jaringan lintas unit kerja dengan pemantauan status dan estimasi biaya penanganan
            secara real-time.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-2xl">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <IconServer size={22} className="text-blue-400 mb-2" />
              <h2 className="text-sm font-semibold text-white">Klasifikasi Terstandar</h2>
              <p className="text-xs text-slate-300 mt-1">
                Kategori Perangkat, Aplikasi, dan Koneksi sesuai kamus data standar.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <IconDeviceDesktopAnalytics size={22} className="text-emerald-400 mb-2" />
              <h2 className="text-sm font-semibold text-white">Pelacakan Status</h2>
              <p className="text-xs text-slate-300 mt-1">
                Pantau progres tiket dari status Baru, Diproses, hingga Selesai.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <IconShieldLock size={22} className="text-amber-400 mb-2" />
              <h2 className="text-sm font-semibold text-white">Keamanan Berlapis</h2>
              <p className="text-xs text-slate-300 mt-1">
                Dilengkapi autentikasi JWT, otorisasi unit kerja, dan validasi input ketat.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 pt-6 border-t border-white/10 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Diskominfo Kota Probolinggo
        </div>
      </div>

      {/* Panel Formulir Login — Langsung tampil penuh & nyaman sebagai Card di Mobile & Tablet */}
      <div className="flex-1 lg:w-5/12 flex flex-col justify-between p-4 sm:p-8 md:p-12 lg:p-16 bg-slate-50 lg:bg-white min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <CardPlain className="w-full max-w-md md:max-w-lg lg:max-w-md bg-white rounded-2xl lg:rounded-none border border-slate-200/90 lg:border-0 shadow-sm lg:shadow-none p-6 sm:p-8 md:p-10 lg:p-0">
            {/* Identitas Ringkas di Mobile & Tablet */}
            <div className="flex lg:hidden items-center gap-3 pb-5 mb-5 border-b border-slate-100">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <IconHeadset size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  Sistem Catatan Gangguan TI
                </p>
                <p className="text-xs text-slate-500 truncate">
                  Layanan Pemantauan &amp; Penanganan Insiden TI
                </p>
              </div>
            </div>

            <div className="mb-6 sm:mb-8">
              <Badge type="soft" variant="brand" size="md" rounded="full">
                Portal Petugas &amp; Administrator
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3 tracking-tight">
                Masuk ke Akun Anda
              </h2>
              <p className="text-sm text-slate-600 mt-1.5">
                Masukkan kredensial akun resmi Anda untuk mengakses dashboard catatan gangguan TI.
              </p>
            </div>

            {serverError && (
              <div className="mb-5" role="alert">
                <Alert
                  variant="critical"
                  title="Autentikasi Gagal"
                  message={serverError}
                  dismissible
                  onDismiss={() => setServerError('')}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
              <div>
                <TextField
                  id="login-username"
                  name="username"
                  label="Nama Pengguna (Username)"
                  placeholder="Masukkan nama pengguna"
                  value={username}
                  onChange={(val) => {
                    setUsername(val);
                    if (errors.username) setErrors((prev) => ({ ...prev, username: '' }));
                  }}
                  prefixIcon={<IconUser size={18} className="text-slate-400" />}
                  status={errors.username ? 'error' : 'neutral'}
                  statusMessage={errors.username}
                  disabled={submitting}
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <PasswordInput
                  id="login-password"
                  name="password"
                  label="Kata Sandi (Password)"
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(val) => {
                    setPassword(val);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  prefixIcon={<IconLock size={18} className="text-slate-400" />}
                  status={errors.password ? 'error' : 'neutral'}
                  statusMessage={errors.password}
                  disabled={submitting}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  hierarchy="primary"
                  size="lg"
                  disabled={submitting}
                  className="w-full justify-center"
                  prefixIcon={
                    submitting ? (
                      <Spinner size={18} color="inherit" spinnerOnly />
                    ) : (
                      <IconLogin2 size={18} />
                    )
                  }
                >
                  {submitting ? 'Memverifikasi Sesi...' : 'Masuk ke Sistem'}
                </Button>
              </div>
            </form>
          </CardPlain>
        </div>

        {/* Footer Mobile & Tablet */}
        <footer className="lg:hidden pt-6 pb-2 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Diskominfo Kota Probolinggo
        </footer>
      </div>
    </div>
  );
}
