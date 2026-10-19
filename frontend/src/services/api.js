/**
 * Layanan Klien API (Axios)
 * Mengelola komunikasi HTTP dengan Backend, penyisipan token JWT otomatis,
 * serta pembersihan sesi ketika token kadaluarsa atau dicabut.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_STORAGE_KEY = 'it_helpdesk_jwt_token';
const USER_STORAGE_KEY = 'it_helpdesk_user_profile';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor Request: Sisipkan Authorization Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Response: Tangani 401 Unauthorized (Sesi Berakhir / Token Revoked)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginEndpoint) {
      clearStoredSession();
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
    return Promise.reject(error);
  }
);

export function saveSession(token, user) {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function getStoredSession() {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  const rawUser = sessionStorage.getItem(USER_STORAGE_KEY);
  if (!token || !rawUser) return null;
  try {
    return {
      token,
      user: JSON.parse(rawUser),
    };
  } catch {
    clearStoredSession();
    return null;
  }
}

export function clearStoredSession() {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
}

// ============================================================================
// Endpoint Autentikasi
// ============================================================================
export async function loginApi(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}

export async function logoutApi() {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } finally {
    clearStoredSession();
  }
}

export async function getCurrentUserApi() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

// ============================================================================
// Endpoint CRUD Catatan Gangguan TI
// ============================================================================
export async function fetchTicketsApi(params = {}) {
  const response = await apiClient.get('/tickets', { params });
  return response.data;
}

export async function fetchTicketDetailApi(id) {
  const response = await apiClient.get(`/tickets/${encodeURIComponent(id)}`);
  return response.data;
}

export async function createTicketApi(payload) {
  const response = await apiClient.post('/tickets', payload);
  return response.data;
}

export async function updateTicketApi(id, payload) {
  const response = await apiClient.put(`/tickets/${encodeURIComponent(id)}`, payload);
  return response.data;
}

export async function deleteTicketApi(id) {
  const response = await apiClient.delete(`/tickets/${encodeURIComponent(id)}`);
  return response.data;
}

/**
 * Helper format mata uang Rupiah sesuai kamus data:
 * "Estimasi biaya penanganan (rupiah)"
 */
export function formatRupiah(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Helper format tanggal Indonesia (contoh: 01 Okt 2026)
 */
export function formatTanggalIndonesia(dateStr) {
  if (!dateStr) return '-';
  const parts = String(dateStr).slice(0, 10).split('-');
  if (parts.length !== 3) return dateStr;
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (Number.isNaN(dateObj.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}

export default apiClient;

