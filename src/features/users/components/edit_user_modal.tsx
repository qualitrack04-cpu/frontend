import { useState } from 'react';
import { X, ChevronDown, AlertCircle } from 'lucide-react';
import { updateUser, updateUserRole, updateUserStatus } from '../api/users_api';
import type { User } from '../api/users_api';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.fullName);
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.status === 'Active');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }
    if (!username.trim()) {
      setError('Username wajib diisi');
      return;
    }
    if (username.trim().length > 60) {
      setError('Username maksimal 60 karakter');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (username !== user.fullName || email !== user.email) {
        await updateUser(user.id, { fullName: username.trim(), email: email.trim() });
      }
      if (role !== user.role) {
        await updateUserRole(user.id, role);
      }
      const newStatus = isActive ? 'Active' : 'Inactive';
      if (newStatus !== user.status) {
        await updateUserStatus(user.id, newStatus);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal memperbarui user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[500px] overflow-hidden p-6 md:p-8 animate-[fadeIn_0.15s_ease-out] relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-6">
          <h2 className="text-[20px] font-bold text-slate-900 m-0 mb-1">
            Edit User
          </h2>
          <p className="text-[13px] text-slate-400 m-0 font-normal">
            Update user information, role, and account status.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
            </div>

            {/* Username */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-slate-800">
                  Username
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {username.length}/60
                </span>
              </div>
              <input
                type="text"
                maxLength={60}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Role
              </label>
              <div className="relative flex items-center">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="QualityManager">Quality Manager</option>
                  <option value="AuditorInternal">Auditor Internal</option>
                  <option value="Auditee">Auditee</option>
                </select>
                <ChevronDown size={18} className="absolute right-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Account Status
              </label>
              <div className="border border-slate-200 rounded-lg px-3.5 py-2.5 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-[#2563EB]' : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-[13.5px] font-medium text-slate-700">
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border-none p-0.5 ${
                    isActive ? 'bg-[#2563EB]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-medium text-[13.5px] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-[13.5px] transition-colors shadow-sm border-none cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
