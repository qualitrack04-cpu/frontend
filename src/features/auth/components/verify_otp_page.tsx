import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useForgotPasswordFlow } from '../hooks/use_forgot_password_flow';
import { verifyEmail, resendOtp as resendSignupOtp } from '../api/auth_api';
import AuthBrandPanel from './auth_brand_panel';
import splashLogo from '../../../assets/splash.png';

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
      setLocalError(err.response?.data?.message ?? 'Failed to resend OTP.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      setLocalError(`Enter ${OTP_LENGTH}-digit OTP code.`);
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
      setLocalError(err.response?.data?.message ?? 'Invalid or expired OTP code.');
    } finally {
      setLocalLoading(false);
    }
  };

  const isBusy = loading || localLoading;
  const shownError = localError ?? error;

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-slate-50 lg:bg-white [&_*]:box-border">
      {/* ── Left: Form area centered in left white area ── */}
      <div className="flex flex-1 lg:w-[46%] lg:max-w-[46%] flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 z-10 min-h-screen">
        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl sm:shadow-2xl border border-slate-100 p-6 sm:p-8 text-center">
          {/* Logo on Mobile/Tablet */}
          <div className="flex justify-center mb-5 lg:hidden">
            <img
              src={splashLogo}
              alt="QualiTrack"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </div>

          <div className="text-[#0f2c52] text-2xl sm:text-[27px] font-bold !m-0 !mb-2.5 text-center !tracking-normal">
            Enter Verification Code
          </div>
          <p className="text-[13.5px] sm:text-[14px] text-[#64748b] text-center leading-relaxed max-w-[340px] mx-auto !m-0 !mb-6">
            We have sent a {OTP_LENGTH}-digit verification code to your registered work email
            <span className="block font-semibold text-[#0f2c52] mt-1">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-0 w-full">
            {/* OTP digit boxes */}
            <div className="flex justify-between gap-2.5 sm:gap-3.5 mb-5">
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
                  className="w-13 h-13 sm:w-15 sm:h-15 text-center text-xl sm:text-2xl font-bold bg-[#f8fafc] border border-slate-200 rounded-xl text-[#0f2c52] outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10 focus:bg-white shadow-xs"
                />
              ))}
            </div>

            {/* Resend timer left-aligned with boxes */}
            <div className="text-left mb-6">
              <span className="text-[13px] text-[#64748b]">
                {secondsLeft > 0 ? (
                  <>Resend code in <span className="font-medium text-[#475569]">{formattedTime}</span></>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-[#1e6fd9] hover:underline font-semibold bg-transparent border-none cursor-pointer p-0 text-[13px]"
                  >
                    Resend code
                  </button>
                )}
              </span>
            </div>

            {shownError && (
              <p className="text-red-600 text-sm mb-4 text-center">{shownError}</p>
            )}

            <button
              type="submit"
              disabled={isBusy}
              className="w-full bg-[#0b3558] hover:bg-[#082843] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm tracking-wide shadow-xs cursor-pointer border-none"
            >
              {isBusy ? 'VERIFYING...' : 'VERIFY & PROCEED'}
            </button>
          </form>

          {/* Divider line */}
          <div className="w-full border-t border-slate-200 mt-6 mb-5" />

          {/* Back button */}
          <div className="flex justify-center">
            <Link
              to={fromSignup ? '/signup' : '/forgot-password'}
              className="text-[#64748b] hover:text-[#0f2c52] font-medium text-[14px] no-underline flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right: Brand Panel ── */}
      <AuthBrandPanel side="right" />
    </div>
  );
}
