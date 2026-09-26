import { FileText, Download, FileCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../../shared/hooks/use_fetch';
import { getMonthlyReport, downloadAuditReportPdf } from '../api/dashboard_api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AuditReport() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data, loading, error } = useFetch(
    () => getMonthlyReport(month, year),
    [month, year]
  );

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async (sessionId: string, department: string) => {
    setDownloadingId(sessionId);
    setDownloadError(null);
    try {
      const blob = await downloadAuditReportPdf(sessionId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-report-${department}-${month}-${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setDownloadError(
        err.response?.status === 404
          ? 'PDF belum tersedia untuk audit ini.'
          : 'Gagal mengunduh PDF.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const reportCards = Array.isArray(data?.schedules)
    ? data.schedules.filter((row) => row.sessionId)
    : [];

  return (
    <div className="audit-report-section">
      <div className="audit-report-header">
        <p className="card-label">AUDIT REPORT</p>
      </div>

      {loading && <p className="text-muted">Memuat laporan...</p>}
      {error && <p className="error-text">{error}</p>}
      {downloadError && <p className="error-text">{downloadError}</p>}

      {data && reportCards.length === 0 && (
        <p className="text-muted">Belum ada audit report bulan ini.</p>
      )}

      {data && reportCards.length > 0 && (
        <div className="audit-report-grid">
          {reportCards.map((row, i) => (
            <div key={`${row.department}-${row.scheduledDate}-${i}`} className="audit-report-card">
              <div className="audit-report-thumbnail">
                <span className="skeleton-line w-60" />
                <span className="skeleton-line w-80" />
                <span className="skeleton-line w-50" />
              </div>

              <div className="audit-report-info">
                <div className="audit-report-icon">
                  <FileText size={18} />
                </div>
                <div>
                  <strong>{row.department} Audit Report</strong>
                  <p className="text-muted small">
                    {formatDate(row.scheduledDate)} · {row.status}
                    {row.totalFindings > 0 && ` · ${row.totalFindings} temuan`}
                  </p>
                </div>
              </div>

              <div className="audit-report-actions">
                <button
                  className="btn-download"
                  onClick={() => handleDownload(row.sessionId!, row.department)}
                  disabled={downloadingId === row.sessionId}
                >
                  <Download size={14} />
                  {downloadingId === row.sessionId ? 'Mengunduh...' : 'Download'}
                </button>
                <Link
                  to={`/audits/${row.planId}/schedule/${row.scheduleId}/report`}
                  className="btn-view-report"
                >
                  <FileCheck size={14} /> View Report
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}