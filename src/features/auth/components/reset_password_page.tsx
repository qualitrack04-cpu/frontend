import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useForgotPasswordFlow } from '../hooks/use_forgot_password_flow';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const { submitNewPassword, loading, error } = useForgotPasswordFlow();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (newPassword !== confirmPassword) {
      setLocalError('Password tidak sama.');
      return;
    }

    await submitNewPassword(newPassword);
    // submitNewPassword otomatis navigate ke /login kalau berhasil (sudah diatur di hook)
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Reset Your Password</h2>
        <p>Enter a new password for your account.</p>

        <form onSubmit={handleSubmit}>
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label>Password Verification</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {(localError || error) && <p className="error-text">{localError || error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'RESET'}
          </button>
        </form>

        <Link to="/login" className="back-link">← Back to Sign In</Link>
      </div>
    </div>
  );
}