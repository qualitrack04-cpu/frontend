import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useForgotPasswordFlow } from '../hooks/use_forgot_password_flow';
import AuthBrandPanel from './auth_brand_panel';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !resetToken) {
      setLocalError('Sesi reset tidak valid. Silakan ulangi dari halaman Forgot Password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Password tidak sama.');
      return;
    }
    try {
      await submitNewPassword(email, resetToken, newPassword, confirmPassword);
      navigate('/login', { replace: true });
    } catch { }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#f3f4f6]">
      {/* ── Left: Form area ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 z-10">
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 sm:p-[40px]">
          <div className="text-[#0f2c52] text-[28px] sm:text-[32px] font-bold !m-0 !mb-2 text-center !tracking-normal">
            Reset Password
          </div>
          <p className="text-sm text-[#475569] text-center mb-8 leading-relaxed max-w-[280px] mx-auto !m-0 !mt-2">
            Enter a new password for your account.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-0">
            {/* New Password */}
            <label className="text-[#475569] text-xs font-bold tracking-widest uppercase mb-1.5 block">
              New Password
            </label>
            <div className="relative flex items-center mb-4">
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

            {/* Password Verification */}
            <label className="text-[#475569] text-xs font-bold tracking-widest uppercase mb-1.5 block">
              Password Verification
            </label>
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