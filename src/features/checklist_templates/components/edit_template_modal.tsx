import { useState, useEffect } from 'react';
import { X, Pencil, AlertCircle } from 'lucide-react';
import { updateChecklistTemplate } from '../api/checklist_templates_api';
import { getChecklistById } from '../../audits/api/checklist_api';
import type { 
  ChecklistTemplateItem, 
  DepartmentOption, 
  IsoOption 
} from '../api/checklist_templates_api';

interface EditTemplateModalProps {
  template: ChecklistTemplateItem;
  departments: DepartmentOption[];
  isoStandards: IsoOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTemplateModal({
  template,
  departments,
  isoStandards,
  onClose,
  onSuccess,
}: EditTemplateModalProps) {
  const [title, setTitle] = useState(template.title);
  const [standard, setStandard] = useState(template.isoStandardName);
  const [department, setDepartment] = useState(template.departmentName);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingItems, setExistingItems] = useState<any[]>([]);

  useEffect(() => {
    // Load existing items to include in update
    getChecklistById(template.id)
      .then((res) => {
        setExistingItems(res.items || []);
      })
      .catch(() => {
        // Fallback default item if empty
        setExistingItems([
          {
            question: 'General inspection check',
            clauseRef: 'General',
          },
        ]);
      });
  }, [template.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const itemsPayload =
        existingItems.length > 0
          ? existingItems.map((item) => ({
              id: item.id,
              question: item.question,
              description: item.description,
              clauseRef: item.clauseRef || 'General',
            }))
          : [
              {
                question: 'General inspection check',
                clauseRef: 'General',
              },
            ];

      await updateChecklistTemplate(template.id, {
        title: title.trim(),
        standard: standard.trim(),
        department: department.trim(),
        items: itemsPayload,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Gagal mengubah template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[1000] backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-[16px] w-full max-w-[500px] shadow-[0_10px_25px_rgba(0,0,0,0.15)] flex flex-col max-h-[90vh] overflow-hidden animate-[slideUp_0.2s_ease-out]">
        
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Pencil size={16} />
            </div>
            <h2 className="text-[19px] font-bold text-[#0f2c52] m-0">Edit Template</h2>
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
            <div className="bg-red-50 text-red-600 p-3.5 rounded-lg text-sm mb-4 border border-red-100 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="edit-template-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
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
                  value={standard}
                  onChange={(e) => setStandard(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-[10px] px-3 py-2.5 text-[14px] outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-700 cursor-pointer"
                >
                  <option value="">Pilih Standart</option>
                  {isoStandards.map((iso) => (
                    <option key={iso.id} value={iso.code}>
                      {iso.code}
                    </option>
                  ))}
                  {!isoStandards.some((i) => i.code === standard) && standard && (
                    <option value={standard}>{standard}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-[10px] px-3 py-2.5 text-[14px] outline-none focus:border-blue-500 focus:bg-white transition-colors text-slate-700 cursor-pointer"
                >
                  <option value="">Pilih Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                  {!departments.some((d) => d.name === department) && department && (
                    <option value={department}>{department}</option>
                  )}
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
              Template ini memiliki <strong className="text-slate-700">{existingItems.length} checklist items</strong>.
            </div>
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
            form="edit-template-form"
            disabled={loading}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
