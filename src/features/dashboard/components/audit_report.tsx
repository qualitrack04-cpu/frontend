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
    <div className="mt-[24px]">
      <div className="mb-[12px]">
        <p className="text-[11px] font-bold tracking-[0.8px] text-slate-500 uppercase m-0">AUDIT REPORT</p>
      </div>

      {loading && <p className="text-slate-500">Memuat laporan...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {downloadError && <p className="text-red-600">{downloadError}</p>}

      {data && reportCards.length === 0 && (
        <p className="text-slate-500">Belum ada audit report bulan ini.</p>
      )}

      {data && reportCards.length > 0 && (
        <div className="flex flex-col gap-[16px]">
          <div className="grid grid-cols-4 gap-[16px] max-[1100px]:grid-cols-2 max-[600px]:grid-cols-1">
            {reportCards.slice(0, 5).map((row, i) => (
              <div key={`${row.department}-${row.scheduledDate}-${i}`} className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px] flex flex-col gap-[14px]">
                <div className="bg-[#eef1fb] rounded-[8px] p-[16px] flex flex-col gap-[8px]">
                  <span className="block h-[8px] rounded-full bg-[#d6dcf5] w-[60%]" />
                  <span className="block h-[8px] rounded-full bg-[#d6dcf5] w-[80%]" />
                  <span className="block h-[8px] rounded-full bg-[#d6dcf5] w-[50%]" />
                </div>

                <div className="flex items-start gap-[10px] text-[#08060d]">
                  <div className="w-[36px] h-[36px] rounded-[8px] bg-[#dbeafe] text-[#1e40af] flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <strong className="text-[#0f2c52] text-[14px] leading-[1.3] block">{row.department} Audit Report</strong>
                    <p className="text-slate-500 text-[12px] m-0">
                      {formatDate(row.scheduledDate)} · {row.status}
                      {row.totalFindings > 0 && ` · ${row.totalFindings} temuan`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-[8px]">
                  <button
                    className="flex-1 bg-[#0f2c52] text-white border-none rounded-[8px] p-[10px] text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-[6px] hover:bg-[#0c2444]"
                    onClick={() => handleDownload(row.sessionId!, row.department)}
                    disabled={downloadingId === row.sessionId}
                  >
                    <Download size={14} />
                    {downloadingId === row.sessionId ? 'Mengunduh...' : 'Download'}
                  </button>
                  <Link
                    to={`/audits/${row.planId}/schedule/${row.scheduleId}/report`}
                    className="flex-1 bg-[#dbeafe] text-[#1e40af] rounded-[8px] p-[10px] text-[13px] font-semibold no-underline flex items-center justify-center gap-[6px] hover:bg-[#bfdbfe]"
                  >
                    <FileCheck size={14} /> View Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}