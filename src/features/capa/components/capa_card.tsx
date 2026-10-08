import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { type Capa, type CapaStatus } from '../api/capa_api';
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

interface CapaCardProps {
  capa: Capa;
  onStatusChange: (id: string, status: CapaStatus) => void;
  updatingStatus?: boolean;
}

export default function CapaCard({ capa, onStatusChange, updatingStatus }: CapaCardProps) {
  const statusColor = capa.status.toLowerCase();
  const borderColor = statusColor === 'open' ? 'border-l-[#3b82f6]' : statusColor === 'in_progress' ? 'border-l-[#f59e0b]' : statusColor === 'under_review' ? 'border-l-[#8b5cf6]' : 'border-l-[#10b981]';

  return (
    <article className={`bg-white border border-[#e2e8f0] border-l-[4px] rounded-[12px] p-[24px] flex flex-col transition-all duration-200 relative overflow-hidden hover:shadow-[0_4px_12px_rgba(15,44,82,0.05)] hover:border-[#cbd5e1] ${borderColor}`}>
      <div className="flex justify-between items-start gap-[16px] mb-[8px]">
        {/* ⚠️ ASUMSI: CAPA tidak punya field title sendiri, jadi pakai
            findingTitle (judul finding terkait) sebagai judul kartu. */}
        <h2 className="text-[16px] text-[#0f2c52] m-0 leading-[1.4] font-bold">{capa.findingTitle || 'Untitled Finding'}</h2>
        <CapaStatusBadge
          status={capa.status}
          onChange={(status) => onStatusChange(capa.id, status)}
          disabled={updatingStatus}
        />
      </div>

      <p className="text-[13px] text-[#64748b] m-0 mb-[16px]">Initiated: {formatDate(capa.createdAt)}</p>

      <div className="bg-[#f8fafc] rounded-[8px] p-[12px] mb-[24px] flex-1">
        <span className="block text-[11px] font-bold text-[#64748b] uppercase mb-[4px]">Observation Summary</span>
        {/* ⚠️ ASUMSI: "Observation Summary" di desain dipetakan ke rootCause. */}
        <p className="text-[13.5px] text-[#475569] m-0 leading-[1.5] line-clamp-2">{capa.rootCause || '-'}</p>
      </div>

      <div className="flex justify-between items-center border-t border-[#f1f5f9] pt-[16px]">
        <span className="flex items-center gap-[8px] text-[13px] font-semibold text-[#0f2c52]">
          <span className="w-[28px] h-[28px] bg-[#e2e8f0] rounded-full flex items-center justify-center text-[11px] font-bold text-[#475569]">{initials(capa.picName)}</span>
          {capa.picName || 'Belum ditugaskan'}
        </span>
        <Link to={`/capa/${capa.id}`} className="inline-flex items-center gap-[4px] text-[#0f2c52] text-[14px] font-bold no-underline transition-opacity duration-200 hover:opacity-80">
          Details <ChevronRight size={16} />
        </Link>
      </div>
    </article>
  );
}
