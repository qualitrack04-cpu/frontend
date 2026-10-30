import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, ShieldCheck, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';
import {
  forgotPasswordRequestOtp,
  forgotPasswordVerifyOtp,
  forgotPasswordReset,
} from '../../auth/api/auth_api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  email: initialEmail,
}: ChangePasswordModalProps) {
  // Step: 1 | 2 | 3 | 'success'
  const [step, setStep] = useState<1 | 2 | 3 | 'success'>(1);

  // Email resolution & masking
  const [resolvedEmail, setResolvedEmail] = useState<string>('');

  // Step 2: 4-digit OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [resetToken, setResetToken] = useState<string>('');
  const [resendSeconds, setResendSeconds] = useState<number>(60);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3: Password creation state
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      setLoading(false);
      setOtpDigits(['', '', '', '']);
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setResendSeconds(60);

      // Determine active email
      let em = initialEmail || '';
      if (!em) {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const parsed = JSON.parse(userStr);
            em = parsed.email || '';
          }
        } catch {
          // Ignore json parse error
        }
      }
      setResolvedEmail(em);
    }
  }, [isOpen, initialEmail]);

  // Countdown timer for OTP resend in Step 2
  useEffect(() => {
    if (step !== 2 || resendSeconds <= 0) return;
    const interval = setInterval(() => {
      setResendSeconds((s) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendSeconds]);

  // Mask email helper (e.g. "na••••••yn@gmail.com")
  const maskEmail = (em: string) => {
    if (!em || !em.includes('@')) return em || 'na••••••yn@gmail.com';
    const [local, domain] = em.split('@');
    if (local.length <= 2) {
      return `${local[0] || 'n'}••••••@${domain}`;
    }
    const firstTwo = local.slice(0, 2);
    const lastTwo = local.slice(-2);
    return `${firstTwo}••••••${lastTwo}@${domain}`;
  };

  const formattedTimer = `${String(Math.floor(resendSeconds / 60)).padStart(2, '0')}:${String(
    resendSeconds % 60
  ).padStart(2, '0')}`;

  // ==========================================
  // HANDLERS
  // ==========================================

  // Step 1: Send Code
  const handleSendCode = async () => {
    if (!resolvedEmail) {
      setError('Email address not found. Please re-login.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await forgotPasswordRequestOtp({ email: resolvedEmail });
      setStep(2);
      setResendSeconds(60);
      setOtpDigits(['', '', '', '']);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: OTP Digit inputs (4-digits strictly)
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    if (digit && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (!pasted) return;
    const next = ['', '', '', ''];
    pasted.split('').forEach((char, i) => {
      next[i] = char;
    });
    setOtpDigits(next);
    otpInputsRef.current[Math.min(pasted.length, 3)]?.focus();
  };

  // Step 2: Resend code
  const handleResendCode = async () => {
    if (resendSeconds > 0 || loading) return;
    setError(null);
    setLoading(true);

    try {
      await forgotPasswordRequestOtp({ email: resolvedEmail });
      setResendSeconds(60);
      setOtpDigits(['', '', '', '']);
      otpInputsRef.current[0]?.focus();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length < 4) {
      setError('Please enter the 4-digit verification code.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await forgotPasswordVerifyOtp({ email: resolvedEmail, otp });
      setResetToken(res.resetToken);
      setStep(3);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Password Strength & Validation
  const hasMinLength = newPassword.length >= 8;
  const hasUpperLower = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const criteriaCount = [hasMinLength, hasUpperLower, hasNumber, hasSpecial].filter(Boolean).length;
  const isMatch = Boolean(confirmPassword && newPassword === confirmPassword);
  const canUpdatePassword = criteriaCount === 4 && isMatch && !loading;

  let strengthLabel = '';
  let strengthColor = 'text-slate-400';
  if (criteriaCount === 4) {
    strengthLabel = 'Strong';
    strengthColor = 'text-[#16A34A]';
  } else if (criteriaCount === 3) {
    strengthLabel = 'Good';
    strengthColor = 'text-amber-500';
  } else if (criteriaCount === 2) {
    strengthLabel = 'Fair';
    strengthColor = 'text-orange-500';
  } else if (criteriaCount === 1) {
    strengthLabel = 'Weak';
    strengthColor = 'text-red-500';
  }

  // Step 3: Submit New Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdatePassword) return;

    setError(null);
    setLoading(true);

    try {
      await forgotPasswordReset({
        email: resolvedEmail,
        resetToken,
        newPassword,
        confirmPassword,
      });
      setStep('success');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/40 backdrop-blur-xs p-4 sm:p-6 flex items-center justify-center min-h-screen animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[440px] my-auto overflow-hidden p-6 sm:p-8 relative box-border">
        {step === 'success' ? (
          /* ============================================================
             SUCCESS SCREEN (Image 4)
             ============================================================ */
          <div className="flex flex-col items-center justify-center text-center py-4 px-2">
            <div className="w-20 h-20 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mb-6 shadow-xs animate-[scaleIn_0.2s_ease-out]">
              <Check size={40} strokeWidth={3} />
            </div>

            <h2 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight m-0 mb-2">
              Password updated successfully
            </h2>
            <p className="text-[13.5px] sm:text-[14px] text-slate-500 leading-relaxed max-w-[320px] m-0 mb-7 font-normal">
              Your password has been reset successfully. You can now continue securely.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors shadow-sm border-none cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            {/* ============================================================
               STEPPER HEADER (Steps 1, 2, 3)
               ============================================================ */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {/* 3 Step Indicator Bars */}
                <div className="flex items-center gap-1.5">
                  <div
                    className={`h-1.5 w-10 sm:w-11 rounded-full transition-all duration-300 ${
                      step >= 1 ? 'bg-[#2563EB]' : 'bg-slate-200'
                    }`}
                  />
                  <div
                    className={`h-1.5 w-10 sm:w-11 rounded-full transition-all duration-300 ${
                      step >= 2 ? 'bg-[#2563EB]' : 'bg-slate-200'
                    }`}
                  />
                  <div
                    className={`h-1.5 w-10 sm:w-11 rounded-full transition-all duration-300 ${
                      step === 3 ? 'bg-[#2563EB]' : 'bg-slate-200'
                    }`}
                  />
                </div>
                <span className="text-[13px] font-medium text-slate-500 ml-2">
                  Step {step} of 3
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ============================================================
               STEP 1: Verify your identity (Image 1)
               ============================================================ */}
            {step === 1 && (
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-5">
                  <ShieldCheck size={26} strokeWidth={2.2} />
                </div>

                <h2 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight m-0 mb-2">
                  Verify your identity
                </h2>
                <p className="text-[13.5px] sm:text-[14px] text-slate-500 leading-relaxed m-0 mb-6 font-normal">
                  To change your password, we'll send a 4-digit one-time code (OTP) to your registered email.
                </p>

                {/* Masked Email Card */}
                <div className="border border-slate-200/90 bg-[#F8FAFC] rounded-2xl px-4 py-3.5 flex items-center gap-3.5 mb-6">
                  <Mail size={20} className="text-[#2563EB] shrink-0" strokeWidth={2} />
                  <span className="text-[14.5px] font-medium text-slate-800 break-all">
                    {maskEmail(resolvedEmail)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-[14px] hover:bg-slate-50 transition-colors bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-1/2 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors shadow-sm border-none cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Code'}
                  </button>
                </div>

                <p className="text-[12.5px] text-slate-400 text-center mt-5 m-0 font-normal">
                  The code is valid for 5 minutes.
                </p>
              </div>
            )}

            {/* ============================================================
               STEP 2: Enter verification code (Image 2 - Exactly 4 digits)
               ============================================================ */}
            {step === 2 && (
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-5">
                  <Mail size={24} strokeWidth={2.2} />
                </div>

                <h2 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight m-0 mb-2">
                  Enter verification code
                </h2>
                <p className="text-[13.5px] sm:text-[14px] text-slate-500 leading-relaxed m-0 mb-6 font-normal">
                  We sent a 4-digit code to{' '}
                  <span className="font-semibold text-slate-800">{maskEmail(resolvedEmail)}</span>.
                </p>

                {/* 4-digit Input Boxes */}
                <div
                  className="flex items-center justify-center gap-3 sm:gap-4 mb-5"
                  onPaste={handleOtpPaste}
                >
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputsRef.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border text-center text-2xl font-bold text-slate-900 outline-none transition-all ${
                        digit
                          ? 'border-[#2563EB] ring-4 ring-[#2563EB]/15 bg-white'
                          : 'border-slate-200 bg-slate-50/50 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 focus:bg-white'
                      }`}
                    />
                  ))}
                </div>

                {/* Resend Code row */}
                <div className="flex items-center justify-between mb-7 px-1">
                  <span className="text-[13px] text-slate-500 font-normal">
                    Resend code in{' '}
                    <strong className="text-slate-900 font-bold">{formattedTimer}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendSeconds > 0 || loading}
                    className="text-[13px] font-semibold text-[#2563EB] hover:underline bg-transparent border-none cursor-pointer p-0 disabled:text-slate-300 disabled:no-underline disabled:cursor-not-allowed"
                  >
                    Resend code
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError(null);
                    }}
                    className="w-1/2 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-[14px] hover:bg-slate-50 transition-colors bg-white cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpDigits.join('').length < 4 || loading}
                    className="w-1/2 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors shadow-sm border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================
               STEP 3: Create new password (Image 3)
               ============================================================ */}
            {step === 3 && (
              <form onSubmit={handleUpdatePassword}>
                <h2 className="text-[22px] sm:text-[24px] font-bold text-slate-900 tracking-tight m-0 mb-2">
                  Create new password
                </h2>
                <p className="text-[13.5px] sm:text-[14px] text-slate-500 leading-relaxed m-0 mb-6 font-normal">
                  Choose a strong password you don't use anywhere else.
                </p>

                {/* Field: NEW PASSWORD */}
                <div className="mb-4">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                    NEW PASSWORD
                  </label>
                  <div className="relative flex items-center mb-2.5">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 outline-none text-[15px] text-slate-900 transition-all bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0 flex items-center"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* 4 Segmented Strength Bars */}
                  <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                    {[1, 2, 3, 4].map((level) => {
                      const isActive = criteriaCount >= level;
                      const barColor =
                        criteriaCount === 4
                          ? 'bg-[#16A34A]'
                          : criteriaCount === 3
                          ? 'bg-amber-400'
                          : criteriaCount === 2
                          ? 'bg-orange-400'
                          : 'bg-red-400';

                      return (
                        <div
                          key={level}
                          className={`h-1.5 rounded-full transition-all duration-200 ${
                            isActive ? barColor : 'bg-slate-200'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Strength Label */}
                  {strengthLabel && (
                    <span className={`text-[12px] font-bold block mb-3.5 ${strengthColor}`}>
                      {strengthLabel}
                    </span>
                  )}
                  {!strengthLabel && <div className="h-4 mb-2" />}

                  {/* Checklist Criteria */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-5">
                    <div className="flex items-center gap-2">
                      <Check
                        size={14}
                        className={hasMinLength ? 'text-[#16A34A]' : 'text-slate-300'}
                        strokeWidth={hasMinLength ? 3 : 2}
                      />
                      <span
                        className={`text-[12.5px] ${
                          hasMinLength ? 'text-slate-700 font-medium' : 'text-slate-400'
                        }`}
                      >
                        At least 8 characters
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check
                        size={14}
                        className={hasUpperLower ? 'text-[#16A34A]' : 'text-slate-300'}
                        strokeWidth={hasUpperLower ? 3 : 2}
                      />
                      <span
                        className={`text-[12.5px] ${
                          hasUpperLower ? 'text-slate-700 font-medium' : 'text-slate-400'
                        }`}
                      >
                        Upper & lowercase
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check
                        size={14}
                        className={hasNumber ? 'text-[#16A34A]' : 'text-slate-300'}
                        strokeWidth={hasNumber ? 3 : 2}
                      />
                      <span
                        className={`text-[12.5px] ${
                          hasNumber ? 'text-slate-700 font-medium' : 'text-slate-400'
                        }`}
                      >
                        At least one number
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check
                        size={14}
                        className={hasSpecial ? 'text-[#16A34A]' : 'text-slate-300'}
                        strokeWidth={hasSpecial ? 3 : 2}
                      />
                      <span
                        className={`text-[12.5px] ${
                          hasSpecial ? 'text-slate-700 font-medium' : 'text-slate-400'
                        }`}
                      >
                        One special character
                      </span>
                    </div>
                  </div>
                </div>

                {/* Field: CONFIRM PASSWORD */}
                <div className="mb-6">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative flex items-center mb-2">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 outline-none text-[15px] text-slate-900 transition-all bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-0 flex items-center"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div className="flex items-center gap-1.5 text-[12.5px] font-medium">
                      {isMatch ? (
                        <>
                          <Check size={14} className="text-[#16A34A]" strokeWidth={3} />
                          <span className="text-[#16A34A]">Passwords match</span>
                        </>
                      ) : (
                        <span className="text-red-500">Passwords do not match</span>
                      )}
                    </div>
                  )}
                  {!confirmPassword && <div className="h-4" />}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-[14px] hover:bg-slate-50 transition-colors bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canUpdatePassword}
                    className="w-1/2 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors shadow-sm border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
