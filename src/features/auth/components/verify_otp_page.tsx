import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForgotPasswordFlow } from '../hooks/use_forgot_password_flow';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const { submitOtp, loading, error } = useForgotPasswordFlow();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitOtp(otp);
    navigate('/reset-password', { state: { email } });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Enter Verification Code</h2>
        <p>We have sent a 4-digit verification code to your registered work email <strong>{email}</strong></p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            maxLength={4}
            placeholder="0000"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'VERIFY & PROCEED'}
          </button>
        </form>

        <Link to="/login" className="back-link">← Back to Sign In</Link>
      </div>
    </div>
  );
}