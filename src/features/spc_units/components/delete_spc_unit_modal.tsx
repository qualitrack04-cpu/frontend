import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { updateSpcUnitStatus, type SpcUnit } from '../api/spc_units_api';

interface DeleteSpcUnitModalProps {
  unit: SpcUnit;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteSpcUnitModal({ unit, onClose, onSuccess }: DeleteSpcUnitModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateSpcUnitStatus(unit.id, false);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal menonaktifkan SPC unit');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center animate-[fadeIn_0.15s_ease-out]">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} />
        </div>

        <h3 className="text-lg font-bold text-slate-800 m-0 mb-2">Delete SPC Unit</h3>
        <p className="text-sm text-slate-500 m-0 mb-6">
          Are you sure you want to deactivate <strong className="text-slate-800 font-semibold">{unit.name} ({unit.symbol})</strong>?
          This action will set the unit status to inactive.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 text-left">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border-none cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors border-none cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
