import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (newPassword !== confirmPassword) {
      setLocalError('Password tidak sama.');
      return;
    }

    await submitNewPassword(email, resetToken, newPassword, confirmPassword);
    // submitNewPassword otomatis navigate ke /login kalau berhasil (sudah diatur di hook)
  };

  return (
    <div className="auth-page auth-page--reversed">
      <AuthBrandPanel />

      <div className="auth-card">
        <div className="auth-intro">
          <h2>Reset Your Password</h2>
          <p>Enter a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="auth-label-left">New Password</label>
          <div className="input-with-icon">
            <Lock size={16} className="input-icon-left" />
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="input-icon-right"
              onClick={() => setShowNew((v) => !v)}
              aria-label={showNew ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <label className="auth-label-left">Password Verification</label>
          <div className="input-with-icon">
            <Lock size={16} className="input-icon-left" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="input-icon-right"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {(localError || error) && <p className="error-text">{localError || error}</p>}

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Resetting...' : 'RESET'}
          </button>
        </form>

        <hr className="auth-divider" />
        <Link to="/login" className="back-link">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}