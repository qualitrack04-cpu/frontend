import { useParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useAuditChecklist } from '../hooks/use_audit_checklist';
import ChecklistItemCard from './checklist_item_card';
import SuccessToast from './success_toast';
import AuditSummaryModal from './audit_summary_modal';
import { getFindings } from '../../findings/api/findings_api';
import { getSessionSummary } from '../api/audit_session_api';
import { useState, useEffect } from 'react';

export default function AuditChecklistPage() {
  const { planId, scheduleId } = useParams<{ planId: string; scheduleId: string }>();
  const {
    plan, schedule, session, items, loading, error,
    needsChecklistSelection, checklistOptions, selectChecklist,
    pendingCount, completionPercent,
    markStatus, submitFinding, navigate,
  } = useAuditChecklist(planId!, scheduleId!);

  const [submittingCapa, setSubmittingCapa] = useState(false);
  const [capaError, setCapaError] = useState<string | null>(null);
  const [showEvidenceToast, setShowEvidenceToast] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryExists, setSummaryExists] = useState(false);

  const reportPath = `/audits/${planId}/schedule/${scheduleId}/report`;

  useEffect(() => {
    if (!session || completionPercent !== 100 || items.length === 0) return;
    let cancelled = false;

    getSessionSummary(session.id)
      .then(() => {
        if (!cancelled) setSummaryExists(true);
      })
      .catch((err: any) => {
        if (cancelled) return;
        if (err.response?.status === 404) setShowSummaryModal(true);
      });

    return () => {
      cancelled = true;
    };
  }, [session, completionPercent, items.length]);

  const handleSubmitCapa = async () => {
    if (!session) return;
    setSubmittingCapa(true);
    setCapaError(null);
    try {
      const findings = await getFindings({ sessionId: session.id } as any);
      const withoutCapa = findings.filter((f) => f.status === 'Open');

      if (withoutCapa.length === 0) {
        navigate('/capa');
        return;
      }
      setCapaError('Fill out CAPA form for each finding before submitting.');
    } catch (err: any) {
      setCapaError(err.response?.data?.message ?? 'Failed to submit CAPA');
    } finally {
      setSubmittingCapa(false);
    }
  };

  if (loading) return <div className="max-w-full m-0 text-left"><p className="text-slate-500">Loading checklist...</p></div>;
  if (error) return <div className="max-w-full m-0 text-left"><p className="text-red-600">{error}</p></div>;

  if (needsChecklistSelection) {
    return (
      <div className="max-w-full m-0 text-left">
        <button className="inline-flex items-center gap-[8px] bg-transparent border-none text-[#64748b] text-[14px] font-semibold cursor-pointer p-0 mb-[16px] hover:text-[#1e293b]" onClick={() => navigate('/audits')}>← Back to Audits</button>
        <h1 className="text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6">Select Checklist</h1>
        <p className="text-slate-500 mt-[-6px] mb-[16px] text-[13px]">
          Schedule {schedule?.clauseRef} ({schedule?.department}) has no audit session yet.
          Select a checklist to begin.
        </p>

        {checklistOptions.length === 0 && (
          <p className="text-slate-500">No checklists available.</p>
        )}

        <div className="flex flex-col gap-[12px] mt-[16px]">
          {checklistOptions.map((c) => (
            <button
              key={c.id}
              type="button"
              className="bg-white border-[2px] border-[#e2e8f0] rounded-[8px] p-[16px_20px] flex items-center justify-between cursor-pointer transition-all duration-200 text-left w-full hover:border-[#0f2c52] hover:bg-[#f8fafc]"
              onClick={() => selectChecklist(c.id)}
            >
              <div className="flex flex-col gap-[4px]">
                <strong className="text-[15px] font-bold text-[#0f2c52]">{c.title}</strong>
                <span className="text-[13px] text-[#64748b]">{c.isoStandardName} · {c.departmentName}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full m-0 text-left">
      <button className="inline-flex items-center gap-[8px] bg-transparent border-none text-[#64748b] text-[14px] font-semibold cursor-pointer p-0 mb-[16px] hover:text-[#1e293b]" onClick={() => navigate('/audits')}>← Back to Audits</button>

      <div className="flex justify-between items-center mb-[24px]">
        <h1 className="text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6">Audit Checklist</h1>
        <span className="bg-[#fef3c7] text-[#92400e] p-[6px_16px] rounded-[20px] text-[14px] font-bold">{pendingCount} Pending Items</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-[32px] items-start">
        <div className="flex flex-col gap-[24px]">
          {items.map((item) => (
            <ChecklistItemCard
              key={item.id}
              item={item}
              onMark={markStatus}
              onSubmitFinding={submitFinding}
              onEvidenceUploaded={() => setShowEvidenceToast(true)}
            />
          ))}
        </div>

        <div className="sticky top-[24px] flex flex-col gap-[20px]">
          <div className="bg-white rounded-[12px] p-[24px] border border-[#e2e8f0] flex flex-col">
            <h3 className="text-[16px] m-0 mb-[20px] text-[#0f2c52] font-bold">Audit Details</h3>
            <div className="flex justify-between mb-[12px] text-[14px]">
              <span className="text-[#64748b]">Dept</span>
              <strong className="text-[#0f2c52] text-right">{schedule?.department}</strong>
            </div>
            <div className="flex justify-between mb-[12px] text-[14px]">
              <span className="text-[#64748b]">Standard</span>
              <strong className="text-[#0f2c52] text-right">{plan?.standard}</strong>
            </div>
            <div className="flex justify-between mb-[12px] text-[14px]">
              <span className="text-[#64748b]">Clause</span>
              <strong className="text-[#0f2c52] text-right">{schedule?.clauseRef}</strong>
            </div>
            <div className="flex justify-between mb-[12px] text-[14px]">
              <span className="text-[#64748b]">Due Date</span>
              <strong className="text-[#0f2c52] text-right">
                {schedule?.scheduledDate &&
                  new Date(schedule.scheduledDate).toLocaleDateString('en-US', {
                    month: 'short', day: '2-digit', year: 'numeric',
                  })}
              </strong>
            </div>

            <p className="flex justify-between text-[12px] font-bold text-[#64748b] m-[24px_0_8px_0] pt-[20px] border-t border-[#e2e8f0]">
              COMPLETION <span className="text-[#0f2c52] text-[14px]">{completionPercent}%</span>
            </p>
            <div className="w-full h-[8px] bg-[#f1f5f9] rounded-[4px] overflow-hidden">
              <div className="h-full rounded-[4px] transition-[width] duration-500 ease-out" style={{ width: `${completionPercent}%`, background: '#0f2c52' }} />
            </div>
          </div>

          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] p-[20px]">
            <p className="flex items-center gap-[8px] text-[14px] font-bold text-[#0f2c52] m-0 mb-[8px]"><Info size={16} /> Instructions</p>
            <p className="text-[13.5px] text-[#475569] leading-[1.5] m-0">
              Review each item carefully. Provide photographic evidence for failed items.
              All items must be marked before submission.
            </p>
          </div>

          {capaError && <p className="text-[#dc2626] text-[13px] mt-[4px]">{capaError}</p>}

          {summaryExists && (
            <button className="bg-white text-[#0f2c52] border-[2px] border-[#0f2c52] p-[14px] rounded-[8px] text-[15px] font-bold w-full cursor-pointer transition-all duration-200 text-center hover:bg-[#f8fafc]" onClick={() => navigate(reportPath)}>
              View Audit Report →
            </button>
          )}
          {!summaryExists && completionPercent === 100 && items.length > 0 && !showSummaryModal && (
            <button className="bg-white text-[#0f2c52] border-[2px] border-[#0f2c52] p-[14px] rounded-[8px] text-[15px] font-bold w-full cursor-pointer transition-all duration-200 text-center hover:bg-[#f8fafc]" onClick={() => setShowSummaryModal(true)}>
              Isi Audit Summary
            </button>
          )}

          <button className="bg-[#0f2c52] text-white border-none p-[14px] rounded-[8px] text-[15px] font-bold w-full cursor-pointer transition-colors duration-200 hover:bg-[#0c2444] disabled:opacity-70 disabled:cursor-not-allowed" onClick={handleSubmitCapa} disabled={submittingCapa}>
            {submittingCapa ? 'Submitting...' : 'Submit CAPA →'}
          </button>
        </div>
      </div>

      {showEvidenceToast && (
        <SuccessToast message="Evidence Uploaded" onDismiss={() => setShowEvidenceToast(false)} />
      )}

      {showSummaryModal && session && (
        <AuditSummaryModal
          sessionId={session.id}
          onSaved={() => navigate(reportPath)}
          onClose={() => setShowSummaryModal(false)}
        />
      )}
    </div>
  );
}