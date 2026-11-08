import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CircleAlert, Save, ChevronDown, Check } from 'lucide-react';
import { useCreateAuditPlan } from '../hooks/use_create_audit_plan';
import DatePicker from '../../../shared/components/date_picker';

function toLocalisoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const todayIso = toLocalisoDate(new Date());
const minDateIso = '2020-01-01';
const maxDateIso = '2030-12-31';
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

  const [auditorOpen, setAuditorOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const auditorRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (auditorRef.current && !auditorRef.current.contains(event.target as Node)) {
        setAuditorOpen(false);
      }
      if (deptRef.current && !deptRef.current.contains(event.target as Node)) {
        setDeptOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedAuditor = auditors.find((a) => a.id === leadAuditorId);

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

      <form onSubmit={handleSubmit} className="bg-white border border-[#e2e8f0] rounded-[12px] p-5 sm:p-7 md:p-[32px] w-full max-w-full">
        <div className="text-[14px] font-bold text-[#0f2c52] uppercase tracking-[0.5px] m-0 mb-[16px]">Audit Details</div>
        <hr className="border-t border-[#e2e8f0] m-0 mb-[24px]" />

        <div className="flex flex-col gap-[8px] mb-[20px]">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Audit Title *</label>
            <span className="text-[11px] text-slate-400 font-medium">
              {title.length}/200
            </span>
          </div>
          <input
            type="text"
            maxLength={200}
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

        <div className="flex flex-col md:flex-row gap-[16px] mb-[20px] relative z-20">
          <div className="flex-1 min-w-0 flex flex-col gap-[8px] relative z-20">
            <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Lead Auditor</label>
            <div className="relative w-full" ref={auditorRef}>
              <button
                type="button"
                className="w-full p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-inherit text-[14.5px] bg-white transition-all duration-200 flex items-center justify-between text-left cursor-pointer focus:outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)]"
                onClick={() => {
                  setAuditorOpen(!auditorOpen);
                  setDeptOpen(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={auditorOpen}
              >
                <span className={`truncate flex-1 mr-2 ${selectedAuditor ? 'text-[#1e293b] font-medium' : 'text-[#94a3b8]'}`}>
                  {selectedAuditor ? selectedAuditor.fullName : (loadingOptions ? 'Loading auditors...' : 'Select Auditor')}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-[#64748b] shrink-0 transition-transform duration-200 ${auditorOpen ? 'rotate-180 text-[#0f2c52]' : ''}`}
                />
              </button>

              {auditorOpen && (
                <div
                  className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0_12px_30px_rgba(15,44,82,0.12)] z-50 max-h-[260px] overflow-y-auto p-1.5"
                  role="listbox"
                >
                  {auditors.length === 0 ? (
                    <div className="p-3 text-[13.5px] text-[#94a3b8] text-center">
                      No auditors available
                    </div>
                  ) : (
                    auditors.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className={`w-full text-left p-3 rounded-[6px] text-[14px] transition-all duration-150 flex items-start justify-between gap-2 cursor-pointer border-y-0 border-r-0 border-l-[3.5px] bg-white ${
                          leadAuditorId === a.id
                            ? 'border-l-[#006AFF] text-[#006AFF] font-semibold'
                            : 'border-l-transparent text-[#334155] hover:border-l-[#006AFF] hover:text-[#006AFF]'
                        }`}
                        onClick={() => {
                          setLeadAuditorId(a.id);
                          setAuditorOpen(false);
                        }}
                        role="option"
                        aria-selected={leadAuditorId === a.id}
                      >
                        <span className="break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-normal flex-1">
                          {a.fullName}
                        </span>
                        {leadAuditorId === a.id && (
                          <Check size={16} className="text-[#006AFF] shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {!loadingOptions && auditors.length === 0 && (
              <p className="text-slate-500 text-[12px] m-0">No auditors available.</p>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-[8px] relative z-20">
            <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Department</label>
            <div className="relative w-full" ref={deptRef}>
              <button
                type="button"
                className="w-full p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] font-inherit text-[14.5px] bg-white transition-all duration-200 flex items-center justify-between text-left cursor-pointer focus:outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)]"
                onClick={() => {
                  setDeptOpen(!deptOpen);
                  setAuditorOpen(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={deptOpen}
              >
                <span className={`truncate flex-1 mr-2 ${department ? 'text-[#1e293b] font-medium' : 'text-[#94a3b8]'}`}>
                  {department || (loadingOptions ? 'Loading departments...' : 'Select Department')}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-[#64748b] shrink-0 transition-transform duration-200 ${deptOpen ? 'rotate-180 text-[#0f2c52]' : ''}`}
                />
              </button>

              {deptOpen && (
                <div
                  className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0_12px_30px_rgba(15,44,82,0.12)] z-50 max-h-[260px] overflow-y-auto p-1.5"
                  role="listbox"
                >
                  {departments.length === 0 ? (
                    <div className="p-3 text-[13.5px] text-[#94a3b8] text-center">
                      No departments available
                    </div>
                  ) : (
                    departments.map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={`w-full text-left p-3 rounded-[6px] text-[14px] transition-all duration-150 flex items-start justify-between gap-2 cursor-pointer border-y-0 border-r-0 border-l-[3.5px] bg-white ${
                          department === d
                            ? 'border-l-[#006AFF] text-[#006AFF] font-semibold'
                            : 'border-l-transparent text-[#334155] hover:border-l-[#006AFF] hover:text-[#006AFF]'
                        }`}
                        onClick={() => {
                          setDepartment(d);
                          setDeptOpen(false);
                        }}
                        role="option"
                        aria-selected={department === d}
                      >
                        <span className="break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-normal flex-1">
                          {d}
                        </span>
                        {department === d && (
                          <Check size={16} className="text-[#006AFF] shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-[8px] mb-[20px]">
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Scheduled Date</label>
          <div className="relative flex items-center">
            <DatePicker
              min={isEdit ? minDateIso : todayIso}
              max={maxDateIso}
              value={scheduledDate}
              onChange={setScheduledDate}
            />
          </div>
        </div>

        <div className="flex flex-col gap-[8px] mb-[20px]">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Scope &amp; Description</label>
            <span className="text-[11px] text-slate-400 font-medium">
              {scopeDescription.length}/1000
            </span>
          </div>
          <textarea
            rows={4}
            maxLength={1000}
            placeholder="Enter detailed scope and objectives for this audit..."
            value={scopeDescription}
            onChange={(e) => setScopeDescription(e.target.value)}
            className="p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full box-border placeholder:text-[#94a3b8] font-inherit resize-y"
          />
        </div>

        <div className="flex flex-col gap-[8px] mb-[20px]">
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">ISO TEMPLATE</label>

          {loadingOptions && <p className="text-slate-500 m-0">Loading template...</p>}
          {!loadingOptions && !department && (
            <p className="text-slate-400 text-[13px] m-0 py-2">
              Please select a Department first to view available ISO templates.
            </p>
          )}
          {!loadingOptions && department && checklists.length === 0 && (
            <p className="text-slate-500 text-[13px] m-0 py-2">
              No checklist/template available for {department}.
            </p>
          )}

          <div className="flex flex-col gap-[12px] mt-[8px]">
            {checklists.map((c) => {
              const isSelected = checklistId === c.id;
              const displayTitle = c.title;
              const displaySubtitle = [c.isoStandardName, c.departmentName].filter(Boolean).join(' · ');

              return (
                <label
                  key={c.id}
                  className={`group relative flex items-center justify-between w-full border rounded-[10px] p-[16px_20px] cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-2 border-[#0f2c52] bg-white'
                      : 'border border-[#e2e8f0] bg-white hover:border-[#cbd5e1] hover:bg-[#fafafa]'
                  }`}
                >
                  <div className="flex items-center gap-[16px] min-w-0">
                    <input
                      type="radio"
                      name="isoTemplate"
                      value={c.id}
                      checked={isSelected}
                      onChange={() => setChecklistId(c.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-[20px] h-[20px] rounded-full border-[2px] flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-[#0f2c52]' : 'border-[#cbd5e1]'
                      }`}
                    >
                      {isSelected && <div className="w-[10px] h-[10px] rounded-full bg-[#0f2c52]" />}
                    </div>
                    <div className="flex flex-col gap-[3px] min-w-0">
                      <strong className="text-[15px] font-bold text-[#0f2c52] truncate">
                        {displayTitle}
                      </strong>
                      {displaySubtitle && (
                        <span className="text-[13px] text-[#64748b] truncate">
                          {displaySubtitle}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between py-[16px] mb-[24px]">
          <div className="flex flex-col gap-[4px]">
            <strong className="text-[15px] font-bold text-[#0f2c52]">High Priority</strong>
            <span className="text-[13px] text-[#64748b]">Flag this audit for immediate review.</span>
          </div>
          <label className="relative inline-block w-[44px] h-[24px] shrink-0">
            <input
              type="checkbox"
              checked={highPriority}
              onChange={(e) => setHighPriority(e.target.checked)}
              className="sr-only peer"
            />
            <div className="absolute cursor-pointer inset-0 bg-[#cbd5e1] transition-colors duration-300 rounded-[24px] peer-checked:bg-[#0f2c52] before:absolute before:content-[''] before:h-[18px] before:w-[18px] before:left-[3px] before:bottom-[3px] before:bg-white before:transition-transform before:duration-300 before:rounded-full peer-checked:before:translate-x-[20px]"></div>
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