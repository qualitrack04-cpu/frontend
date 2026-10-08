import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, FileText, Download, Check, Eye, Share2, Mail, MessageCircle, Copy } from 'lucide-react';
import { useState } from 'react';
import { useAuditReport } from '../hooks/use_audit_report';
import { generatePdfReport, downloadPdfReport, type PdfReportResult } from '../api/pdf_api';

export default function AuditReportPreviewPage() {
  const { planId, scheduleId } = useParams<{ planId: string; scheduleId: string }>();
  const navigate = useNavigate();
  const { plan, schedule, session, summary, results, loading, error } = useAuditReport(planId!, scheduleId!);

  const [generating, setGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfResult, setPdfResult] = useState<PdfReportResult | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  const handleDownload = async () => {
    if (!session) return;
    setDownloading(true);
    setPdfError(null);
    try {
      const blob = await downloadPdfReport(session.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-report-${session.id.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError('Gagal mengunduh PDF');
    } finally {
      setDownloading(false);
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

  if (loading) return <div className="max-w-full m-0 text-left"><p className="text-slate-500">Memuat laporan...</p></div>;
  if (error) return <div className="max-w-full m-0 text-left"><p className="text-red-600">{error}</p></div>;

  const auditIdShort = session?.id.slice(0, 8).toUpperCase();

  return (
    <div className="max-w-full m-0 text-left">
      <button className="inline-flex items-center gap-[8px] bg-transparent border-none text-[#64748b] text-[14px] font-semibold cursor-pointer p-0 mb-[16px] hover:text-[#1e293b]" onClick={() => navigate('/audits')}>← Back to Audits</button>
      <h1 className="text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6">Audit Report Preview</h1>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-[32px] items-start">
        <div className="flex flex-col gap-[24px]">
          <div className="bg-white rounded-[12px] p-[24px] border border-[#e2e8f0] flex flex-col">
            <h3 className="text-[15px] font-bold text-[#0f2c52] uppercase tracking-[0.5px] m-0 mb-[16px]">Audit Summary</h3>
            <hr className="border-t border-[#e2e8f0] m-0 mb-[24px]" />
            <div className="bg-[#f8fafc] rounded-[8px] p-[20px] text-[14.5px] text-[#1e293b] leading-[1.6]">{summary?.content || '—'}</div>
          </div>

          <div className="bg-white rounded-[12px] p-[24px] border border-[#e2e8f0] flex flex-col">
            <h3 className="text-[15px] font-bold text-[#0f2c52] uppercase tracking-[0.5px] m-0 mb-[16px]">Checklist Result</h3>
            <hr className="border-t border-[#e2e8f0] m-0 mb-[24px]" />
            <div className="flex flex-col gap-[12px]">
              {results.map((item) => (
                <div className="flex items-start gap-[12px] p-[16px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px]" key={item.id}>
                  <div className="bg-white w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[#94a3b8] border border-[#e2e8f0] shrink-0">
                    <FileText size={16} />
                  </div>
                  <span className="flex-1 text-[14px] text-[#1e293b] font-medium leading-[1.4]">{item.question}</span>
                  <span className={`p-[4px_10px] rounded-[12px] text-[12px] font-bold uppercase shrink-0 ${item.status === 'pass' ? 'bg-[#dcfce7] text-[#16a34a]' : item.status === 'fail' ? 'bg-[#fee2e2] text-[#dc2626]' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                    {item.status === 'pass' ? 'Pass' : item.status === 'fail' ? 'Fail' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky top-[24px] flex flex-col gap-[24px]">
          <div className="bg-white rounded-[12px] p-[24px] border border-[#e2e8f0] flex flex-col">
            <h3 className="text-[16px] m-0 mb-[20px] text-[#0f2c52] font-bold">Audit Detail</h3>

            <div className="flex justify-between mb-[12px] text-[14px]">
              <span className="text-[#64748b]">AUDIT ID</span>
              <span className="inline-block bg-[#f1f5f9] text-[#475569] text-[12px] font-bold p-[4px_10px] rounded-[12px] mb-[12px]">{auditIdShort}</span>
            </div>
            <div className="flex justify-between mb-[12px] text-[14px]">
              <span className="text-[#64748b]">DEPARTMENT</span>
              <strong className="text-[#0f2c52] text-right">{schedule?.department}</strong>
            </div>
            <div className="flex justify-between mb-[12px] text-[14px]">
              <span className="text-[#64748b]">AUDITOR</span>
              <span className="flex items-center gap-[8px] font-semibold text-[#0f2c52]">
                <span className="bg-[#f1f5f9] w-[24px] h-[24px] rounded-full flex items-center justify-center text-[12px] font-bold text-[#0f2c52]">{schedule?.auditorName?.charAt(0)}</span>
                {schedule?.auditorName}
              </span>
            </div>
            <div className="flex justify-between mb-[12px] text-[14px]">
              <span className="text-[#64748b]">AUDIT DATE</span>
              <strong className="flex items-center gap-[6px] text-[#0f2c52]">
                <Calendar size={14} />
                {schedule?.scheduledDate &&
                  new Date(schedule.scheduledDate).toLocaleDateString('en-US', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
              </strong>
            </div>
            <div className="flex justify-between mb-[12px] text-[14px]">
              <span className="text-[#64748b]">STANDARD</span>
              <span className="inline-block bg-[#f1f5f9] text-[#475569] text-[12px] font-bold p-[4px_10px] rounded-[12px] mb-[12px]">{plan?.standard}</span>
            </div>
            <div className="flex justify-between mb-[12px] text-[14px]">
              <span className="text-[#64748b]">AUDIT STATUS</span>
              <span className="bg-[#f1f5f9] text-[#0f2c52] text-[12px] font-bold p-[4px_10px] rounded-[12px]">
                ● {session?.status === 'InProgress' ? 'In Progress' : session?.status ?? '—'}
              </span>
            </div>
          </div>

          <div className="bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-[12px] p-[24px] text-center flex flex-col items-center">
            <div className="w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center text-[#0f2c52] mx-auto mb-[16px] shadow-[0_2px_8px_rgba(15,44,82,0.05)]"><FileText size={22} /></div>
            <h3 className="text-[16px] text-[#0f2c52] m-0 mb-[8px] font-bold">Ready to Export</h3>
            <p className="text-[13.5px] text-[#64748b] m-0 mb-[24px] leading-[1.5]">Generates an official ISO-formatted PDF report for archival and sharing.</p>

            {pdfError && <p className="text-[#dc2626] text-[13px] mt-[4px]">{pdfError}</p>}

            <button className="bg-[#0f2c52] text-white border-none p-[14px] rounded-[8px] text-[14.5px] font-semibold w-full flex items-center justify-center gap-[8px] cursor-pointer transition-colors duration-200 hover:bg-[#0c2444] disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleCreatePdf} disabled={generating}>
              <Download size={16} /> {generating ? 'Generating...' : 'Create PDF Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal: PDF berhasil dibuat */}
      {pdfResult && !showShareModal && (
        <div className="fixed inset-0 bg-[rgba(15,44,82,0.4)] backdrop-blur-[2px] flex items-end sm:items-center justify-center z-[1000] animate-[fadein_0.2s_ease-out]">
          <div className="bg-white w-full max-w-[360px] rounded-[20px] p-[32px_24px_24px_24px] flex flex-col items-center animate-[scalein_0.2s_cubic-bezier(0.175,0.885,0.32,1.275)] relative">
            <button
              type="button"
              className="absolute top-[16px] right-[16px] bg-transparent border-none text-[#94a3b8] cursor-pointer p-[4px] flex items-center justify-center transition-colors duration-200 hover:text-[#0f2c52]"
              onClick={() => setPdfResult(null)}
              aria-label="Tutup"
            >
              ✕
            </button>

            <div className="w-[64px] h-[64px] bg-[#dcfce7] text-[#16a34a] rounded-full flex items-center justify-center mb-[16px] shadow-[0_0_0_8px_rgba(22,163,74,0.1)]"><Check size={32} /></div>
            <p className="text-[18px] font-[800] text-[#0f2c52] m-0 mb-[24px] text-center">PDF created successfully</p>

            <div className="w-[140px] h-[180px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] mb-[24px] relative flex flex-col p-[16px_12px] shadow-[0_4px_12px_rgba(15,44,82,0.06)]">
              <div className="w-[60%] h-[4px] bg-[#0f2c52] rounded-[2px] mb-auto" />
              <div className="text-[9px] font-bold text-[#94a3b8] flex items-center gap-[4px] mb-[6px]"><FileText size={16} /> {plan?.title ?? 'Your Company'}</div>
              <div className="text-[11px] font-[800] text-[#0f2c52] leading-[1.3]">Audit Compliance Report</div>
            </div>

            {pdfError && <p className="text-[#dc2626] text-[13px] mt-[4px]">{pdfError}</p>}

            <div className="flex gap-[8px] w-full">
              <a href={pdfResult.pdfUrl} target="_blank" rel="noreferrer" className="flex-1 bg-[#f1f5f9] text-[#0f2c52] border-none p-[12px] rounded-[8px] text-[14px] font-bold no-underline flex items-center justify-center gap-[6px] transition-all duration-200 hover:bg-[#e2e8f0]">
                <Eye size={16} /> View
              </a>
              <button
                type="button"
                className="bg-[#f1f5f9] text-[#0f2c52] border-none w-[44px] rounded-[8px] flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-[#e2e8f0]"
                onClick={() => setShowShareModal(true)}
                aria-label="Share"
              >
                <Share2 size={16} />
              </button>
              <button
                type="button"
                className="flex-[2] bg-[#0f2c52] text-white border-none p-[12px] rounded-[8px] text-[14px] font-bold flex items-center justify-center gap-[6px] cursor-pointer transition-colors duration-200 hover:bg-[#0c2444] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download size={16} /> {downloading ? 'Downloading...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Share Audit Report */}
      {pdfResult && showShareModal && (
        <div className="fixed inset-0 bg-[rgba(15,44,82,0.4)] backdrop-blur-[2px] flex items-end sm:items-center justify-center z-[1000] animate-[fadein_0.2s_ease-out]">
          <div className="bg-white w-full max-w-[400px] rounded-t-[20px] sm:rounded-[16px] flex flex-col animate-[slideup_0.2s_ease-out]">
            <div className="flex justify-between items-center p-[20px_24px] border-b border-[#e2e8f0]">
              <h3 className="text-[16px] font-bold text-[#0f2c52] m-0">Share Audit Report</h3>
              <button
                type="button"
                className="bg-transparent border-none text-[#94a3b8] cursor-pointer p-[4px] flex items-center justify-center transition-colors duration-200 hover:text-[#0f2c52]"
                onClick={() => setShowShareModal(false)}
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <div className="p-[24px]">
              <div className="flex items-center gap-[12px] bg-[#f8fafc] p-[12px_16px] rounded-[8px] mb-[24px]">
                <div className="w-[32px] h-[32px] bg-[#0f2c52] text-white rounded-[6px] flex items-center justify-center"><FileText size={18} /></div>
                <span className="text-[13.5px] font-semibold text-[#0f2c52] flex items-center gap-[6px]"><Check size={14} className="text-[#16a34a]" /> PDF Created &amp; Ready to Share</span>
              </div>

              <p className="text-[13px] font-bold text-[#64748b] m-0 mb-[12px]">Share via</p>
              <div className="flex gap-[12px] mb-[24px]">
                <a
                  className="flex-1 flex flex-col items-center gap-[8px] bg-white border border-[#e2e8f0] p-[16px_8px] rounded-[12px] text-[13px] font-semibold text-[#1e293b] no-underline transition-all duration-200 hover:bg-[#f8fafc] hover:border-[#cbd5e1]"
                  href={`mailto:?subject=Audit Report&body=${encodeURIComponent(pdfResult.pdfUrl)}`}
                >
                  <span className="w-[40px] h-[40px] bg-[#f1f5f9] rounded-full flex items-center justify-center text-[#0f2c52]"><Mail size={20} /></span>
                  Email
                </a>
                <a
                  className="flex-1 flex flex-col items-center gap-[8px] bg-white border border-[#e2e8f0] p-[16px_8px] rounded-[12px] text-[13px] font-semibold text-[#1e293b] no-underline transition-all duration-200 hover:bg-[#f8fafc] hover:border-[#cbd5e1]"
                  href={`https://wa.me/?text=${encodeURIComponent(pdfResult.pdfUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="w-[40px] h-[40px] bg-[#f1f5f9] rounded-full flex items-center justify-center text-[#0f2c52]"><MessageCircle size={20} /></span>
                  WhatsApp
                </a>
              </div>

              <p className="text-[13px] font-bold text-[#64748b] m-0 mb-[12px]">Share Link</p>
              <div className="flex gap-[8px]">
                <input type="text" readOnly value={pdfResult.pdfUrl} className="flex-1 p-[12px] border border-[#e2e8f0] bg-[#f8fafc] rounded-[8px] text-[13.5px] text-[#475569] outline-none" />
                <button type="button" className="bg-[#f1f5f9] text-[#0f2c52] border-none p-[0_16px] rounded-[8px] text-[13.5px] font-bold cursor-pointer flex items-center gap-[6px] transition-all duration-200 hover:bg-[#e2e8f0]" onClick={handleCopyLink}>
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