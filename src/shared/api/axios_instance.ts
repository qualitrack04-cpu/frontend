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
  // Department errors
  'department dengan nama atau kode yang sama sudah ada': 'A department with the same name or code already exists',
  'a department with the same name or code already exists': 'A department with the same name or code already exists',
  'department tidak ditemukan atau tidak aktif': 'Department not found or inactive',
  'department tidak ditemukan': 'Department not found',
  'department berhasil dihapus': 'Department deleted successfully',
  // Auth errors
  'email atau password salah': 'Invalid email or password',
  'email atau password salah.': 'Invalid email or password',
  'invalid email or password': 'Invalid email or password',
  'email sudah terdaftar tapi belum diverifikasi': 'Email is already registered but not verified yet. A new OTP has been sent.',
  'email sudah terdaftar': 'Email is already registered',
  'email sudah diverifikasi': 'Email is already verified',
  'email belum diverifikasi': 'Email has not been verified yet',
  'email sudah dipakai user lain': 'Email is already used by another user',
  'email sudah digunakan oleh akun lain': 'Email is already used by another account',
  'email berhasil diperbarui': 'Email updated successfully',
  'cek inbox email kamu': 'Please check your inbox.',
  'user tidak ditemukan': 'User not found',
  'email tidak ditemukan': 'Email not found',
  'tidak dapat mengubah role user': 'Cannot change the role of this user',
  // OTP errors
  'kode otp salah atau kadaluarsa': 'Invalid or expired OTP code',
  'kode otp tidak valid atau sudah kadaluarsa': 'Invalid or expired OTP code',
  'kode otp telah dikirim': 'OTP code has been sent',
  'kode otp baru telah dikirim': 'A new OTP code has been sent',
  'otp tidak valid': 'Invalid OTP code',
  'otp sudah kadaluarsa': 'OTP has expired, please request a new OTP',
  'otp belum di-request': 'OTP has not been requested',
  // Password errors
  'password minimal 6 karakter': 'Password must be at least 6 characters',
  'password dan konfirmasi password tidak sama': 'Password and confirmation password do not match',
  'password dan konfirmasi password tidak cocok': 'Password and confirmation password do not match',
  'password dan password verification tidak sama': 'Password and confirmation password do not match',
  'password berhasil diubah': 'Password updated successfully',
  'password berhasil direset': 'Password reset successfully, please sign in',
  'password wajib diisi': 'Password is required',
  // Reset token
  'reset token tidak valid': 'Invalid reset token',
  'reset token tidak valid atau sudah kadaluarsa': 'Invalid or expired reset token',
  'reset token sudah kadaluarsa': 'Reset token has expired',
  // ISO Standard errors
  'iso standard tidak ditemukan atau tidak aktif': 'ISO Standard not found or inactive',
  'iso standard tidak ditemukan': 'ISO Standard not found',
  'kode iso sudah digunakan': 'ISO Code is already in use',
  // SPC Unit errors
  'spc unit tidak ditemukan': 'SPC Unit not found',
  'symbol unit sudah digunakan': 'Unit symbol is already in use',
  // Role / status errors
  'role tidak valid': 'Invalid role',
  'role wajib diisi': 'Role is required',
  'status tidak valid': 'Invalid status',
  'status tidak valid. pilih:': 'Invalid status. Choose from:',
  'role tidak valid. pilih:': 'Invalid role. Choose from:',
  // Validation errors
  'nama wajib diisi': 'Name is required',
  'email wajib diisi': 'Email is required',
  'format email tidak valid': 'Invalid email format',
  'format tanggal tidak valid': 'Invalid date format',
  'timezone tidak valid': 'Invalid timezone',
  'gagal menghapus item': 'Failed to delete item',
  // Registration / auth success
  'registrasi berhasil': 'Registration successful! Check your email for verification code.',
  'logout berhasil': 'Logged out successfully',
  // Profile
  'foto profil berhasil di upload': 'Profile photo uploaded successfully',
  'foto profil berhasil dihapus': 'Profile photo deleted successfully',
  'profil berhasil diupdate': 'Profile updated successfully',
  'tidak ada permintaan ganti email yang aktif': 'No active email change request',
  // Checklist template
  'checklist template tidak ditemukan': 'Checklist template not found',
  'checklist template berhasil dibuat': 'Checklist template created successfully',
  'checklist template berhasil dihapus': 'Checklist template deleted successfully',
  // CAPA Status (System Config)
  'status capa dengan nama yang sama sudah ada': 'A CAPA status with the same name already exists',
  'status capa tidak ditemukan': 'CAPA status not found',
  'order index sudah digunakan oleh status lain': 'Order index is already used by another status',
  // Finding Category (System Config)
  'kategori finding dengan nama yang sama sudah ada': 'A finding category with the same name already exists',
  'kategori finding tidak ditemukan': 'Finding category not found',
  // Finding errors (from FindingController.cs backend)
  'category tidak valid atau tidak aktif': 'Invalid or inactive finding category',
  'finding tidak ditemukan': 'Finding not found',
  // CAPA errors (from CapaController.cs backend)
  'capa tidak ditemukan': 'CAPA not found',
  'pic tidak ditemukan berdasarkan nama': 'PIC user not found by name',
  'user yang ditugaskan tidak valid atau tidak aktif': 'Assigned user is invalid or inactive',
  'status closed tidak ditemukan': 'Closed status configuration not found',
  "status 'open' tidak ditemukan": "Open status configuration not found",
  // Audit & Schedule errors (from AuditPlanController.cs backend)
  'session tidak ditemukan': 'Audit session not found',
  'schedule yang sudah memiliki sesi audit tidak bisa dihapus': 'Schedules with existing audit sessions cannot be deleted.',
  'jadwal (clause:': 'Schedule cannot be modified because the audit is already completed.',
  'tidak dapat diubah karena audit sudah selesai': 'Cannot be modified because the audit is already completed.',
  'scheduleddate untuk clause': 'Scheduled date is required.',
  'auditor dengan nama': 'Auditor not found',
  'audit plan tidak ditemukan': 'Audit plan not found',
  'audit plan berhasil dibuat': 'Audit plan created successfully',
  'audit plan berhasil diupdate': 'Audit plan updated successfully',
  'audit plan berhasil dihapus': 'Audit plan deleted successfully',
  'akun tidak aktif. hubungi administrator': 'Account is inactive. Please contact your administrator',
  // Upload errors (from UploadController.cs & FileValidationService.cs backend)
  'response tidak ditemukan': 'Audit response record not found',
  'upload evidence hanya untuk jawaban pass': 'Evidence upload is only available for PASS responses',
  'file tidak boleh kosong': 'File cannot be empty',
  'ukuran file maksimal 10 mb': 'File size must not exceed 10 MB',
  'ukuran file melebihi batas maksimal': 'File size exceeds maximum allowed limit',
  'ekstensi file tidak diizinkan': 'File extension is not allowed. Allowed types: .jpg, .jpeg, .png, .pdf',
  'file tidak sesuai dengan tipe yang dideklarasikan': 'File content does not match allowed types',
  'tipe file tidak sesuai dengan kontennya': 'File content does not match allowed types',
  'gagal menyimpan file': 'Failed to save file',
  'file evidence berhasil di-upload': 'Evidence file uploaded successfully',
  // User Management Admin errors
  'tidak dapat mengubah role user yang tidak aktif': 'Cannot change the role of an inactive user. Please activate the user first.',
  'admin tidak dapat mengubah role dirinya sendiri': 'Admins cannot change their own role.',
  'admin tidak dapat mengubah role admin lain': 'Admins cannot change the role of another Admin.',
  'tidak dapat mengubah role user menjadi admin': 'Cannot change user role to Admin.',
  'admin tidak dapat menonaktifkan dirinya sendiri': 'Admins cannot deactivate their own account.',
  'admin tidak dapat menonaktifkan admin lain': 'Admins cannot deactivate another Admin.',
  'admin tidak dapat mengubah status dirinya sendiri': 'Admins cannot change their own status.',
  'admin tidak dapat mengubah status admin lain': 'Admins cannot change the status of another Admin.',
  'data user berhasil diupdate': 'User data updated successfully',
  'role user berhasil diupdate': 'User role updated successfully',
  'status user berhasil diupdate': 'User status updated successfully',
  // ISO & SPC
  'nama unit sudah digunakan': 'Unit name is already in use',
  'iso standard berhasil diupdate': 'ISO Standard updated successfully',
  'spc unit berhasil diupdate': 'SPC Unit updated successfully',
  'file harus berformat .xlsx atau .xls': 'File must be in .xlsx or .xls format',
  'lsl harus lebih kecil dari usl': 'LSL must be less than USL',
  'productname wajib diisi': 'Product name is required',
  'data minimal 2 nilai untuk analisis spc': 'At least 2 data values are required for SPC analysis',
  'analisis spc tidak ditemukan': 'SPC analysis not found',
  'format id tidak valid': 'Invalid ID format',
  // Audit session & responses
  'sesi audit tidak ditemukan': 'Audit session not found',
  'session sudah selesai, jawaban tidak bisa diubah': 'Audit session is already completed, responses cannot be modified.',
  'jawaban berhasil disimpan': 'Response saved successfully',
  'tidak ada foto profil yang bisa dihapus': 'No profile photo to delete',
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
      if (typeof data.detail === 'string') {
        data.detail = translateIndoMessage(data.detail) || data.detail;
      }
      if (data.errors && typeof data.errors === 'object') {
        for (const key of Object.keys(data.errors)) {
          if (Array.isArray(data.errors[key])) {
            data.errors[key] = data.errors[key].map((m: any) =>
              typeof m === 'string' ? translateIndoMessage(m) || m : m
            );
          }
        }
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

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axios_instance;