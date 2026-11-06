import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Briefcase, Check } from 'lucide-react';
import { register } from '../api/auth_api';
import AuthBrandPanel from './auth_brand_panel';
import splashLogo from '../../../assets/splash.png';
import { getPasswordChecks, countPasswordChecks, isPasswordStrong } from '../../../shared/utils/password_policy';

const ROLE_OPTIONS = [
  { value: 'AuditorInternal', label: 'Auditor Internal' },
  { value: 'QualityManager', label: 'Quality Manager' },
] as const;

const labelClass =
  'block text-left text-[#1f2937] text-[14px] leading-5 font-semibold !m-0 !mb-2';

const inputBase =
  'w-full h-[40px] pl-10.5 border border-slate-200 rounded-lg bg-white text-[#1f2937] text-[14.5px] outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10';

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

  // Password Policy Checks
  const passwordChecks = getPasswordChecks(password);
  const criteriaCount = countPasswordChecks(passwordChecks);

  let strengthLabel = '';
  let strengthColor = 'text-slate-400';
  if (criteriaCount === 4) {
    strengthLabel = 'Strong';
    strengthColor = 'text-[#16A34A]';
  } else if (criteriaCount === 3) {
    strengthLabel = 'Good';
    strengthColor = 'text-amber-500';
  } else if (criteriaCount === 2) {
    strengthLabel = 'Fair';
    strengthColor = 'text-orange-500';
  } else if (criteriaCount === 1) {
    strengthLabel = 'Weak';
    strengthColor = 'text-red-500';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (fullName.trim().length > 60) {
      setError('Name cannot exceed 60 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }
    if (!isPasswordStrong(password)) {
      setError('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character');
      return;
    }
    setLoading(true);
    try {
      await register({ fullName: fullName.trim(), email: email.trim(), password, role });
      navigate('/verify-otp', { state: { email, fromSignup: true } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen lg:h-screen w-full overflow-y-auto lg:overflow-hidden bg-slate-50 lg:bg-white">
      {/* ── Left: Brand Panel ── */}
      <AuthBrandPanel side="left" />

      {/* ── Right: Form area ── */}
      <div className="flex flex-1 flex-col items-center lg:items-end justify-center px-4 sm:px-6 lg:pr-[85px] py-4 sm:py-6 z-10 my-auto">
        <div className="w-full max-w-[400px] bg-white rounded-[20px] shadow-xl sm:shadow-2xl px-6 py-6 sm:px-8 sm:py-7 text-left">
          {/* Logo on Mobile/Tablet */}
          <div className="flex justify-center mb-3.5 lg:hidden">
            <img
              src={splashLogo}
              alt="QualiTrack"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </div>

          <div className="text-[#0f2c52] text-2xl sm:text-[28px] leading-snug font-bold !m-0 !mb-4 text-center !tracking-normal">
            Sign Up
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-0">
            {/* Username */}
            <div className="flex items-center justify-between !mb-2">
              <label className="block text-left text-[#1f2937] text-[14px] leading-5 font-semibold !m-0">Username</label>
              <span className="text-[12px] text-slate-400 font-medium">
                {fullName.length}/60
              </span>
            </div>
            <div className="relative flex items-center mb-3.5">
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
            <div className="relative flex items-center mb-3.5">
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
            <div className="relative flex items-center mb-2">
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

            {/* Password Policy & Strength Indicator (Tampil realtime saat password diketik) */}
            {password.length > 0 && (
              <div className="mb-3 p-3 bg-slate-50/90 border border-slate-200/80 rounded-xl transition-all">
                {/* 4 Segmented Strength Bars */}
                <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                  {[1, 2, 3, 4].map((level) => {
                    const isActive = criteriaCount >= level;
                    const barColor =
                      criteriaCount === 4
                        ? 'bg-[#16A34A]'
                        : criteriaCount === 3
                        ? 'bg-amber-400'
                        : criteriaCount === 2
                        ? 'bg-orange-400'
                        : 'bg-red-400';

                    return (
                      <div
                        key={level}
                        className={`h-1.5 rounded-full transition-all duration-200 ${
                          isActive ? barColor : 'bg-slate-200'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Strength Label */}
                {strengthLabel && (
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Strength
                    </span>
                    <span className={`text-[12px] font-bold ${strengthColor}`}>
                      {strengthLabel}
                    </span>
                  </div>
                )}

                {/* 4 Criteria Checklist */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1.5 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <Check
                      size={13}
                      className={passwordChecks.hasMinLength ? 'text-[#16A34A]' : 'text-slate-300'}
                      strokeWidth={passwordChecks.hasMinLength ? 3 : 2}
                    />
                    <span
                      className={`text-[11.5px] leading-tight ${
                        passwordChecks.hasMinLength ? 'text-slate-700 font-medium' : 'text-slate-400'
                      }`}
                    >
                      At least 8 chars
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Check
                      size={13}
                      className={passwordChecks.hasUpperLower ? 'text-[#16A34A]' : 'text-slate-300'}
                      strokeWidth={passwordChecks.hasUpperLower ? 3 : 2}
                    />
                    <span
                      className={`text-[11.5px] leading-tight ${
                        passwordChecks.hasUpperLower ? 'text-slate-700 font-medium' : 'text-slate-400'
                      }`}
                    >
                      Upper & lowercase
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Check
                      size={13}
                      className={passwordChecks.hasNumber ? 'text-[#16A34A]' : 'text-slate-300'}
                      strokeWidth={passwordChecks.hasNumber ? 3 : 2}
                    />
                    <span
                      className={`text-[11.5px] leading-tight ${
                        passwordChecks.hasNumber ? 'text-slate-700 font-medium' : 'text-slate-400'
                      }`}
                    >
                      At least 1 number
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Check
                      size={13}
                      className={passwordChecks.hasSpecial ? 'text-[#16A34A]' : 'text-slate-300'}
                      strokeWidth={passwordChecks.hasSpecial ? 3 : 2}
                    />
                    <span
                      className={`text-[11.5px] leading-tight ${
                        passwordChecks.hasSpecial ? 'text-slate-700 font-medium' : 'text-slate-400'
                      }`}
                    >
                      1 special char
                    </span>
                  </div>
                </div>
              </div>
            )}
            {!password && <div className="mb-2.5" />}

            {/* Password Verification */}
            <div className="flex items-center justify-between !mb-2">
              <label className="block text-left text-[#1f2937] text-[14px] leading-5 font-semibold !m-0">
                Password Verification
              </label>
              {confirmPassword.length > 0 && (
                <span
                  className={`text-[11.5px] font-semibold ${
                    password === confirmPassword ? 'text-[#16A34A]' : 'text-red-500'
                  }`}
                >
                  {password === confirmPassword ? 'Passwords match' : 'Do not match'}
                </span>
              )}
            </div>
            <div className="relative flex items-center mb-3.5">
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
            <div className="relative flex items-center mb-5">
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

            {error && <p className="text-red-600 text-xs !mt-0 !mb-2.5 text-left">{error}</p>}
                
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0f2c52] hover:bg-[#0c2444] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg border-none flex items-center justify-center transition-colors text-[15px] tracking-wide"
            >
              {loading ? 'SIGNING UP...' : 'SIGN UP'}
            </button>
          </form>

          <div className="flex justify-center !mt-3.5">
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