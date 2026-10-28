import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { updateDepartment, updateDepartmentStatus, type DepartmentItem } from '../api/departments_api';

interface EditDepartmentModalProps {
  department: DepartmentItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDepartmentModal({ department, onClose, onSuccess }: EditDepartmentModalProps) {
  const [name, setName] = useState(department.name);
  const [isActive, setIsActive] = useState(department.isActive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Departement Name wajib diisi');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateDepartment(department.id, {
        name: name.trim(),
        code: department.code || name.trim().slice(0, 10).toUpperCase(),
        description: department.description || '',
      });

      if (isActive !== department.isActive) {
        await updateDepartmentStatus(department.id, isActive);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal mengubah departemen');
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
          <h2 className="text-[19px] font-bold text-slate-900 m-0">
            Edit Departement
          </h2>
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
            {/* Departement Name */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Departement Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter department name"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
            </div>

            {/* Departement Status */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
                Departement Status
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
