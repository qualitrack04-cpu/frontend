import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { updateSpcUnit, updateSpcUnitStatus, type SpcUnit } from '../api/spc_units_api';

interface EditSpcUnitModalProps {
  unit: SpcUnit;
  onClose: () => void;
  onSuccess: (updated?: SpcUnit) => void;
}

export default function EditSpcUnitModal({ unit, onClose, onSuccess }: EditSpcUnitModalProps) {
  const [unitName, setUnitName] = useState(unit.name || '');
  const [symbol, setSymbol] = useState(unit.symbol || '');
  const [description, setDescription] = useState(unit.description || '');
  const [isActive, setIsActive] = useState<boolean>(unit.isActive);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) {
      setError('Unit Name is required');
      return;
    }
    if (!symbol.trim()) {
      setError('Symbol is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateSpcUnit(unit.id, {
        name: unitName.trim(),
        symbol: symbol.trim(),
        description: description.trim() || undefined,
      });

      if (isActive !== unit.isActive) {
        await updateSpcUnitStatus(unit.id, isActive);
      }

      onSuccess({
        ...unit,
        name: unitName.trim(),
        symbol: symbol.trim(),
        description: description.trim() || null,
        isActive,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update SPC Unit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
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
            Edit SPC Unit
          </h2>
          <p className="text-[13px] text-slate-400 m-0 font-normal">
            Update SPC unit in the QualiTrack system.
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
            {/* Unit Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-slate-800">
                  Unit Name
                </label>
                <span className="text-[12px] text-slate-400 font-medium">
                  {unitName.length}/50
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={unitName}
                  maxLength={50}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="e.g. milimeter"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all box-border"
                  required
                />
              </div>
            </div>

            {/* Symbol */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-slate-800">
                  Symbol
                </label>
                <span className="text-[12px] text-slate-400 font-medium">
                  {symbol.length}/20
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={symbol}
                  maxLength={20}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="e.g. mm"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all box-border"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-slate-800">
                  Description
                </label>
                <span className="text-[12px] text-slate-400 font-medium">
                  {description.length}/200
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={description}
                  maxLength={200}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description here"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all box-border"
                />
              </div>
            </div>

            {/* Unit Status Toggle */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Unit Status
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

                {/* Standard Toggle Switch */}
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
