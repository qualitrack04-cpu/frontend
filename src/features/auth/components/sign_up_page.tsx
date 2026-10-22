import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Briefcase } from 'lucide-react';
import { register } from '../api/auth_api';
import AuthBrandPanel from './auth_brand_panel';

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'AuditorInternal', label: 'Auditor Internal' },
  { value: 'QualityManager', label: 'Quality Manager' },
] as const;

const labelClass =
  'block text-left text-[#1f2937] text-[15px] leading-5 font-semibold !m-0 !mb-[9px]';

const inputBase =
  'w-full h-[42px] pl-11 border border-slate-200 rounded-lg bg-white text-[#1f2937] text-[15px] outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10';

const iconClass = 'absolute left-3.5 text-[#64748b] pointer-events-none';

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
    if (fullName.trim().length > 60) {
      setError('Nama maksimal 60 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password dan Password Verification tidak sama.');
      return;
    }
    setLoading(true);
    try {
      await register({ fullName: fullName.trim(), email: email.trim(), password, role });
      navigate('/verify-otp', { state: { email, fromSignup: true } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pendaftaran gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-white">
      {/* ── Left: Brand Panel ── */}
      <AuthBrandPanel side="left" />

      {/* ── Right: Form area ── */}
      <div className="flex flex-1 flex-col items-center lg:items-end justify-center px-6 lg:pr-[85px] py-8 z-10">
        <div className="w-full max-w-[380px] bg-white rounded-[20px] shadow-2xl p-8 text-left">
          <div className="text-[#0f2c52] text-[28px] leading-9 font-bold !m-0 !mb-[22px] text-center !tracking-normal">
            Sign Up
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-0">
            {/* Username */}
            <div className="flex items-center justify-between !mb-[9px]">
              <label className="block text-left text-[#1f2937] text-[15px] leading-5 font-semibold !m-0">Username</label>
              <span className="text-[12px] text-slate-400 font-medium">
                {fullName.length}/60
              </span>
            </div>
            <div className="relative flex items-center mb-5">
              <User size={16} className={iconClass} />
              <input
                type="text"
                maxLength={60}
                placeholder="Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={`${inputBase} pr-4`}
              />
            </div>

            {/* Work Email */}
            <label className={labelClass}>Work Email</label>
            <div className="relative flex items-center mb-5">
              <Mail size={16} className={iconClass} />
              <input
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`${inputBase} pr-4`}
              />
            </div>

            {/* Password */}
            <label className={labelClass}>Password</label>
            <div className="relative flex items-center mb-5">
              <Lock size={16} className={iconClass} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${inputBase} pr-10`}
              />
              {/* Tombol yang sudah diperbarui dengan aria-label */}
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 text-[#64748b] hover:text-[#0f2c52] bg-transparent border-none cursor-pointer p-0 flex items-center"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Verification (tanpa ikon mata, sesuai target) */}
            <label className={labelClass}>Password Verification</label>
            <div className="relative flex items-center mb-5">
              <Lock size={16} className={iconClass} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="******"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`${inputBase} pr-4`}
              />
            </div>

            {/* Role */}
            <label className={labelClass}>Role</label>
            <div className="relative flex items-center mb-7">
              <Briefcase size={16} className={iconClass} />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`${inputBase} pr-3 cursor-pointer`}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-red-600 text-sm !mt-0 !mb-3 text-left">{error}</p>}
                
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0f2c52] hover:bg-[#0c2444] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg border-none flex items-center justify-center transition-colors text-base tracking-wide"
            >
              {loading ? 'SIGNING UP...' : 'SIGN UP'}
            </button>
          </form>

          <div className="flex justify-center !mt-4">
            <Link
              to="/login"
              className="text-[#1f2937] font-bold text-sm leading-5 no-underline"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}