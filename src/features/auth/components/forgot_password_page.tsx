import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useForgotPasswordFlow } from '../hooks/use_forgot_password_flow';
import AuthBrandPanel from './auth_brand_panel';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { sendOtp, loading, error } = useForgotPasswordFlow();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      await sendOtp(email);
      navigate('/verify-otp', { state: { email } });
    } catch{
      
    }
  };

  return (
    <div className="auth-page auth-page--reversed">
      <AuthBrandPanel />

      <div className="auth-card">
        <div className="auth-intro">
          <h2>Forget Password?</h2>
          <p>Enter your registered work email below. We will send you a OTP Code to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-with-icon">
            <Mail size={16} className="input-icon-left" />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Sending...' : 'SEND OTP CODE'}
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