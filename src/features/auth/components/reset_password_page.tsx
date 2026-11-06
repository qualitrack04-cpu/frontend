import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { useForgotPasswordFlow } from '../hooks/use_forgot_password_flow';
import AuthBrandPanel from './auth_brand_panel';
import splashLogo from '../../../assets/splash.png';
import { getPasswordChecks, countPasswordChecks, isPasswordStrong } from '../../../shared/utils/password_policy';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { submitNewPassword, loading, error } = useForgotPasswordFlow();
  const location = useLocation();
  const email = location.state?.email || '';
  const resetToken = location.state?.resetToken || '';
  const navigate = useNavigate();

  // Password Policy Checks
  const passwordChecks = getPasswordChecks(newPassword);
  const criteriaCount = countPasswordChecks(passwordChecks);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !resetToken) {
      setLocalError('Reset session is invalid. Please restart from the Forgot Password page.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (!isPasswordStrong(newPassword)) {
      setLocalError('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character');
      return;
    }
    try {
      await submitNewPassword(email, resetToken, newPassword, confirmPassword);
      navigate('/login', { replace: true });
    } catch { }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-slate-50 lg:bg-white [&_*]:box-border">
      {/* ── Left: Form area ── */}
      <div className="flex flex-1 lg:w-[46%] lg:max-w-[46%] flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 z-10 min-h-screen">
        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl sm:shadow-2xl border border-slate-100 p-6 sm:p-8 text-left">
          {/* Logo on Mobile/Tablet */}
          <div className="flex justify-center mb-5 lg:hidden">
            <img
              src={splashLogo}
              alt="QualiTrack"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </div>

          <div className="text-[#0f2c52] text-2xl sm:text-[28px] md:text-[32px] font-bold !m-0 !mb-2 text-center !tracking-normal">
            Reset Password
          </div>
          <p className="text-sm text-[#475569] text-center mb-6 sm:mb-8 leading-relaxed max-w-[280px] mx-auto !m-0 !mt-2">
            Enter a new password for your account.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-0">
            {/* New Password */}
            <label className="text-[#475569] text-xs font-bold tracking-widest uppercase mb-1.5 block">
              New Password
            </label>
            <div className="relative flex items-center mb-2">
              <Lock size={16} className="absolute left-3.5 text-[#64748b] pointer-events-none" />
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl bg-slate-50 text-[#1f2937] text-sm outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10 focus:bg-white"
              />
              <button
                type="button"
                className="absolute right-3.5 text-[#64748b] hover:text-[#0f2c52] bg-transparent border-none cursor-pointer p-0 flex items-center"
                onClick={() => setShowNew((v) => !v)}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Policy & Strength Indicator (Tampil realtime saat password diketik) */}
            {newPassword.length > 0 && (
              <div className="mb-3 p-2.5 bg-slate-50/90 border border-slate-200/80 rounded-xl transition-all">
                {/* 4 Segmented Strength Bars */}
                <div className="grid grid-cols-4 gap-1.5 mb-1">
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
                        className={`h-1 rounded-full transition-all duration-200 ${
                          isActive ? barColor : 'bg-slate-200'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Strength Label */}
                {strengthLabel && (
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                      Strength
                    </span>
                    <span className={`text-[11.5px] font-bold ${strengthColor}`}>
                      {strengthLabel}
                    </span>
                  </div>
                )}

                {/* 4 Criteria Checklist */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <Check
                      size={12}
                      className={passwordChecks.hasMinLength ? 'text-[#16A34A]' : 'text-slate-300'}
                      strokeWidth={passwordChecks.hasMinLength ? 3 : 2}
                    />
                    <span
                      className={`text-[11px] leading-tight ${
                        passwordChecks.hasMinLength ? 'text-slate-700 font-medium' : 'text-slate-400'
                      }`}
                    >
                      At least 8 chars
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Check
                      size={12}
                      className={passwordChecks.hasUpperLower ? 'text-[#16A34A]' : 'text-slate-300'}
                      strokeWidth={passwordChecks.hasUpperLower ? 3 : 2}
                    />
                    <span
                      className={`text-[11px] leading-tight ${
                        passwordChecks.hasUpperLower ? 'text-slate-700 font-medium' : 'text-slate-400'
                      }`}
                    >
                      Upper & lowercase
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Check
                      size={12}
                      className={passwordChecks.hasNumber ? 'text-[#16A34A]' : 'text-slate-300'}
                      strokeWidth={passwordChecks.hasNumber ? 3 : 2}
                    />
                    <span
                      className={`text-[11px] leading-tight ${
                        passwordChecks.hasNumber ? 'text-slate-700 font-medium' : 'text-slate-400'
                      }`}
                    >
                      At least 1 number
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Check
                      size={12}
                      className={passwordChecks.hasSpecial ? 'text-[#16A34A]' : 'text-slate-300'}
                      strokeWidth={passwordChecks.hasSpecial ? 3 : 2}
                    />
                    <span
                      className={`text-[11px] leading-tight ${
                        passwordChecks.hasSpecial ? 'text-slate-700 font-medium' : 'text-slate-400'
                      }`}
                    >
                      1 special char
                    </span>
                  </div>
                </div>
              </div>
            )}
            {!newPassword && <div className="mb-2" />}

            {/* Password Verification */}
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[#475569] text-xs font-bold tracking-widest uppercase block !m-0">
                Password Verification
              </label>
              {confirmPassword.length > 0 && (
                <span
                  className={`text-[11.5px] font-semibold ${
                    newPassword === confirmPassword ? 'text-[#16A34A]' : 'text-red-500'
                  }`}
                >
                  {newPassword === confirmPassword ? 'Passwords match' : 'Do not match'}
                </span>
              )}
            </div>
            <div className="relative flex items-center mb-4">
              <Lock size={16} className="absolute left-3.5 text-[#64748b] pointer-events-none" />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl bg-slate-50 text-[#1f2937] text-sm outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10 focus:bg-white"
              />
              <button
                type="button"
                className="absolute right-3.5 text-[#64748b] hover:text-[#0f2c52] bg-transparent border-none cursor-pointer p-0 flex items-center"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {(localError || error) && (
              <p className="text-red-600 text-sm mb-2 text-left">{localError || error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f2c52] hover:bg-[#0c2444] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg mt-2 flex items-center justify-center gap-2 transition-colors text-sm tracking-wide"
            >
              {loading ? 'RESETTING...' : 'RESET PASSWORD'}
            </button>
          </form>

          <div className="flex justify-center mt-6">
            <Link
              to="/login"
              className="text-[#475569] hover:text-[#0f2c52] font-medium text-[13px] no-underline flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right: Brand Panel ── */}
      <AuthBrandPanel side="right" />
    </div>
  );
}