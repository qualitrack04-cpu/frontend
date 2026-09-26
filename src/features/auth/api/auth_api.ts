import axios_instance from "../../../shared/api/axios_instance";

interface LoginPayload {
  email: string;
  password: string;
}

interface ResendOtpPayload {
  email: string;
}

interface LoginResponse {
  token: string;
  role: string;
  fullName: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await axios_instance.post('/Auth/login', payload);
  return response.data;
}

// ---------- Register & Email Verification ----------
interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export async function register(payload: RegisterPayload) {
  const response = await axios_instance.post('/Auth/register', payload);
  return response.data;
}

interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export async function verifyEmail(payload: VerifyEmailPayload) {
  const response = await axios_instance.post('/Auth/verify-email', payload);
  return response.data;
}

export async function resendOtp(payload: ResendOtpPayload ) {
  const response = await axios_instance.post('/Auth/resend-otp', payload);
  return response.data;
}

// ---------- Login & Session ----------
export async function logout() {
  const response = await axios_instance.post('/Auth/logout');
  return response.data;
}

export async function whoami() {
  const response = await axios_instance.get('/Auth/whoami');
  return response.data;
}

// ---------- Forgot Password Flow ----------
export async function forgotPasswordRequestOtp(payload: { email: string }) {
  const response = await axios_instance.post('/Auth/forgot-password/request-otp', payload);
  return response.data;
}

interface VerifyOtpResponse {
  message: string;
  resetToken: string; // token sementara untuk reset password
}

export async function forgotPasswordVerifyOtp(payload: { email: string; otp: string }): Promise<VerifyOtpResponse> {
  const response = await axios_instance.post('/Auth/forgot-password/verify-otp', payload);
  return response.data;
}

export async function forgotPasswordReset(payload: { 
  email: string; 
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const response = await axios_instance.post('/Auth/forgot-password/reset', payload);
  return response.data;
}

export interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  profilePhotoUrl: string | null;
}

export async function getProfile(): Promise<ProfileData> {
  const response = await axios_instance.get('/Auth/profile');
  return response.data;
}

interface UpdateProfilePayload {
  fullName: string;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await axios_instance.put('/Auth/update-profile', payload);
  return response.data;
}

export async function changePassword(payload: { newPassword: string; confirmPassword: string }) {
  const response = await axios_instance.post('/Auth/change-password', payload);
  return response.data;
}

export async function uploadProfilePhoto(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios_instance.post('/Auth/upload-profile-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// ---------- Email Change ----------
export async function requestEmailChangeOtp(payload: { newEmail: string }) {
  const response = await axios_instance.post('/Auth/request-email-change-otp', payload);
  return response.data;
}

export async function verifyEmailChange(payload: { newEmail: string; otp: string }) {
  const response = await axios_instance.post('/Auth/verify-email-change', payload);
  return response.data;
}

// ---------- Data referensi lain ----------
export async function getAuditors() {
  const response = await axios_instance.get('/Auth/auditors');
  return response.data;
}

export async function getUsers() {
  const response = await axios_instance.get('/Auth/users');
  return response.data;
}

export interface PicCandidate {
  id: string;
  fullName: string;
}

export async function getPicCandidates(): Promise<PicCandidate[]> {
  const response = await axios_instance.get<{ data: PicCandidate[] }>('/Auth/pic-candidates');
  return response.data.data;
}