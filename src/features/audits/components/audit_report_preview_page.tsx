import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, FileText, Download, Check, Eye, Share2, Mail, MessageCircle, Copy } from 'lucide-react';
import { useState } from 'react';
import { useAuditReport } from '../hooks/use_audit_report';
import { generatePdfReport, type PdfReportResult } from '../api/pdf_api';

export default function AuditReportPreviewPage() {
  const { planId, scheduleId } = useParams<{ planId: string; scheduleId: string }>();
  const navigate = useNavigate();
  const { plan, schedule, session, summary, results, loading, error } = useAuditReport(planId!, scheduleId!);

  const [generating, setGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfResult, setPdfResult] = useState<PdfReportResult | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreatePdf = async () => {
    if (!session) return;
    setGenerating(true);
    setPdfError(null);
    try {
      const result = await generatePdfReport(session.id);
      setPdfResult(result);
    } catch (err: any) {
      setPdfError(err.response?.data?.message ?? 'Gagal membuat PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!pdfResult) return;
    try {
      await navigator.clipboard.writeText(pdfResult.pdfUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  if (loading) return <div className="page-container"><p className="text-muted">Memuat laporan...</p></div>;
  if (error) return <div className="page-container"><p className="error-text">{error}</p></div>;

  const auditIdShort = session?.id.slice(0, 8).toUpperCase();

  return (
    <div className="page-container">
      <button className="back-btn" onClick={() => navigate('/audits')}>← Back to Audits</button>
      <h1>Audit Report Preview</h1>

      <div className="report-layout">
        <div className="report-main-column">
          <div className="profile-card report-section-card">
            <h3>Audit Summary</h3>
            <hr className="form-section-divider" />
            <div className="report-summary-box">{summary?.content || '—'}</div>
          </div>

          <div className="profile-card report-section-card">
            <h3>Checklist Result</h3>
            <hr className="form-section-divider" />
            <div className="checklist-result-list">
              {results.map((item) => (
                <div className="checklist-result-item" key={item.id}>
                  <div className="checklist-result-icon">
                    <FileText size={16} />
                  </div>
                  <span>{item.question}</span>
                  <span className={`result-badge result-badge--${item.status}`}>
                    {item.status === 'pass' ? 'Pass' : item.status === 'fail' ? 'Fail' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="report-sidebar">
          <div className="profile-card">
            <h3>Audit Detail</h3>

            <div className="audit-detail-row">
              <span>AUDIT ID</span>
              <span className="tag-badge">{auditIdShort}</span>
            </div>
            <div className="audit-detail-row">
              <span>DEPARTMENT</span>
              <strong>{schedule?.department}</strong>
            </div>
            <div className="audit-detail-row">
              <span>AUDITOR</span>
              <span className="auditor-chip">
                <span className="auditor-avatar">{schedule?.auditorName?.charAt(0)}</span>
                {schedule?.auditorName}
              </span>
            </div>
            <div className="audit-detail-row">
              <span>AUDIT DATE</span>
              <strong className="detail-with-icon">
                <Calendar size={14} />
                {schedule?.scheduledDate &&
                  new Date(schedule.scheduledDate).toLocaleDateString('en-US', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
              </strong>
            </div>
            <div className="audit-detail-row">
              <span>STANDARD</span>
              <span className="tag-badge">{plan?.standard}</span>
            </div>
            <div className="audit-detail-row">
              <span>AUDIT STATUS</span>
              <span className="status-dot-badge">● Completed</span>
            </div>
          </div>

          <div className="ready-export-card">
            <div className="ready-export-icon"><FileText size={22} /></div>
            <h3>Ready to Export</h3>
            <p>Generates an official ISO-formatted PDF report for archival and sharing.</p>

            {pdfError && <p className="error-text">{pdfError}</p>}

            <button className="btn-create-pdf" onClick={handleCreatePdf} disabled={generating}>
              <Download size={16} /> {generating ? 'Generating...' : 'Create PDF Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal: PDF berhasil dibuat */}
      {pdfResult && !showShareModal && (
        <div className="modal-overlay">
          <div className="pdf-success-box">
            <button
              type="button"
              className="modal-close-btn pdf-success-close"
              onClick={() => setPdfResult(null)}
              aria-label="Tutup"
            >
              ✕
            </button>

            <div className="pdf-success-icon"><Check size={32} /></div>
            <p className="pdf-success-title">PDF created successfully</p>

            <div className="pdf-thumbnail-card">
              <div className="pdf-thumbnail-shape" />
              <div className="pdf-thumbnail-logo"><FileText size={16} /> {plan?.title ?? 'Your Company'}</div>
              <div className="pdf-thumbnail-title">Audit Compliance Report</div>
            </div>

            <div className="pdf-success-actions">
              <a href={pdfResult.pdfUrl} target="_blank" rel="noreferrer" className="btn-view">
                <Eye size={16} /> View
              </a>
              <button
                type="button"
                className="btn-share-icon"
                onClick={() => setShowShareModal(true)}
                aria-label="Share"
              >
                <Share2 size={16} />
              </button>
              <a href={pdfResult.pdfUrl} download className="btn-download">
                <Download size={16} /> Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Share Audit Report */}
      {pdfResult && showShareModal && (
        <div className="modal-overlay">
          <div className="share-modal-box">
            <div className="share-modal-header">
              <h3>Share Audit Report</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowShareModal(false)}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="share-modal-body">
              <div className="share-status-row">
                <div className="pdf-file-icon"><FileText size={18} /></div>
                <span><Check size={14} className="status-check-icon" /> PDF Created &amp; Ready to Share</span>
              </div>

              <p className="share-section-label">Share via</p>
              <div className="share-via-row">
                <a
                  className="share-via-btn"
                  href={`mailto:?subject=Audit Report&body=${encodeURIComponent(pdfResult.pdfUrl)}`}
                >
                  <span className="share-via-icon"><Mail size={20} /></span>
                  Email
                </a>
                <a
                  className="share-via-btn"
                  href={`https://wa.me/?text=${encodeURIComponent(pdfResult.pdfUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="share-via-icon"><MessageCircle size={20} /></span>
                  WhatsApp
                </a>
              </div>

              <p className="share-section-label">Share Link</p>
              <div className="share-link-row">
                <input type="text" readOnly value={pdfResult.pdfUrl} />
                <button type="button" className="btn-copy-link" onClick={handleCopyLink}>
                  <Copy size={14} /> {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}