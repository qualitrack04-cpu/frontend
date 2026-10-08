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
    try {
      await sendOtp(email);
      navigate('/verify-otp', { state: { email } });
    } catch {
    }
  };

  return (
    <div className="flex min-h-screen bg-white flex-row-reverse">
      <AuthBrandPanel />

      <div className="flex flex-col justify-center w-full max-w-sm mx-auto px-8 py-10">
        <h2 className="text-[#0f2c52] text-[28px] font-bold mb-2 text-left">Forgot Password?</h2>
        <p className="text-[#64748b] text-sm mb-6 text-left">
          Enter your registered work email below. We will send you an OTP Code to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
          <div className="relative flex items-center mb-4">
            <Mail size={16} className="absolute left-3.5 text-[#64748b] pointer-events-none" />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-[#cbd5e1] rounded-lg bg-white text-[#1f2937] text-sm outline-none transition-all focus:border-[#0f2c52] focus:ring-2 focus:ring-[#0f2c52]/10"
            />
          </div>

          {error && <p className="text-red-600 text-sm mb-2 text-left">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0f2c52] hover:bg-[#0c2444] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm tracking-wide"
          >
            {loading ? 'Sending...' : 'SEND OTP CODE'}
          </button>
        </form>

        <hr className="border-t border-[#e2e8f0] my-5" />
        <Link to="/login" className="flex items-center gap-1.5 text-[#475569] text-sm font-medium no-underline hover:text-[#0f2c52]">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}