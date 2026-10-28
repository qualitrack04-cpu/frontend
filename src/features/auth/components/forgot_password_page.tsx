import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useForgotPasswordFlow } from '../hooks/use_forgot_password_flow';
import AuthBrandPanel from './auth_brand_panel';
import splashLogo from '../../../assets/splash.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const { sendOtp, loading, error } = useForgotPasswordFlow();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendOtp(email);
      navigate('/verify-otp', { state: { email } });
    } catch {
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-slate-50 lg:bg-white [&_*]:box-border">
      {/* ── Left: Form area ── */}
      <div className="flex flex-1 flex-col items-center lg:items-start justify-center px-4 sm:px-6 lg:pl-[85px] py-8 sm:py-12 z-10">
        <div className="w-full max-w-[444px] bg-white rounded-[20px] shadow-xl sm:shadow-2xl p-6 sm:p-8 text-left">
          {/* Logo on Mobile/Tablet */}
          <div className="flex justify-center mb-5 lg:hidden">
            <img
              src={splashLogo}
              alt="QualiTrack"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </div>

          <div className="text-[#0f2c52] text-2xl sm:text-[25px] leading-8 font-bold !m-0 !mb-4 text-center !tracking-normal">
            Forget Password?
          </div>
          <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#64748b] text-center !m-0 !mb-6">
            Enter your registered work email below. We will send you a OTP Code to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-0">
            <div className="relative flex items-center mb-7">
              <Mail size={16} className="absolute left-3.5 text-[#64748b] pointer-events-none" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-[42px] pl-11 pr-4 py-0 border border-slate-200 rounded-lg bg-white text-[#1f2937] text-[15px] outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10"
              />
            </div>

            {error && <p className="text-red-600 text-sm !m-0 !mb-3 text-left">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[44px] p-0 bg-[#0f2c52] hover:bg-[#0c2444] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-lg border-none flex items-center justify-center transition-colors text-base tracking-wide"
            >
              {loading ? 'SENDING...' : 'SEND OTP CODE'}
            </button>
          </form>

          <div className="border-t border-slate-100 !mt-5 pt-[15px] flex justify-center">
            <Link
              to="/login"
              className="text-[#334155] hover:text-[#0f2c52] font-medium text-base leading-6 no-underline flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right: Brand Panel ── */}
      <AuthBrandPanel side="right" />
    </div>
  );
}