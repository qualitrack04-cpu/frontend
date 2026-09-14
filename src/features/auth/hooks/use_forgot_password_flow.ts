import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword, resendOtp as resendOtpApi } from '../api/auth_api';

type Step = 'email' | 'otp' | 'reset';

export function useForgotPasswordFlow() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const sendOtp = async (inputEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      await forgotPassword({ email: inputEmail });
      setEmail(inputEmail); 
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim kode OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      await resendOtpApi({ email });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang kode OTP.');
    } finally {
      setLoading(false);
    }
  };

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

  const submitNewPassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      await resetPassword({ email, newPassword });
      navigate('/login'); 
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
    resendOtp,
    submitOtp,
    submitNewPassword,
  };
}