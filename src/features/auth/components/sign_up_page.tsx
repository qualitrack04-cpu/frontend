import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Briefcase } from 'lucide-react';
import { register } from '../api/auth_api';
import AuthBrandPanel from './auth_brand_panel';

const ROLE_OPTIONS = [
  { value: 'AuditorInternal', label: 'Auditor Internal' },
  { value: 'QualityManager', label: 'Quality Manager' },
  { value: 'Auditee', label: 'Auditee' },
  // { value: 'Admin', label: 'Admin' }, // Admin didaftarkan secara manual oleh sysadmin
] as const;

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('AuditorInternal');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Password dan Password Verification tidak sama.');
      return;
    }

    setLoading(true);
    try {
      await register({ fullName, email, password, role });
      navigate('/verify-otp', { state: { email, fromSignup: true } }); // navigasi ke halaman verifikasi OTP
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pendaftaran gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBrandPanel />

      <div className="auth-card">
        <h2>Sign Up</h2>

        <form onSubmit={handleSubmit}>
          <label className="auth-label-plain">Username</label>
          <div className="input-with-icon">
            <User size={16} className="input-icon-left" />
            <input
              type="text"
              placeholder="Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <label className="auth-label-plain">Work Email</label>
          <div className="input-with-icon">
            <Mail size={16} className="input-icon-left" />
            <input
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label className="auth-label-plain">Password</label>
          <div className="input-with-icon">
            <Lock size={16} className="input-icon-left" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='******'
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

          <label className="auth-label-plain">Password Verification</label>
          <div className="input-with-icon">
            <Lock size={16} className="input-icon-left" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='******'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <label className="auth-label-plain">Role</label>
          <div className="input-with-icon">
            <Briefcase size={16} className="input-icon-left" />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Signing up...' : 'SIGN UP'}
          </button>
        </form>

        <Link to="/login" className="back-link">← Back</Link>
      </div>
    </div>
  );
}