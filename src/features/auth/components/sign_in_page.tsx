import React, { useState } from 'react';
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
    <div className="relative flex min-h-screen w-full overflow-hidden bg-white">
      <AuthBrandPanel side="left" />

      <div className="flex flex-1 flex-col items-center lg:items-end justify-center px-6 lg:pr-[85px] py-12 z-10">
        <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-2xl px-8 py-10 text-left">
          <div className="text-[#0f2c52] text-[28px] font-bold !m-0 !mb-10 text-center !tracking-normal">
            Sign In
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-0">
            <label className="text-[#475569] text-[13px] font-bold tracking-widest uppercase mb-3 block">
              Email
            </label>
            <div className="relative flex items-center mb-6">
              <Mail size={16} className="absolute left-3.5 text-[#64748b] pointer-events-none" />
              <input
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg bg-white text-[#1f2937] text-[15px] outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10"
              />
            </div>

            <div className="flex justify-between items-center mb-3">
              <label className="text-[#475569] text-[13px] font-bold tracking-widest uppercase">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[#1e6fd9] text-sm font-semibold no-underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative flex items-center mb-4">
              <Lock size={16} className="absolute left-3.5 text-[#64748b] pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-10 py-3 border border-slate-200 rounded-lg bg-white text-[#1f2937] text-[15px] outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10"
              />
              
              {/* === TOMBOL YANG SUDAH DITAMBAHKAN ARIA-LABEL === */}
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 text-[#64748b] hover:text-[#0f2c52] bg-transparent border-none cursor-pointer p-0 flex items-center"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {/* ================================================= */}

            </div>

            {error && <p className="text-red-600 text-sm mb-2 text-left">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f2c52] hover:bg-[#0c2444] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg mt-3 border-none flex items-center justify-center gap-2 transition-colors text-base tracking-wide"
            >
              {loading ? 'SIGNING IN...' : <>SIGN IN <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center !mt-6 !mb-0 text-base text-[#475569]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#1e6fd9] font-bold no-underline">
              SIGN UP
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}