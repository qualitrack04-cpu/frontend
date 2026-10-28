import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RefreshCw, TriangleAlert } from 'lucide-react';
import DatePicker from '../../../shared/components/date_picker';
import { useCreateCapa } from '../hooks/use_create_capa';

export default function CreateCapaPage() {
  const {
    title, setTitle,
    findingId, setFindingId,
    description, setDescription,
    actionPlan, setActionPlan,
    picId, setPicId,
    deadline, setDeadline,
    findings,
    pics,
    loadingOptions,
    findingsError,
    refreshFindings,
    titleError,
    descriptionError,
    actionPlanError,
    submitError,
    submitting,
    handleSubmit,
  } = useCreateCapa();

  return (
    <div className="max-w-full m-0 text-left">
      <Link to="/capa" className="inline-flex items-center gap-[8px] text-[#64748b] no-underline text-[14px] font-semibold mb-[16px] transition-colors hover:text-[#1e293b]">
        <ArrowLeft size={18} /> Back to CAPA List
      </Link>
      <h1 className="text-2xl sm:text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6">Create CAPA</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-5 sm:p-6 md:p-[24px]">
          <div className="flex flex-col gap-[8px] mb-[20px]">
            <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">TITLE</label>
            <input
              type="text"
              placeholder="Enter CAPA title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-[12px_14px] border-[1.5px] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none placeholder:text-[#94a3b8] ${titleError ? 'border-[#dc2626] focus:border-[#dc2626] focus:ring-[3px] focus:ring-[rgba(220,38,38,0.1)]' : 'border-[#e2e8f0] focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)]'}`}
            />
            {titleError && <p className="text-[#dc2626] text-[13px] m-0 mt-[4px]">{titleError}</p>}
          </div>

          <div className="flex flex-col gap-[8px] mb-[20px]">
            <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">LINKED FINDING</label>
            {loadingOptions && <p className="text-slate-500 m-0">Memuat finding...</p>}
            {!loadingOptions && findingsError && (
              <div className="flex items-center justify-between bg-[#fff3cd] text-[#856404] p-[10px_14px] rounded-[6px] text-[13.5px]">
                <span className="flex items-center gap-[6px]">
                  <TriangleAlert size={16} /> {findingsError}
                </span>
                <button type="button" className="bg-transparent border-none text-[#856404] font-semibold flex items-center gap-[4px] cursor-pointer hover:underline" onClick={refreshFindings}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
            )}
            {!loadingOptions && findings.length > 0 && (
              <select value={findingId} onChange={(e) => setFindingId(e.target.value)} className="w-full p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)]">
                <option value="">Select Finding</option>
                {findings.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.clauseRef ? `${f.clauseRef} - ${f.title}` : f.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-[8px] mb-[20px]">
            <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">DESCRIPTION</label>
            <textarea
              rows={5}
              placeholder="Detail the corrective action..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-[12px_14px] border-[1.5px] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none placeholder:text-[#94a3b8] font-inherit resize-y ${descriptionError ? 'border-[#dc2626] focus:border-[#dc2626] focus:ring-[3px] focus:ring-[rgba(220,38,38,0.1)]' : 'border-[#e2e8f0] focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)]'}`}
            />
            {descriptionError && <p className="text-[#dc2626] text-[13px] m-0 mt-[4px]">{descriptionError}</p>}
          </div>

          <div className="flex flex-col gap-[8px] mb-0">
            <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">ACTION PLAN</label>
            <textarea
              rows={5}
              placeholder="Step-by-step action plan..."
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              className={`w-full p-[12px_14px] border-[1.5px] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none placeholder:text-[#94a3b8] font-inherit resize-y ${actionPlanError ? 'border-[#dc2626] focus:border-[#dc2626] focus:ring-[3px] focus:ring-[rgba(220,38,38,0.1)]' : 'border-[#e2e8f0] focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)]'}`}
            />
            {actionPlanError && <p className="text-[#dc2626] text-[13px] m-0 mt-[4px]">{actionPlanError}</p>}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-5 sm:p-6 md:p-[24px] mb-[24px]">
            <div className="flex flex-col gap-[8px] mb-[20px]">
              <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">PERSON IN CHARGE</label>
              <select value={picId} onChange={(e) => setPicId(e.target.value)} className="w-full p-[12px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white transition-all duration-200 outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)]">
                <option value="">Select Assignee</option>
                {pics.map((p) => (
                  <option key={p.id} value={p.id}>{p.fullName}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-[8px] mb-0">
              <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">TARGET DATE</label>
              <DatePicker
                value={deadline}
                onChange={setDeadline}
                placeholder="dd-mm-yyyy"
              />
            </div>
          </div>

          <div className="bg-[#f1f5f9] border-l-[4px] border-l-[#0f2c52] p-[16px] rounded-[4px] mb-[24px]">
            <h3 className="text-[14px] font-bold text-[#0f2c52] m-0 mb-[8px]">Submission Guidelines</h3>
            <p className="text-[13.5px] text-[#475569] leading-[1.5] m-0">
              Ensure all required fields are filled completely before submitting. Incomplete
              CAPAs may be rejected by the Quality Assurance team.
            </p>
          </div>

          {submitError && <p className="text-[#dc2626] text-[13px] m-0 mb-[16px]">{submitError}</p>}

          <button type="submit" className="w-full bg-[#0f2c52] text-white border-none p-[14px] rounded-[8px] text-[15px] font-semibold cursor-pointer flex items-center justify-center gap-[8px] transition-all hover:bg-[#0c2444] hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit CAPA'} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
