import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, User } from 'lucide-react';
import { useFetch } from '../../../shared/hooks/use_fetch';
import { getFinding, getFindingPhotos } from '../api/findings_api';
import FindingPhotoView from './finding_photo';
import '../findings.css';

function formatDate(iso?: string | null) {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  // Desain memakai format "27 Aug 2026"
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function FindingDetailPage() {
  const { id = '' } = useParams();
  const finding = useFetch(() => getFinding(id), [id]);
  const photos = useFetch(() => getFindingPhotos(id), [id]);

  const data = finding.data;
  const photoList = photos.data ?? [];

  return (
    <div className="page-container fd-page">
      <Link to="/findings" className="fd-back">
        <ArrowLeft size={18} /> Back to Findings
      </Link>
      <h1 className="fd-title">Findings Detail</h1>

      {finding.loading && <p className="text-muted">Memuat temuan...</p>}
      {finding.error && <p className="error-text">{finding.error}</p>}

      {data && (
        <div className="fd-detail-grid">
          <div className="fd-detail-main">
            <section className="fd-panel">
              <h2 className="fd-detail-title">{data.title}</h2>
              <span className="fd-label">Description</span>
              <div className="fd-desc-box">{data.description || '-'}</div>
            </section>

            <section className="fd-panel">
              <div className="fd-panel-head">
                <h2 className="fd-section-title">EVIDENCE PHOTOS</h2>
                <span className="fd-chip">
                  {photoList.length} {photoList.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>
              {photos.error && <p className="error-text">{photos.error}</p>}
              <div className="fd-photo-grid">
                {photoList.map((photo) => (
                  <FindingPhotoView
                    key={photo.id}
                    fileId={photo.id}
                    alt={photo.fileName ?? 'Evidence photo'}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="fd-panel fd-meta">
            <h2 className="fd-section-title">AUDIT METADATA</h2>
            <div className="fd-meta-row">
              <span className="fd-meta-icon">
                <User size={18} />
              </span>
              <div>
                <span className="fd-label">Reporter</span>
                <p>{data.reporterName || '-'}</p>
              </div>
            </div>
            <div className="fd-meta-row">
              <span className="fd-meta-icon">
                <Building2 size={18} />
              </span>
              <div>
                <span className="fd-label">Dept</span>
                <p>{data.department || '-'}</p>
              </div>
            </div>
            <div className="fd-meta-row">
              <span className="fd-meta-icon">
                <Calendar size={18} />
              </span>
              <div>
                <span className="fd-label">Date</span>
                <p>{formatDate(data.createdAt)}</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}