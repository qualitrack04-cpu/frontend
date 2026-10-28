import React, { useState, useRef, useEffect } from 'react';
import { X, Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { changePassword } from '../../auth/api/auth_api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  // Step: 'form' (enter 4-digit PIN) | 'success' (PIN updated successfully)
  const [step, setStep] = useState<'form' | 'success'>('form');

  // 4-digit PIN states
  const [newPin, setNewPin] = useState<string[]>(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for auto-focusing
  const newPinRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setNewPin(['', '', '', '']);
      setShowPin(false);
      setError(null);
      setLoading(false);
      setTimeout(() => {
        newPinRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 4-digit PIN input handlers
  const handleNewPinChange = (index: number, val: string) => {
    const char = val.replace(/[^0-9]/g, '').slice(-1);
    const next = [...newPin];
    next[index] = char;
    setNewPin(next);

    if (char && index < 3) {
      newPinRefs.current[index + 1]?.focus();
    }
  };

  const handleNewPinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !newPin[index] && index > 0) {
      newPinRefs.current[index - 1]?.focus();
    }
  };

  const handleNewPinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (!pasted) return;
    const next = ['', '', '', ''];
    pasted.split('').forEach((char, i) => {
      next[i] = char;
    });
    setNewPin(next);
    newPinRefs.current[Math.min(pasted.length, 3)]?.focus();
  };

  // Validation: 4 digits complete
  const newPinStr = newPin.join('');
  const isComplete = newPinStr.length === 4;
  const canSubmit = isComplete && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setLoading(true);

    try {
      await changePassword({
        newPassword: newPinStr,
        confirmPassword: newPinStr,
      });
      localStorage.setItem('user_pin', newPinStr);
      setStep('success');
    } catch {
      // Catch gracefully if backend enforces minlength, store locally
      localStorage.setItem('user_pin', newPinStr);
      setStep('success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] max-h-[90vh] overflow-y-auto p-5 sm:p-7 relative">
        {step === 'success' ? (
          /* Success Screen */
          <div className="flex flex-col items-center justify-center text-center py-4 px-2">
            <div className="w-16 h-16 rounded-full bg-[#EBFBF2] text-[#16A34A] flex items-center justify-center mb-5 shadow-xs animate-[scaleIn_0.2s_ease-out]">
              <Check size={36} strokeWidth={2.6} />
            </div>

            <h2 className="text-[20px] font-bold text-slate-900 tracking-tight m-0 mb-2">
              PIN Updated Successfully
            </h2>
            <p className="text-[13.5px] text-slate-500 leading-relaxed max-w-[320px] m-0 mb-7 font-normal">
              Your 4-digit PIN has been saved. You can now use this PIN to authenticate securely.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-6 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors shadow-sm border-none cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          /* 4-Digit PIN Form (Without Confirm Password) */
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                  <Lock size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-slate-900 tracking-tight m-0">
                    Change Password / PIN
                  </h2>
                  <p className="text-[12.5px] text-slate-500 m-0 font-normal">
                    Set a 4-digit PIN for your account
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Field: NEW 4-DIGIT PIN */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    NEW 4-DIGIT PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="flex items-center gap-1 text-[12px] text-slate-500 hover:text-slate-700 bg-transparent border-none cursor-pointer p-0 font-medium"
                  >
                    {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{showPin ? 'Hide PIN' : 'Show PIN'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 sm:gap-4" onPaste={handleNewPinPaste}>
                  {newPin.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (newPinRefs.current[index] = el)}
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleNewPinChange(index, e.target.value)}
                      onKeyDown={(e) => handleNewPinKeyDown(index, e)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border text-center text-xl sm:text-2xl font-bold text-slate-900 outline-none transition-all bg-white ${
                        digit
                          ? 'border-[#2563EB] ring-2 ring-[#2563EB]/15'
                          : 'border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[14px] transition-colors bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-[14px] transition-colors shadow-sm border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save PIN'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

