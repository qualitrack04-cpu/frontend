import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword } from '../api/auth_api';

type Step = 'email' | 'otp' | 'reset';

export function useForgotPasswordFlow() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Step 1: kirim email, minta OTP dikirim
  const sendOtp = async (inputEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      await forgotPassword({ email: inputEmail });
      setEmail(inputEmail); // simpan email untuk dipakai di step berikutnya
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim kode OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verifikasi OTP yang diinput user
  const submitOtp = async (otp: string) => {
    setLoading(true);
    setError(null);
    try {
      await verifyOtp({ email, otp });
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kode OTP salah atau kadaluarsa.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: kirim password baru
  const submitNewPassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      await resetPassword({ email, newPassword });
      navigate('/login'); // selesai, kembali ke halaman login
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    email,
    loading,
    error,
    sendOtp,
    submitOtp,
    submitNewPassword,
  };
}