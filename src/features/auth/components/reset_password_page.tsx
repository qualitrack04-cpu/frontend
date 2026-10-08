import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useForgotPasswordFlow } from '../hooks/use_forgot_password_flow';
import AuthBrandPanel from './auth_brand_panel';

const inputClass = "w-full pl-10 pr-10 py-3 border border-[#cbd5e1] rounded-lg bg-white text-[#1f2937] text-sm outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10";

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
    <div className="flex min-h-screen bg-white flex-row-reverse">
      <AuthBrandPanel />

      <div className="flex flex-col justify-center w-full max-w-sm mx-auto px-8 py-10">
        <h2 className="text-[#0f2c52] text-[28px] font-bold mb-2 text-left">Reset Your Password</h2>
        <p className="text-[#64748b] text-sm mb-6 text-left">Enter a new password for your account.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
          <label className="text-[#374151] text-sm font-medium mb-1.5 block text-left">New Password</label>
          <div className="relative flex items-center mb-4">
            <Lock size={16} className="absolute left-3.5 text-[#64748b] pointer-events-none" />
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={inputClass}
            />
            <button type="button" className="absolute right-3.5 text-[#64748b] hover:text-[#0f2c52] bg-transparent border-none cursor-pointer p-0 flex items-center" onClick={() => setShowNew((v) => !v)} aria-label={showNew ? 'Sembunyikan password' : 'Tampilkan password'}>
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <label className="text-[#374151] text-sm font-medium mb-1.5 block text-left">Password Verification</label>
          <div className="relative flex items-center mb-4">
            <Lock size={16} className="absolute left-3.5 text-[#64748b] pointer-events-none" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
            />
            <button type="button" className="absolute right-3.5 text-[#64748b] hover:text-[#0f2c52] bg-transparent border-none cursor-pointer p-0 flex items-center" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {(localError || error) && <p className="text-red-600 text-sm mb-2 text-left">{localError || error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-[#0f2c52] hover:bg-[#0c2444] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm tracking-wide">
            {loading ? 'Resetting...' : 'RESET PASSWORD'}
          </button>
        </form>

        <hr className="border-t border-[#e2e8f0] my-5" />
        <Link to="/login" className="flex items-center gap-1.5 text-[#475569] text-sm font-medium no-underline hover:text-[#0f2c52]">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}