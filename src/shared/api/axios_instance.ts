import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const primaryUrl = import.meta.env.VITE_API_BASE_URL_PRIORITAS;
const secondaryUrl = import.meta.env.VITE_API_BASE_URL_SECOND;
const defaultUrl = import.meta.env.VITE_API_BASE_URL || '/api';

const activeBaseURL = primaryUrl || secondaryUrl || defaultUrl;

const axios_instance = axios.create({
  baseURL: activeBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let hasSwitchedToSecondary = false;

axios_instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const INDO_ERROR_MAP: Record<string, string> = {
  'department dengan nama atau kode yang sama sudah ada': 'A department with the same name or code already exists',
  'a department with the same name or code already exists': 'A department with the same name or code already exists',
  'email atau password salah': 'Invalid email or password',
  'email atau password salah.': 'Invalid email or password',
  'invalid email or password': 'Invalid email or password',
  'email sudah terdaftar tapi belum diverifikasi': 'Email is already registered but not verified yet. A new OTP has been sent.',
  'email sudah terdaftar': 'Email is already registered',
  'email sudah diverifikasi': 'Email is already verified',
  'email belum diverifikasi': 'Email has not been verified yet',
  'cek inbox email kamu': 'Please check your inbox.',
  'user tidak ditemukan': 'User not found',
  'email tidak ditemukan': 'Email not found',
  'kode otp salah atau kadaluarsa': 'Invalid or expired OTP code',
  'kode otp telah dikirim': 'OTP code has been sent',
  'kode otp baru telah dikirim': 'A new OTP code has been sent',
  'otp tidak valid': 'Invalid OTP code',
  'otp sudah kadaluarsa': 'OTP has expired, please request a new OTP',
  'otp belum di-request': 'OTP has not been requested',
  'password minimal 6 karakter': 'Password must be at least 6 characters',
  'password dan konfirmasi password tidak sama': 'Password and confirmation password do not match',
  'password dan konfirmasi password tidak cocok': 'Password and confirmation password do not match',
  'password dan password verification tidak sama': 'Password and confirmation password do not match',
  'iso standard tidak ditemukan atau tidak aktif': 'ISO Standard not found or inactive',
  'iso standard tidak ditemukan': 'ISO Standard not found',
  'kode iso sudah digunakan': 'ISO Code is already in use',
  'department tidak ditemukan atau tidak aktif': 'Department not found or inactive',
  'department tidak ditemukan': 'Department not found',
  'department berhasil dihapus': 'Department deleted successfully',
  'spc unit tidak ditemukan': 'SPC Unit not found',
  'symbol unit sudah digunakan': 'Unit symbol is already in use',
  'email sudah dipakai user lain': 'Email is already used by another user',
  'email sudah digunakan oleh akun lain': 'Email is already used by another account',
  'role tidak valid': 'Invalid role',
  'status tidak valid': 'Invalid status',
  'reset token tidak valid': 'Invalid reset token',
  'reset token sudah kadaluarsa': 'Reset token has expired',
  'nama wajib diisi': 'Name is required',
  'email wajib diisi': 'Email is required',
  'password wajib diisi': 'Password is required',
  'role wajib diisi': 'Role is required',
  'format email tidak valid': 'Invalid email format',
  'gagal menghapus item': 'Failed to delete item',
  'registrasi berhasil': 'Registration successful! Check your email for verification code.',
  'logout berhasil': 'Logged out successfully',
  'password berhasil diubah': 'Password updated successfully',
  'password berhasil direset': 'Password reset successfully, please sign in',
  'checklist template tidak ditemukan': 'Checklist template not found',
  'checklist template berhasil dibuat': 'Checklist template created successfully',
  'checklist template berhasil dihapus': 'Checklist template deleted successfully',
  'status capa dengan nama yang sama sudah ada': 'A CAPA status with the same name already exists',
  'kategori finding dengan nama yang sama sudah ada': 'A finding category with the same name already exists',
  'status capa tidak ditemukan': 'CAPA status not found',
  'kategori finding tidak ditemukan': 'Finding category not found',
  'format tanggal tidak valid': 'Invalid date format',
  'timezone tidak valid': 'Invalid timezone',
  'foto profil berhasil di upload': 'Profile photo uploaded successfully',
  'foto profil berhasil dihapus': 'Profile photo deleted successfully',
  'profil berhasil diupdate': 'Profile updated successfully',
  'tidak ada permintaan ganti email yang aktif': 'No active email change request',
  'email berhasil diperbarui': 'Email updated successfully',
};

function translateIndoMessage(msg?: string): string | undefined {
  if (!msg || typeof msg !== 'string') return msg;
  const clean = msg.trim().toLowerCase();
  for (const [indo, eng] of Object.entries(INDO_ERROR_MAP)) {
    if (clean === indo || clean.includes(indo)) {
      return eng;
    }
  }
  return msg;
}

axios_instance.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && typeof (response.data as any).message === 'string') {
      (response.data as any).message = translateIndoMessage((response.data as any).message) || (response.data as any).message;
    }
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as Record<string, any>;
      if (typeof data.message === 'string') {
        data.message = translateIndoMessage(data.message) || data.message;
      }
      if (typeof data.title === 'string') {
        data.title = translateIndoMessage(data.title) || data.title;
      }
    }
    const config = error.config as (InternalAxiosRequestConfig & { _retriedSecondary?: boolean }) | undefined;

    // If request to primary API completely failed due to network error and secondary API exists, auto retry with secondary
    if (
      !hasSwitchedToSecondary &&
      secondaryUrl &&
      config &&
      !config._retriedSecondary &&
      (!error.response || error.code === 'ERR_NETWORK')
    ) {
      config._retriedSecondary = true;
      hasSwitchedToSecondary = true;
      axios_instance.defaults.baseURL = secondaryUrl;
      config.baseURL = secondaryUrl;
      return axios_instance.request(config);
    }

    const status = error.response?.status;
    const url = error.config?.url ?? '';

    const isAuthAttempt = 
      url.includes('/login') || url.includes('/forgot-password');

    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('fullName');

      if (window.location.pathname !== '/login'){
        window.location.href = '/login';
      }
    }

    return Promise.reject(error); 
  }
);

export default axios_instance;