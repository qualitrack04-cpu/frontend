import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { updateSpcUnit, updateSpcUnitStatus, type SpcUnit } from '../api/spc_units_api';

interface EditSpcUnitModalProps {
  unit: SpcUnit;
  onClose: () => void;
  onSuccess: () => void;
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

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update SPC Unit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] w-full max-w-[480px] p-7 sm:p-8 my-auto overflow-hidden animate-[fadeIn_0.15s_ease-out]">
        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-[22px] font-bold text-[#101828] tracking-tight m-0 mb-1.5">
            Edit SPC Unit
          </h2>
          <p className="text-[14px] text-[#667085] m-0 font-normal">
            Update SPC Unit.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 text-red-600 text-[13.5px] rounded-[12px] flex items-center gap-2 border border-red-100">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Unit Name */}
            <div>
              <label className="block text-[14px] font-medium text-[#344054] mb-1.5">
                Unit Name
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="e.g. milimeter"
                  className="w-full bg-white border border-[#D0D5DD] rounded-[12px] px-4 py-3 text-[14.5px] text-[#101828] placeholder-[#98A2B3] outline-none focus:border-[#1570EF] focus:ring-4 focus:ring-[#1570EF]/10 transition-all font-normal shadow-[0_1px_2px_rgba(16,24,40,0.05)] box-border"
                  required
                />
              </div>
            </div>

            {/* Symbol */}
            <div>
              <label className="block text-[14px] font-medium text-[#344054] mb-1.5">
                Symbol
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="e.g. mm"
                  className="w-full bg-white border border-[#D0D5DD] rounded-[12px] px-4 py-3 text-[14.5px] text-[#101828] placeholder-[#98A2B3] outline-none focus:border-[#1570EF] focus:ring-4 focus:ring-[#1570EF]/10 transition-all font-normal shadow-[0_1px_2px_rgba(16,24,40,0.05)] box-border"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[14px] font-medium text-[#344054] mb-1.5">
                Description
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description Here"
                  className="w-full bg-white border border-[#D0D5DD] rounded-[12px] px-4 py-3 text-[14.5px] text-[#101828] placeholder-[#98A2B3] outline-none focus:border-[#1570EF] focus:ring-4 focus:ring-[#1570EF]/10 transition-all font-normal shadow-[0_1px_2px_rgba(16,24,40,0.05)] box-border"
                />
              </div>
            </div>

            {/* Departement Status Toggle Container */}
            <div>
              <label className="block text-[14px] font-medium text-[#344054] mb-1.5">
                Departement Status
              </label>
              <div className="border border-[#D0D5DD] rounded-[12px] px-4 py-3 flex items-center justify-between bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isActive ? 'bg-[#12B76A]' : 'bg-[#98A2B3]'
                    }`}
                  />
                  <span className="text-[14px] font-medium text-[#344054]">
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Custom Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border-none outline-none ${
                    isActive ? 'bg-[#1570EF]' : 'bg-[#E4E7EC]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition duration-200 ease-in-out mt-0.5 ${
                      isActive ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 mt-7 pt-6 border-t border-[#EAECF0]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-[10px] border border-[#D0D5DD] text-[#344054] bg-white hover:bg-slate-50 font-semibold text-[14px] transition-colors cursor-pointer shadow-[0_1px_2px_rgba(16,24,40,0.05)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-[10px] bg-[#1570EF] hover:bg-blue-700 text-white font-semibold text-[14px] transition-all shadow-[0_1px_2px_rgba(16,24,40,0.05)] active:scale-[0.98] border-none cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
