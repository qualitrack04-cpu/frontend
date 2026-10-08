import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, ClipboardList } from 'lucide-react';
import { useCapaDetail } from '../hooks/use_capa_detail';
import CapaStatusBadge from './capa_status_badge';

function formatDate(iso?: string | null) {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function initials(name?: string | null) {
  if (!name) return '-';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export default function CapaDetailPage() {
  const { id = '' } = useParams();
  const { capa, loading, error } = useCapaDetail(id);

  return (
    <div className="max-w-full m-0 text-left">
      <Link to="/capa" className="inline-flex items-center gap-[8px] text-[#64748b] text-[14px] font-semibold no-underline mb-[24px] transition-colors duration-200 hover:text-[#0f2c52]">
        <ArrowLeft size={18} /> Back to CAPA List
      </Link>
      <h1 className="text-[3rem] font-bold text-[#0f2c52] m-0 mb-[20px] tracking-[-0.5px] leading-[1.25]">CAPA Detail</h1>

      {loading && <p className="text-slate-500">Memuat CAPA...</p>}
      {error && <p className="text-[#dc2626] text-[13px] mt-[4px]">{error}</p>}

      {capa && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-[32px] items-start">
          <div className="flex flex-col gap-[24px]">
            <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px]">
              {/* ⚠️ ASUMSI: tidak ada field "title" di CAPA, jadi rootCause
                  dipakai sebagai ringkasan utama di bagian atas. */}
              <span className="block text-[11px] font-bold text-[#64748b] uppercase mb-[4px]">Root Cause</span>
              <h2 className="text-[20px] text-[#0f2c52] m-0 mb-[32px] leading-[1.4] font-bold">{capa.rootCause || '-'}</h2>

              <span className="block text-[14px] font-bold text-[#0f2c52] m-0 mb-[16px] uppercase tracking-[0.5px]">FINDINGS</span>
              <Link to={`/findings/${capa.findingId}`} className="inline-flex items-center gap-[8px] bg-[#f1f5f9] text-[#0f2c52] p-[8px_16px] rounded-[8px] text-[14px] font-semibold no-underline transition-all duration-200 border border-transparent hover:bg-[#e2e8f0] hover:border-[#cbd5e1]">
                <ClipboardList size={16} />
                {capa.findingTitle || 'Finding tidak diketahui'}
              </Link>
            </section>

            <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px]">
              <div className="flex items-center mb-[24px]">
                <span className="block text-[14px] font-bold text-[#0f2c52] m-0 uppercase tracking-[0.5px]">ACTION PLAN</span>
              </div>
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[20px] text-[14.5px] text-[#1e293b] leading-[1.6]">{capa.correctiveAction || '-'}</div>
            </section>

            {capa.preventiveAction && (
              <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px]">
                <div className="flex items-center mb-[24px]">
                  <span className="block text-[14px] font-bold text-[#0f2c52] m-0 uppercase tracking-[0.5px]">PREVENTIVE ACTION</span>
                </div>
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[20px] text-[14.5px] text-[#1e293b] leading-[1.6]">{capa.preventiveAction}</div>
              </section>
            )}
          </div>

          <aside className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px] flex flex-col gap-[32px]">
            <span className="block text-[14px] font-bold text-[#0f2c52] m-0 uppercase tracking-[0.5px] border-b border-[#e2e8f0] pb-[16px]">EXECUTION METADATA</span>

            <div className="flex flex-col gap-[8px]">
              <span className="block text-[11px] font-bold text-[#64748b] uppercase mb-[4px]">Assignee</span>
              <div className="flex items-center gap-[12px] text-[15px] font-semibold text-[#0f2c52]">
                <span className="w-[40px] h-[40px] bg-[#f1f5f9] rounded-full flex items-center justify-center text-[14px] font-bold text-[#475569]">{initials(capa.picName)}</span>
                <span>{capa.picName || 'Belum ditugaskan'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <span className="block text-[11px] font-bold text-[#64748b] uppercase mb-[4px]">Due Date</span>
              <div className="inline-flex items-center gap-[8px] bg-white border border-[#e2e8f0] p-[8px_12px] rounded-[8px] text-[14px] font-semibold text-[#1e293b]">
                <Calendar size={16} />
                {formatDate(capa.deadline)}
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <span className="block text-[11px] font-bold text-[#64748b] uppercase mb-[4px]">Status</span>
              <CapaStatusBadge status={capa.status} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
