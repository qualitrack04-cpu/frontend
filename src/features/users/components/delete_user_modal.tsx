import { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { updateUserStatus } from '../api/users_api';
import type { User } from '../api/users_api';

interface DeleteUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteUserModal({ user, onClose, onSuccess }: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeactivate = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateUserStatus(user.id, 'Inactive');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal menonaktifkan user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[1000] backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-[16px] w-full max-w-[440px] shadow-[0_10px_25px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-[slideUp_0.2s_ease-out]">
        
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 size={18} />
            </div>
            <h2 className="text-[19px] font-bold text-[#0f2c52] m-0">Deactivate User</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
              {error}
            </div>
          )}

          <div className="flex items-start gap-3.5 mb-4 p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-amber-800 text-sm">
            <AlertTriangle size={20} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold m-0 mb-1">Konfirmasi Penonaktifan</p>
              <p className="m-0 text-[13px] text-amber-700 leading-relaxed">
                Apakah kamu yakin ingin menonaktifkan akun <strong className="break-words [overflow-wrap:anywhere] [word-break:break-word]">{user.fullName}</strong>?
              </p>
            </div>
          </div>

          <p className="text-slate-500 text-sm m-0 leading-relaxed">
            Status user <strong className="break-words [overflow-wrap:anywhere] [word-break:break-word]">{user.email}</strong> akan diubah menjadi <span className="font-semibold text-rose-600">Inactive</span> dan hak akses ke sistem akan ditangguhkan.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-[#f8fafc]">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-700 bg-transparent border-none cursor-pointer hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button 
            type="button" 
            onClick={handleDeactivate}
            disabled={loading}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Memproses...' : 'Nonaktifkan User'}
          </button>
        </div>

      </div>
    </div>
  );
}
