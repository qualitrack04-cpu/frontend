import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordRequestOtp, forgotPasswordReset, forgotPasswordVerifyOtp } from '../api/auth_api';

export function useForgotPasswordFlow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Step 1: kirim email, minta OTP dikirim
  const sendOtp = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await forgotPasswordRequestOtp({ email });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim OTP.');
      throw err; // supaya komponen tahu gagal dan tidak lanjut navigate
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verifikasi OTP yang diinput user
  const submitOtp = async (email: string, otp: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const result = await forgotPasswordVerifyOtp({ email, otp });
      return result.resetToken;
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Kode OTP salah atau kadaluarsa.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Step 3: kirim password baru
  const submitNewPassword = async (
    email: string,
    resetToken: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      await forgotPasswordReset({ email, resetToken, newPassword, confirmPassword });
      navigate('/login'); // selesai, kembali ke halaman login
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Gagal mengubah password.');
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    sendOtp,
    submitOtp,
    submitNewPassword,
  };
}