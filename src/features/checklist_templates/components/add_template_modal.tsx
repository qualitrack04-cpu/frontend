import { useState } from 'react';
import { X, PlusCircle, CheckCircle2 } from 'lucide-react';
import { createChecklistTemplate } from '../api/checklist_templates_api';
import type { DepartmentOption, IsoOption } from '../api/checklist_templates_api';

interface AddTemplateModalProps {
  departments: DepartmentOption[];
  isoStandards: IsoOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTemplateModal({
  departments,
  isoStandards,
  onClose,
  onSuccess,
}: AddTemplateModalProps) {
  const [title, setTitle] = useState('');
  const [isoStandardId, setIsoStandardId] = useState(isoStandards[0]?.id || '');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [firstQuestion, setFirstQuestion] = useState('');
  const [clauseRef, setClauseRef] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!departmentId) {
      setError('Pilih Department terlebih dahulu');
      setLoading(false);
      return;
    }

    try {
      const items = firstQuestion.trim()
        ? [
            {
              question: firstQuestion.trim(),
              clauseRef: clauseRef.trim() || 'General',
              orderIndex: 1,
            },
          ]
        : [];

      await createChecklistTemplate({
        title: title.trim(),
        isoStandardId: isoStandardId || undefined,
        departmentId,
        items,
      });

      setSuccessMsg('Template berhasil ditambahkan!');
      setTimeout(() => {
        onSuccess();
      }, 700);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal menambahkan template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[1000] backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-[16px] w-full max-w-[520px] shadow-[0_10px_25px_rgba(0,0,0,0.15)] flex flex-col max-h-[90vh] overflow-hidden animate-[slideUp_0.2s_ease-out]">
        
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PlusCircle size={18} />
            </div>
            <h2 className="text-[19px] font-bold text-[#0f2c52] m-0">Add Template</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto overflow-x-hidden px-6 py-5 flex-1">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm mb-4 border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form id="add-template-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. ISO 9001 Quality Inspection Form"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  ISO Standart <span className="text-red-500">*</span>
                </label>
                <select
                  value={isoStandardId}
                  onChange={(e) => setIsoStandardId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-[10px] px-3 py-2.5 text-[14px] outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-700 cursor-pointer"
                >
                  <option value="">Pilih Standart</option>
                  {isoStandards.map((iso) => (
                    <option key={iso.id} value={iso.id}>
                      {iso.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-[10px] px-3 py-2.5 text-[14px] outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-700 cursor-pointer"
                >
                  <option value="">Pilih Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 mt-1">
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Pertanyaan Awal Checklist <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Verifikasi prosedur penerimaan barang sesuai SOP"
                value={firstQuestion}
                onChange={(e) => setFirstQuestion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-800"
              />
            </div>

            {firstQuestion && (
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Clause Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Clause 8.2"
                  value={clauseRef}
                  onChange={(e) => setClauseRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[10px] px-3.5 py-2 text-[14px] outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-800"
                />
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-[#f8fafc]">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-700 bg-transparent border-none cursor-pointer hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="add-template-form"
            disabled={loading}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Adding...' : 'Add Template'}
          </button>
        </div>

      </div>
    </div>
  );
}
