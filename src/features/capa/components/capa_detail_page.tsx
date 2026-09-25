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
    <div className="page-container capa-page">
      <Link to="/capa" className="capa-back">
        <ArrowLeft size={18} /> Back to CAPA List
      </Link>
      <h1 className="capa-title">CAPA Detail</h1>

      {loading && <p className="text-muted">Memuat CAPA...</p>}
      {error && <p className="error-text">{error}</p>}

      {capa && (
        <div className="capa-detail-grid">
          <div className="capa-detail-main">
            <section className="capa-panel">
              {/* ⚠️ ASUMSI: tidak ada field "title" di CAPA, jadi rootCause
                  dipakai sebagai ringkasan utama di bagian atas. */}
              <span className="capa-label">Root Cause</span>
              <h2 className="capa-detail-heading">{capa.rootCause || '-'}</h2>

              <span className="capa-section-title">FINDINGS</span>
              <Link to={`/findings/${capa.findingId}`} className="capa-finding-chip">
                <ClipboardList size={16} />
                {capa.findingTitle || 'Finding tidak diketahui'}
              </Link>
            </section>

            <section className="capa-panel">
              <div className="capa-panel-head">
                <span className="capa-section-title">ACTION PLAN</span>
              </div>
              <div className="capa-desc-box">{capa.correctiveAction || '-'}</div>
            </section>

            {capa.preventiveAction && (
              <section className="capa-panel">
                <div className="capa-panel-head">
                  <span className="capa-section-title">PREVENTIVE ACTION</span>
                </div>
                <div className="capa-desc-box">{capa.preventiveAction}</div>
              </section>
            )}
          </div>

          <aside className="capa-panel capa-meta">
            <span className="capa-section-title">EXECUTION METADATA</span>

            <div className="capa-meta-block">
              <span className="capa-label">Assignee</span>
              <div className="capa-meta-assignee">
                <span className="capa-avatar capa-avatar--lg">{initials(capa.picName)}</span>
                <span>{capa.picName || 'Belum ditugaskan'}</span>
              </div>
            </div>

            <div className="capa-meta-block">
              <span className="capa-label">Due Date</span>
              <div className="capa-meta-chip">
                <Calendar size={16} />
                {formatDate(capa.deadline)}
              </div>
            </div>

            <div className="capa-meta-block">
              <span className="capa-label">Status</span>
              <CapaStatusBadge status={capa.status} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
