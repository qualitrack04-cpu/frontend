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
  return (
    <article className={`capa-card capa-card--${capa.status.toLowerCase()}`}>
      <div className="capa-card-head">
        {/* ⚠️ ASUMSI: CAPA tidak punya field title sendiri, jadi pakai
            findingTitle (judul finding terkait) sebagai judul kartu. */}
        <h2>{capa.findingTitle || 'Untitled Finding'}</h2>
        <CapaStatusBadge
          status={capa.status}
          onChange={(status) => onStatusChange(capa.id, status)}
          disabled={updatingStatus}
        />
      </div>

      <p className="capa-card-date">Initiated: {formatDate(capa.createdAt)}</p>

      <div className="capa-card-summary">
        <span className="capa-label">Observation Summary</span>
        {/* ⚠️ ASUMSI: "Observation Summary" di desain dipetakan ke rootCause. */}
        <p>{capa.rootCause || '-'}</p>
      </div>

      <div className="capa-card-foot">
        <span className="capa-assignee">
          <span className="capa-avatar">{initials(capa.picName)}</span>
          {capa.picName || 'Belum ditugaskan'}
        </span>
        <Link to={`/capa/${capa.id}`} className="capa-link">
          Details <ChevronRight size={16} />
        </Link>
      </div>
    </article>
  );
}
