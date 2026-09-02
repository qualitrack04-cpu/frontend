import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/use_auth';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <h1>QualiTrack</h1>
        <p>Checklist Today, Better tomorrow</p>
        <h2>Quality & Audit Management, Simplified</h2>
      </div>

      <div className="auth-card">
        <h2>Sign In</h2>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="label-row">
            <label>Password</label>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}