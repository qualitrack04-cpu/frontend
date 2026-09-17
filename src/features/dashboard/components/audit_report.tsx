import { FileText,Download } from 'lucide-react';
import { useState } from 'react';
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
    try{
      const blob = await downloadAuditReportPdf(sessionId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-report-${department}-${month}-${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }catch (err: any){
       setDownloadError(
        err.response?.status === 404
          ? 'PDF belum tersedia untuk audit ini.'
          : 'Gagal mengunduh PDF.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="audit-report-section">
      <div className="audit-report-header">
        <p className="card-label">MONTHLY REPORT</p>
        {data && (
          <span className="text-muted small">
            Dibuat {formatDate(data.generatedAt)}
          </span>
        )}
      </div>

      {loading && <p className="text-muted">Memuat laporan...</p>}
      {error && <p className="error-text">{error}</p>}
      {downloadError && <p className="error-text">{downloadError}</p>}

      {data && (
        <>
          <div className="report-summary-grid">
            {[
              { label: 'Total Jadwal', value: data.summary.totalSchedules },
              { label: 'Selesai', value: data.summary.completedAudit },
              { label: 'Berjalan', value: data.summary.inProgressAudit },
              { label: 'Belum Mulai', value: data.summary.notStartedAudit },
              { label: 'Temuan', value: data.summary.totalFindings },
              { label: 'CAPA Overdue', value: data.summary.capaOverdue },
              { label: 'Compliance', value: `${data.summary.complianceScore.toFixed(1)}%`},
            ].map((stat) => (
              <div key={stat.label} className="report-summary-box">
                <span className="summary-value">{stat.value}</span>
                <span className="summary-label">{stat.label}</span>
              </div>
            ))}
          </div>

          <table className="report-table">
            <thead>
              <tr>
                <th>Departemen</th>
                <th>Auditor</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Temuan</th>
                <th>Major</th>
                <th>Minor</th>
                <th>Obs</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.schedules.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-muted">
                    Belum ada audit bulan ini.
                  </td>
                </tr>
              )}
              {data.schedules.map((row, i) => (
                <tr key={`${row.department}-${row.scheduledDate}-${i}`}>
                  <td>
                    <FileText size={14} /> {row.department}
                  </td>
                  <td>{row.auditorName}</td>
                  <td>{formatDate(row.scheduledDate)}</td>
                  <td>{row.status}</td>
                  <td>{row.totalFindings}</td>
                  <td>{row.majorNC}</td>
                  <td>{row.minorNC}</td>
                  <td>{row.observation}</td>
                  <td>
                    {row.sessionId ? (
                      <button
                        className="btn-download-pdf"
                        onClick={() => handleDownload(row.sessionId!, row.department)}
                        disabled={downloadingId === row.sessionId}
                      >
                        <Download size={14} />
                        {downloadingId === row.sessionId ? 'Mengunduh...' : 'PDF'}
                      </button>
                    ): (
                      <span className="text-muted small">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}