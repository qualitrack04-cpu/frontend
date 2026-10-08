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
    <div className="flex min-h-screen bg-white">
      <AuthBrandPanel />

      <div className="flex flex-col justify-center w-full max-w-sm mx-auto px-8 py-10">
        <h2 className="text-[#0f2c52] text-[28px] font-bold mb-6 text-left">Sign In</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
          <label className="text-[#475569] text-xs font-bold tracking-widest uppercase mb-1.5 block">Email</label>
          <div className="relative flex items-center mb-4">
            <Mail size={16} className="absolute left-3.5 text-[#64748b] pointer-events-none" />
            <input
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-[#cbd5e1] rounded-lg bg-white text-[#1f2937] text-sm outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10"
            />
          </div>

          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[#475569] text-xs font-bold tracking-widest uppercase">Password</label>
            <Link to="/forgot-password" className="text-[#1e6fd9] text-xs font-semibold no-underline hover:underline">
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
              className="w-full pl-10 pr-10 py-3 border border-[#cbd5e1] rounded-lg bg-white text-[#1f2937] text-sm outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10"
            />
            <button
              type="button"
              className="absolute right-3.5 text-[#64748b] hover:text-[#0f2c52] bg-transparent border-none cursor-pointer p-0 flex items-center"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className="text-red-600 text-sm mb-2 text-left">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0f2c52] hover:bg-[#0c2444] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg mt-2 flex items-center justify-center gap-2 transition-colors text-sm tracking-wide"
          >
            {loading ? 'Signing in...' : (<>SIGN IN <ArrowRight size={16} /></>)}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[#475569]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#1e6fd9] font-bold no-underline hover:underline">SIGN UP</Link>
        </p>
      </div>
    </div>
  );
}