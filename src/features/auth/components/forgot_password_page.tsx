import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForgotPasswordFlow } from '../hooks/use_forgot_password_flow';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { sendOtp, loading, error } = useForgotPasswordFlow();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendOtp(email);
    navigate('/verify-otp', { state: { email } });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Forget Password?</h2>
        <p>Enter your registered work email below. We will send you a OTP Code to reset your password.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'SEND OTP CODE'}
          </button>
        </form>

        <Link to="/login" className="back-link">← Back to Sign In</Link>
      </div>
    </div>
  );
}