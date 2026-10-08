import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Briefcase } from 'lucide-react';
import { register } from '../api/auth_api';
import AuthBrandPanel from './auth_brand_panel';

const ROLE_OPTIONS = [
  { value: 'AuditorInternal', label: 'Auditor Internal' },
  { value: 'QualityManager', label: 'Quality Manager' },
] as const;

const inputClass = "w-full pl-10 pr-4 py-3 border border-[#cbd5e1] rounded-lg bg-white text-[#1f2937] text-sm outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10";
const labelClass = "text-[#374151] text-sm font-medium mb-1.5 block text-left";
const iconClass = "absolute left-3.5 text-[#64748b] pointer-events-none";

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
      navigate('/verify-otp', { state: { email, fromSignup: true } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pendaftaran gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <AuthBrandPanel />

      <div className="flex flex-col justify-center w-full max-w-sm mx-auto px-8 py-10">
        <h2 className="text-[#0f2c52] text-[28px] font-bold mb-6 text-left">Sign Up</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
          <label className={labelClass}>Username</label>
          <div className="relative flex items-center mb-4">
            <User size={16} className={iconClass} />
            <input type="text" placeholder="Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} />
          </div>

          <label className={labelClass}>Work Email</label>
          <div className="relative flex items-center mb-4">
            <Mail size={16} className={iconClass} />
            <input type="email" placeholder="name@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          </div>

          <label className={labelClass}>Password</label>
          <div className="relative flex items-center mb-4">
            <Lock size={16} className={iconClass} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-3 border border-[#cbd5e1] rounded-lg bg-white text-[#1f2937] text-sm outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10"
            />
            <button type="button" className="absolute right-3.5 text-[#64748b] hover:text-[#0f2c52] bg-transparent border-none cursor-pointer p-0 flex items-center" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <label className={labelClass}>Password Verification</label>
          <div className="relative flex items-center mb-4">
            <Lock size={16} className={iconClass} />
            <input type={showPassword ? 'text' : 'password'} placeholder="******" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} />
          </div>

          <label className={labelClass}>Role</label>
          <div className="relative flex items-center mb-4">
            <Briefcase size={16} className={iconClass} />
            <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-600 text-sm mb-2 text-left">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-[#0f2c52] hover:bg-[#0c2444] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg mt-2 flex items-center justify-center gap-2 transition-colors text-sm tracking-wide">
            {loading ? 'Signing up...' : 'SIGN UP'}
          </button>
        </form>

        <Link to="/login" className="flex items-center gap-1.5 mt-5 text-[#475569] text-sm font-medium no-underline hover:text-[#0f2c52]">
          ← Back
        </Link>
      </div>
    </div>
  );
}