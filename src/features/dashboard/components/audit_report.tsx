import { FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios_instance from '../../../shared/api/axios_instance';

// Sesuaikan dengan field asli dari GET /api/Dashboard/monthly-report
interface ReportItem {
  id: string;
  title: string;
  size: string;
  fileUrl?: string;
}

export default function AuditReport() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios_instance
      .get<ReportItem[]>('/Dashboard/monthly-report')
      .then((res) => setReports(res.data))
      .catch((err) => setError(err.response?.data?.message ?? 'Gagal memuat laporan'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = (report: ReportItem) => {
    if (!report.fileUrl) return;
    window.open(report.fileUrl, '_blank');
  };

  const handleView = (report: ReportItem) => {
    if (!report.fileUrl) return;
    window.open(report.fileUrl, '_blank');
  };

  return (
    <div className="audit-report-section">
      <p className="card-label">AUDIT REPORT</p>
      <div className="audit-report-grid">
        {loading && <p className="text-muted">Memuat laporan...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && reports.length === 0 && (
          <p className="text-muted">Belum ada laporan tersedia.</p>
        )}

        {reports.map((report) => (
          <div key={report.id} className="audit-report-card">
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
                <strong>{report.title}</strong>
                <p className="text-muted small">{report.size}</p>
              </div>
            </div>

            <div className="audit-report-actions">
              <button className="btn-download" onClick={() => handleDownload(report)}>
                Download
              </button>
              <button className="btn-view-report" onClick={() => handleView(report)}>
                View Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}