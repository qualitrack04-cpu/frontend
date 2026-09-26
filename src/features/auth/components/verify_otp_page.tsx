import { useState, useRef, useEffect} from 'react';
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
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const { submitOtp, sendOtp, loading, error } = useForgotPasswordFlow();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email ?? '';
  const fromSignup: boolean = location.state?.fromSignup ?? false;


  useEffect(() =>{
    if (!email) navigate(fromSignup ? '/signup' : '/forgot-password', {replace: true});
  }, [email, fromSignup, navigate]);

  // Countdown "Resend code in 00:59"
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

    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
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
        await resendSignupOtp ({email});
      }else {
        await sendOtp(email);
      }
      setSecondsLeft(RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } catch (err: any){
      setLocalError(err.response?.data?.message ?? 'gagal mengirim ualng otp.');
    } finally{
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
        await verifyEmail({email, otp});
        navigate('/login', {replace: true});
      } else {
        const resetToken = await submitOtp(email, otp);
        navigate('/reset-password', { state: { email, resetToken}});
      }
    } catch (err: any){
      setLocalError(err.response?.data?.message ?? 'Kode OTP salah atau kadaluarsa.');
    }finally{
      setLocalLoading(false);
    }

  };

  const isBusy = loading || localLoading;
  const shownError = localError ?? error;

  return (
    <div className="auth-page auth-page--reversed">
      <AuthBrandPanel />

      <div className="auth-card">
        <div className="auth-intro">
          <h2>Enter Verification Code</h2>
          <p>
            We have sent a {OTP_LENGTH}-digit verification code to your registered work email{' '}
            <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-box"
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
              />
            ))}
          </div>

          <p className="resend-text">
            {secondsLeft > 0 ? (
              `Resend code in ${formattedTime}`
            ) : (
              <button type="button" className="resend-link" onClick={handleResend}>
                Resend code
              </button>
            )}
          </p>

          {shownError && <p className="error-text">{shownError}</p>}

          <button type="submit" className="btn-auth-submit" disabled={isBusy}>
            {isBusy ? 'Verifying...' : 'VERIFY & PROCEED'}
          </button>
        </form>

        <hr className="auth-divider" />
        <Link to="/login" className="back-link">
          <ArrowLeft size={14} /> Back
        </Link>
      </div>
    </div>
  );
}