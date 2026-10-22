import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { createSpcUnit } from '../api/spc_units_api';

interface AddSpcUnitModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSpcUnitModal({ onClose, onSuccess }: AddSpcUnitModalProps) {
  const [unit, setUnit] = useState('');
  const [targetParameter, setTargetParameter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit.trim()) {
      setError('Unit wajib diisi');
      return;
    }
    if (!targetParameter.trim()) {
      setError('Target Parameter wajib diisi');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createSpcUnit({
        name: targetParameter.trim(),
        symbol: unit.trim(),
        description: targetParameter.trim(),
        isActive: true,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal menambahkan SPC Unit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 md:p-7 animate-[fadeIn_0.15s_ease-out] relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-6">
          <h2 className="text-[19px] font-bold text-slate-900 m-0 mb-1">
            Add SPC Unit
          </h2>
          <p className="text-[13px] text-slate-400 m-0 font-normal">
            Add a new SPC Unit.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Unit */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. mm"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
            </div>

            {/* Target Parameter */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Target Parameter
              </label>
              <input
                type="text"
                value={targetParameter}
                onChange={(e) => setTargetParameter(e.target.value)}
                placeholder="e.g. Chemical Concentration"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-2">
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
              {loading ? 'Adding...' : 'Add Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
