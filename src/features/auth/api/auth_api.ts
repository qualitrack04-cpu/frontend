import axios_instance from "../../../shared/api/axios_instance";

interface LoginPayload {
  email: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface VerifyOtpPayload {
  email: string;
  otp: string;
}

interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const response = await axios_instance.post('/auth/forgot-password', payload);
  return response.data;
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  const response = await axios_instance.post('/auth/verify-otp', payload);
  return response.data;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const response = await axios_instance.post('/auth/reset-password', payload);
  return response.data;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await axios_instance.post('/auth/login', payload);
  return response.data;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role: string;
}

export async function register(payload: RegisterPayload) {
  const response = await axios_instance.post('/auth/register', payload);
  return response.data;
}