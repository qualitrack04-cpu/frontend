import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useForgotPasswordFlow } from '../hooks/use_forgot_password_flow';
import { verifyEmail, resendOtp as resendSignupOtp } from '../api/auth_api';
import AuthBrandPanel from './auth_brand_panel';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

export default function VerifyOtpPage() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const { submitOtp, sendOtp, loading, error } = useForgotPasswordFlow();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email ?? '';
  const fromSignup: boolean = location.state?.fromSignup ?? false;

  useEffect(() => {
    if (!email) navigate(fromSignup ? '/signup' : '/forgot-password', { replace: true });
  }, [email, fromSignup, navigate]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(
    secondsLeft % 60
  ).padStart(2, '0')}`;

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0)
      inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => (next[i] = char));
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    setLocalError(null);
    try {
      if (fromSignup) {
        setLocalLoading(true);
        await resendSignupOtp({ email });
      } else {
        await sendOtp(email);
      }
      setSecondsLeft(RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      setLocalError(err.response?.data?.message ?? 'Gagal mengirim ulang OTP.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      setLocalError(`Masukkan ${OTP_LENGTH} digit kode OTP.`);
      return;
    }
    setLocalError(null);
    try {
      if (fromSignup) {
        setLocalLoading(true);
        await verifyEmail({ email, otp });
        navigate('/login', { replace: true });
      } else {
        const resetToken = await submitOtp(email, otp);
        navigate('/reset-password', { state: { email, resetToken } });
      }
    } catch (err: any) {
      setLocalError(err.response?.data?.message ?? 'Kode OTP salah atau kadaluarsa.');
    } finally {
      setLocalLoading(false);
    }
  };

  const isBusy = loading || localLoading;
  const shownError = localError ?? error;

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#f3f4f6]">
      {/* ── Left: Form area ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 z-10">
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 sm:p-[40px]">
          <div className="text-[#0f2c52] text-[28px] sm:text-[32px] font-bold !m-0 !mb-2 text-center !tracking-normal">
            Verification Code
          </div>
          <p className="text-sm text-[#475569] text-center mb-8 leading-relaxed max-w-[280px] mx-auto !m-0 !mt-2">
            We have sent a {OTP_LENGTH}-digit code to{' '}
            <span className="font-semibold text-[#0f2c52]">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-0">
            {/* OTP digit boxes */}
            <div className="flex gap-4 justify-center mb-6 mt-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  ref={(el) => { inputsRef.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-[56px] h-[56px] text-center text-[22px] font-bold bg-slate-50 border border-slate-200 rounded-xl text-[#0f2c52] outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10 focus:bg-white shadow-sm"
                />
              ))}
            </div>

            {/* Resend timer */}
            <p className="text-sm text-[#475569] mb-5 text-center">
              {secondsLeft > 0 ? (
                <>Resend code in <span className="font-semibold">{formattedTime}</span></>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-[#1e6fd9] font-bold bg-transparent border-none cursor-pointer p-0 text-sm"
                >
                  Resend code
                </button>
              )}
            </p>

            {shownError && (
              <p className="text-red-600 text-sm mb-4 text-center">{shownError}</p>
            )}

            <button
              type="submit"
              disabled={isBusy}
              className="w-full bg-[#0f2c52] hover:bg-[#0c2444] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm tracking-wide"
            >
              {isBusy ? 'VERIFYING...' : 'VERIFY & PROCEED'}
            </button>
          </form>

          <div className="flex justify-center mt-6">
            <Link
              to={fromSignup ? '/signup' : '/forgot-password'}
              className="text-[#475569] hover:text-[#0f2c52] font-medium text-[13px] no-underline flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right: Brand Panel ── */}
      <AuthBrandPanel side="right" />
    </div>
  );
}