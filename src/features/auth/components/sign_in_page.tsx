import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/use_auth';
import AuthBrandPanel from './auth_brand_panel';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="auth-page">
      <AuthBrandPanel />

      <div className="auth-card">
        <h2>Sign In</h2>

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Email</label>
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

          <div className="label-row">
            <label className="auth-label">Password</label>
            <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
          </div>
          <div className="input-with-icon">
            <Lock size={16} className="input-icon-left" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="input-icon-right"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : (
              <>
                SIGN IN <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link-bold">SIGN UP</Link>
        </p>
      </div>
    </div>
  );
}