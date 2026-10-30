import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, CircleAlert, Save, Pencil } from 'lucide-react';
import { useCreateAuditPlan } from '../hooks/use_create_audit_plan';
import DatePicker from '../../../shared/components/date_picker';

function toLocalisoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const todayIso = toLocalisoDate(new Date());
const maxDateIso = `${new Date().getFullYear() + 5}-12-31`;
export default function CreateAuditPlanPage() {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const {
    isEdit,
    title, setTitle,
    leadAuditorId, setLeadAuditorId,
    department, setDepartment,
    scheduledDate, setScheduledDate,
    scopeDescription, setScopeDescription,
    checklistId, setChecklistId,
    highPriority, setHighPriority,
    auditors,
    departments,
    checklists,
    loadingOptions,
    loadingPlan,
    loadError,
    titleError,
    submitError,
    submitting,
    handleSubmit,
  } = useCreateAuditPlan(planId);

  if (loadingPlan) {
    return <div className="max-w-full m-0 text-left"><p className="text-slate-500">Loading audit plan...</p></div>;
  }
  if (loadError) {
    return (
      <div className="max-w-full m-0 text-left">
        <button className="flex items-center gap-2 text-slate-500 hover:text-[#0f2c52] transition-colors mb-4 font-semibold bg-transparent border-none cursor-pointer p-0" onClick={() => navigate('/audits')}>← Back to Audits</button>
        <p className="error-text">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-full m-0 text-left">
      <button className="flex items-center gap-2 text-slate-500 hover:text-[#0f2c52] transition-colors mb-4 font-semibold bg-transparent border-none cursor-pointer p-0" onClick={() => navigate('/audits')}>← Back to Audits</button>
      <h1 className="text-2xl sm:text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6">{isEdit ? 'Edit Audit Plan' : 'Create Audit Plan'}</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-[#e2e8f0] rounded-[12px] p-5 sm:p-7 md:p-[32px] max-w-[760px]">
        <div className="text-[14px] font-bold text-[#0f2c52] uppercase tracking-[0.5px] m-0 mb-[16px]">Audit Details</div>
        <hr className="border-t border-[#e2e8f0] m-0 mb-[24px]" />

        <div className="flex flex-col gap-[8px] mb-[20px]">
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Audit Title *</label>
          <input
            type="text"
            placeholder="e.g., Q3 Manufacturing Facility Audit"
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
          <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
            <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Lead Auditor</label>
            <select value={leadAuditorId} onChange={(e) => setLeadAuditorId(e.target.value)} className="truncate p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border font-inherit">
              <option value="">Select Auditor</option>
              {auditors.map((a) => (
                <option key={a.id} value={a.id}>{a.fullName}</option>
              ))}
            </select>
            {!loadingOptions && auditors.length === 0 && (
              <p className="text-slate-500 text-[12px] m-0">No auditors available.</p>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-[8px]">
            <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border font-inherit">
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-[8px] mb-[20px]">
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Scheduled Date</label>
          <div className="relative flex items-center">
            <DatePicker
              min={isEdit ? undefined : todayIso}
              max={maxDateIso}
              value={scheduledDate}
              onChange={setScheduledDate}
            />
          </div>
        </div>

        <div className="flex flex-col gap-[8px] mb-[20px]">
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Scope &amp; Description</label>
          <textarea
            rows={4}
            placeholder="Enter detailed scope and objectives for this audit..."
            value={scopeDescription}
            onChange={(e) => setScopeDescription(e.target.value)}
            className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border placeholder:text-[#94a3b8] font-inherit resize-y"
          />
        </div>

        <div className="flex flex-col gap-[8px] mb-[20px]">
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">ISO TEMPLATE</label>

          {loadingOptions && <p className="text-slate-500 m-0">Loading template...</p>}
          {!loadingOptions && checklists.length === 0 && (
            <p className="text-slate-500 text-[12px] m-0">No checklist/template available.</p>
          )}

          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[16px] mt-[8px]">
            {checklists.map((c) => (
              <label
                key={c.id}
                className={`group relative flex items-start gap-[12px] border-[1.5px] rounded-[8px] p-[14px] cursor-pointer transition-all duration-200 ${checklistId === c.id ? 'border-[#0f2c52] bg-[#f0f4f8]' : 'border-[#e2e8f0] bg-[#f8fafc] hover:border-[#94a3b8] hover:bg-[#f1f5f9]'}`}
              >
                <input
                  type="radio"
                  name="isoTemplate"
                  value={c.id}
                  checked={checklistId === c.id}
                  onChange={() => setChecklistId(c.id)}
                  className="mt-[4px] accent-[#0f2c52] cursor-pointer"
                />
                <div className="flex flex-col gap-[4px]">
                  <strong className="text-[14px] text-[#1e293b] font-semibold">{c.title}</strong>
                  <span className="text-[12.5px] text-[#64748b]">{c.isoStandardName}</span>
                </div>
                {checklistId === c.id && <ShieldCheck size={22} className="ml-auto text-[#0f2c52]" />}
                <Link
                  to={`/audits/checklists/${c.id}/edit`}
                  className="absolute top-[14px] right-[14px] bg-white border border-[#e2e8f0] rounded-[6px] w-[28px] h-[28px] flex items-center justify-center text-[#64748b] no-underline opacity-0 transition-all duration-200 group-hover:opacity-100 hover:text-[#0f2c52] hover:border-[#94a3b8]"
                  aria-label={`Edit checklist ${c.title}`}
                  title="Edit checklist"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Pencil size={16} />
                </Link>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-[16px] bg-[#fff3cd] border border-[#ffeeba] rounded-[8px] mb-[24px]">
          <div className="flex flex-col gap-[4px]">
            <strong className="text-[14.5px] text-[#856404]">High Priority</strong>
            <span className="text-[13px] text-[#856404] opacity-80">Flag this audit for immediate review.</span>
          </div>
          <label className="relative inline-block w-[44px] h-[24px]">
            <input
              type="checkbox"
              checked={highPriority}
              onChange={(e) => setHighPriority(e.target.checked)}
              className="sr-only peer"
            />
            <div className="absolute cursor-pointer inset-0 bg-[#cbd5e1] transition-colors duration-300 rounded-[24px] peer-checked:bg-[#dc2626] before:absolute before:content-[''] before:h-[18px] before:w-[18px] before:left-[3px] before:bottom-[3px] before:bg-white before:transition-transform before:duration-300 before:rounded-full peer-checked:before:translate-x-[20px]"></div>
          </label>
        </div>

        {submitError && <p className="text-[#dc2626] text-[13px] m-0 mb-[16px]">{submitError}</p>}

        <div className="flex items-center justify-end gap-[12px] mt-[32px] pt-[20px] border-t border-[#e2e8f0]">
          <button type="submit" className="w-full sm:w-auto bg-[#0f2c52] text-white border-none p-[12px_24px] rounded-[8px] text-[14.5px] font-semibold cursor-pointer inline-flex items-center justify-center gap-[8px] transition-all hover:bg-[#0c2444] disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitting}>
            <Save size={16} /> {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}