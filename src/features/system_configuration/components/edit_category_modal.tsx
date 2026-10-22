import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { updateFindingCategory } from '../api/system_config_api';
import type { FindingCategoryItem } from '../api/system_config_api';

interface EditCategoryModalProps {
  category: FindingCategoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCategoryModal({
  category,
  onClose,
  onSuccess,
}: EditCategoryModalProps) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [severity, setSeverity] = useState(category.severity || 3);
  const [requiresImmediateAction, setRequiresImmediateAction] = useState(
    category.requiresImmediateAction || false
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nama kategori wajib diisi');
      return;
    }
    if (name.trim().length > 50) {
      setError('Nama kategori maksimal 50 karakter');
      return;
    }

    setLoading(true);
    try {
      await updateFindingCategory(category.id, {
        name: name.trim(),
        description: description.trim(),
        severity: Number(severity),
        requiresImmediateAction,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memperbarui kategori');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[500px] overflow-hidden p-6 md:p-8 relative">
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
            Edit Finding Category
          </h2>
          <p className="text-[13px] text-slate-400 m-0 font-normal">
            Update category information and its severity level.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-slate-800">
                  Category Name
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {name.length}/50
                </span>
              </div>
              <input
                type="text"
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Major, Minor, Conform"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                maxLength={200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description..."
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                <option value={1}>Level 1 (Critical / Most Severe)</option>
                <option value={2}>Level 2 (High)</option>
                <option value={3}>Level 3 (Medium / Standard)</option>
                <option value={4}>Level 4 (Low)</option>
                <option value={5}>Level 5 (Informational / Opportunity)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="editReqAction"
                checked={requiresImmediateAction}
                onChange={(e) => setRequiresImmediateAction(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="editReqAction" className="text-[13px] text-slate-700 font-medium cursor-pointer">
                Requires immediate action
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-7">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-[13.5px] transition-colors bg-white cursor-pointer disabled:opacity-50"
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
