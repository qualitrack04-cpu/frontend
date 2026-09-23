import { useParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { useAuditChecklist } from '../hooks/use_audit_checklist';
import ChecklistItemCard from './checklist_item_card';
import SuccessToast from './success_toast';
import AuditSummaryModal from './audit_summary_modal';
import { getFindingsBySession } from '../../findings/api/finding_api';
import { getSessionSummary } from '../api/audit_session_api';
//import { createCapaFromFinding } from '../../capa/api/capa_api';
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

    // Summary cuma boleh dibuat sekali per sesi — cek dulu sebelum buka modal
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
      const findings = await getFindingsBySession(session.id);
      const withoutCapa = findings.filter((f) => f.status === 'Open');

      if (withoutCapa.length === 0) {
        navigate('/capa');
        return;
      }
      setCapaError('Isi form CAPA untuk tiap temuan dulu sebelum submit (belum tersedia).');
    } catch (err: any) {
      setCapaError(err.response?.data?.message ?? 'Gagal submit CAPA');
    } finally {
      setSubmittingCapa(false);
    }
  };

  if (loading) return <div className="page-container"><p className="text-muted">Memuat checklist...</p></div>;
  if (error) return <div className="page-container"><p className="error-text">{error}</p></div>;

  if (needsChecklistSelection) {
    return (
      <div className="page-container">
        <button className="back-btn" onClick={() => navigate('/audits')}>← Back to Audits</button>
        <h1>Pilih Checklist</h1>
        <p className="page-subtitle">
          Jadwal {schedule?.clauseRef} ({schedule?.department}) belum punya sesi audit.
          Pilih checklist yang akan dipakai untuk memulai.
        </p>

        {checklistOptions.length === 0 && (
          <p className="text-muted">Belum ada checklist yang tersedia.</p>
        )}

        <div className="iso-template-list">
          {checklistOptions.map((c) => (
            <button
              key={c.id}
              type="button"
              className="iso-template-option"
              onClick={() => selectChecklist(c.id)}
            >
              <div className="iso-template-text">
                <strong>{c.title}</strong>
                <span>{c.standard} · {c.department}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button className="back-btn" onClick={() => navigate('/audits')}>← Back to Audits</button>

      <div className="checklist-header-row">
        <h1>Audit Checklist</h1>
        <span className="pending-badge">{pendingCount} Pending Items</span>
      </div>

      <div className="checklist-layout">
        <div className="checklist-items-column">
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

        <div className="checklist-sidebar">
          <div className="profile-card audit-details-card">
            <h3>Audit Details</h3>
            <div className="audit-detail-row">
              <span>Dept</span>
              <strong>{schedule?.department}</strong>
            </div>
            <div className="audit-detail-row">
              <span>Standard</span>
              <strong>{plan?.standard}</strong>
            </div>
            <div className="audit-detail-row">
              <span>Clause</span>
              <strong>{schedule?.clauseRef}</strong>
            </div>
            <div className="audit-detail-row">
              <span>Due Date</span>
              <strong>
                {schedule?.scheduledDate &&
                  new Date(schedule.scheduledDate).toLocaleDateString('en-US', {
                    month: 'short', day: '2-digit', year: 'numeric',
                  })}
              </strong>
            </div>

            <p className="completion-label">
              COMPLETION <span>{completionPercent}%</span>
            </p>
            <div className="compliance-bar">
              <div className="compliance-fill" style={{ width: `${completionPercent}%`, background: '#0f2c52' }} />
            </div>
          </div>

          <div className="instructions-box">
            <p className="instructions-title"><Info size={16} /> Instructions</p>
            <p>
              Review each item carefully. Provide photographic evidence for failed items.
              All items must be marked before submission.
            </p>
          </div>

          {capaError && <p className="error-text">{capaError}</p>}

          {summaryExists && (
            <button className="btn-save-progress" onClick={() => navigate(reportPath)}>
              View Audit Report →
            </button>
          )}
          {!summaryExists && completionPercent === 100 && items.length > 0 && !showSummaryModal && (
            <button className="btn-save-progress" onClick={() => setShowSummaryModal(true)}>
              Isi Audit Summary
            </button>
          )}

          <button className="btn-submit-capa" onClick={handleSubmitCapa} disabled={submittingCapa}>
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