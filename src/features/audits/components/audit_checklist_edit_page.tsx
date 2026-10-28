import { useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, CircleAlert, Plus, Save, Trash2 } from 'lucide-react';
import { useEditChecklist, STANDARDS } from '../hooks/use_edit_checklist';
import { DEPARTMENTS } from '../hooks/use_create_audit_plan';

export default function AuditChecklistEditPage() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const {
    title, setTitle,
    standard, setStandard,
    department, setDepartment,
    items,
    updateItem, addItem, removeItem, moveItem,
    loading, loadError,
    titleError, isQuestionMissing,
    submitError, submitting,
    handleSubmit,
    navigate,
  } = useEditChecklist(checklistId!);

  // Kalau data lama pakai nilai di luar daftar, tetap tampilkan sebagai opsi
  const standardOptions = STANDARDS.some((s) => s.value === standard) || !standard
    ? STANDARDS
    : [...STANDARDS, { value: standard, label: standard }];
  const departmentOptions = DEPARTMENTS.includes(department) || !department
    ? DEPARTMENTS
    : [...DEPARTMENTS, department];

  if (loading) return <div className="max-w-full m-0 text-left"><p className="text-slate-500">Memuat checklist...</p></div>;
  if (loadError) {
    return (
      <div className="max-w-full m-0 text-left">
        <button className="flex items-center gap-2 text-slate-500 hover:text-[#0f2c52] transition-colors mb-4 font-semibold bg-transparent border-none cursor-pointer p-0" onClick={() => navigate(-1)}>← Back</button>
        <p className="text-red-600">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-full m-0 text-left">
      <button className="inline-flex items-center gap-[8px] bg-transparent border-none text-[#64748b] text-[14px] font-semibold cursor-pointer p-0 mb-[16px] hover:text-[#1e293b]" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="text-2xl sm:text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6">Edit Audit Checklist</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-[#e2e8f0] rounded-[12px] p-5 sm:p-7 md:p-[32px] max-w-[760px]">
        <div className="text-[14px] font-bold text-[#0f2c52] uppercase tracking-[0.5px] m-0 mb-[16px]">Checklist Details</div>
        <hr className="border-t border-[#e2e8f0] m-0 mb-[24px]" />

        <div className="flex flex-col gap-[8px] mb-[20px]">
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Checklist Title *</label>
          <input
            type="text"
            placeholder="e.g., ISO 9001 - Warehouse"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`p-[12px_14px] border-[1.5px] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none w-full box-border placeholder:text-[#94a3b8] font-inherit ${titleError ? 'border-[#dc2626] focus:border-[#dc2626] focus:ring-[3px] focus:ring-[rgba(220,38,38,0.1)]' : 'border-[#e2e8f0] focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)]'}`}
          />
          {titleError && (
            <p className="text-[#dc2626] text-[13px] mt-[4px] flex items-center gap-[4px] m-0">
              <CircleAlert size={14} /> {titleError}
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-[16px] mb-[20px]">
          <div className="flex-1 flex flex-col gap-[8px]">
            <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Standard</label>
            <select value={standard} onChange={(e) => setStandard(e.target.value)} className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border font-inherit">
              <option value="">Select Standard</option>
              {standardOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-[8px]">
            <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border font-inherit">
              <option value="">Select Department</option>
              {departmentOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center text-[14px] font-bold text-[#0f2c52] uppercase tracking-[0.5px] m-0 mb-[16px] mt-[32px]">
          Checklist Items <span className="bg-[#f1f5f9] text-[#0f2c52] p-[4px_10px] rounded-[12px] text-[13px] normal-case">{items.length}</span>
        </div>
        <hr className="border-t border-[#e2e8f0] m-0 mb-[24px]" />

        {items.length === 0 && (
          <p className="text-[12px] text-[#94a3b8]">Belum ada item. Klik "Add Item" untuk menambahkan.</p>
        )}

        <div className="flex flex-col gap-[24px]">
          {items.map((item, index) => {
            const questionMissing = isQuestionMissing(item);
            return (
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[20px] relative" key={item.key}>
                <div className="flex justify-between items-center mb-[16px] pb-[12px] border-b border-dashed border-[#cbd5e1]">
                  <span className="bg-[#0f2c52] text-white w-[28px] h-[28px] rounded-full flex items-center justify-center text-[14px] font-bold">{index + 1}</span>
                  <div className="flex gap-[8px]">
                    <button
                      type="button"
                      className="bg-white border border-[#e2e8f0] text-[#64748b] w-[32px] h-[32px] rounded-[6px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:not(:disabled):border-[#94a3b8] hover:not(:disabled):text-[#0f2c52] disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#f1f5f9]"
                      onClick={() => moveItem(item.key, -1)}
                      disabled={index === 0}
                      aria-label="Naikkan item"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      className="bg-white border border-[#e2e8f0] text-[#64748b] w-[32px] h-[32px] rounded-[6px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:not(:disabled):border-[#94a3b8] hover:not(:disabled):text-[#0f2c52] disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#f1f5f9]"
                      onClick={() => moveItem(item.key, 1)}
                      disabled={index === items.length - 1}
                      aria-label="Turunkan item"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      className="bg-white border border-[#e2e8f0] text-[#64748b] w-[32px] h-[32px] rounded-[6px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:not(:disabled):border-[#fca5a5] hover:not(:disabled):text-[#dc2626] hover:not(:disabled):bg-[#fef2f2] disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#f1f5f9]"
                      onClick={() => removeItem(item.key)}
                      aria-label="Hapus item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-[16px] mb-[20px]">
                  <div className="flex-[3] flex flex-col gap-[8px]">
                    <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Question *</label>
                    <input
                      type="text"
                      placeholder="e.g., Warehouse area is clean and tidy"
                      value={item.question}
                      onChange={(e) => updateItem(item.key, 'question', e.target.value)}
                      className={`p-[12px_14px] border-[1.5px] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none w-full box-border placeholder:text-[#94a3b8] font-inherit ${questionMissing ? 'border-[#dc2626] focus:border-[#dc2626] focus:ring-[3px] focus:ring-[rgba(220,38,38,0.1)]' : 'border-[#e2e8f0] focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)]'}`}
                    />
                    {questionMissing && (
                      <p className="text-[#dc2626] text-[13px] mt-[4px] flex items-center gap-[4px] m-0">
                        <CircleAlert size={14} /> Pertanyaan wajib diisi
                      </p>
                    )}
                  </div>
                  <div className="flex-[1] flex flex-col gap-[8px]">
                    <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Clause Ref</label>
                    <input
                      type="text"
                      placeholder="e.g., 7.1.4"
                      value={item.clauseRef}
                      onChange={(e) => updateItem(item.key, 'clauseRef', e.target.value)}
                      className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border placeholder:text-[#94a3b8] font-inherit"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-[8px] mb-[20px]">
                  <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Explain what the auditor should check for this item..."
                    value={item.description}
                    onChange={(e) => updateItem(item.key, 'description', e.target.value)}
                    className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border placeholder:text-[#94a3b8] font-inherit resize-y"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" className="w-full mt-[24px] p-[16px] bg-[#f8fafc] border-[2px] border-dashed border-[#cbd5e1] rounded-[8px] text-[#64748b] text-[14.5px] font-semibold cursor-pointer flex items-center justify-center gap-[8px] transition-all duration-200 hover:bg-[#f1f5f9] hover:border-[#94a3b8] hover:text-[#0f2c52]" onClick={addItem}>
          <Plus size={16} /> Add Item
        </button>

        {submitError && <p className="text-[#dc2626] text-[13px] mt-[4px]">{submitError}</p>}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-[12px] mt-[32px] pt-[20px] border-t border-[#e2e8f0]">
          <button type="button" className="w-full sm:w-auto bg-[#f1f5f9] text-[#475569] border-none p-[12px_24px] rounded-[8px] text-[14px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#e2e8f0]" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="w-full sm:w-auto bg-[#0f2c52] text-white border-none p-[12px_24px] rounded-[8px] text-[14px] font-semibold cursor-pointer flex items-center justify-center gap-[8px] transition-colors duration-200 hover:bg-[#0c2444] disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitting}>
            <Save size={16} /> {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
