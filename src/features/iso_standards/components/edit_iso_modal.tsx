import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { updateIsoStandard, updateIsoStandardStatus } from '../api/iso_standards_api';
import type { IsoStandard } from '../api/iso_standards_api';

interface EditIsoModalProps {
  iso: IsoStandard;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditIsoModal({ iso, onClose, onSuccess }: EditIsoModalProps) {
  const [standardName, setStandardName] = useState(iso.code);
  const [category, setCategory] = useState(iso.name);
  const [isActive, setIsActive] = useState(iso.isActive);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!standardName.trim()) {
      setError('ISO Standard Name wajib diisi');
      return;
    }
    if (!category.trim()) {
      setError('ISO Category wajib diisi');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (standardName !== iso.code || category !== iso.name) {
        await updateIsoStandard(iso.id, {
          code: standardName.trim(),
          name: category.trim(),
          description: category.trim(),
        });
      }

      if (isActive !== iso.isActive) {
        await updateIsoStandardStatus(iso.id, isActive);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal mengubah ISO Standard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-7 animate-[fadeIn_0.15s_ease-out] relative">
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
            Edit ISO Standard
          </h2>
          <p className="text-[13px] text-slate-400 m-0 font-normal">
            Update ISO standard to the QualiTrack system.
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
            {/* ISO Standard Name */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                ISO Standard Name
              </label>
              <input
                type="text"
                value={standardName}
                onChange={(e) => setStandardName(e.target.value)}
                placeholder="e.g. ISO 45001:2018"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
            </div>

            {/* ISO Category */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                ISO Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Occupational Health & Safety"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
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
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-medium text-[13.5px] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-[13.5px] transition-colors shadow-sm border-none cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
