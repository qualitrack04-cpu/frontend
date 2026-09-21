import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useFetch } from '../../../shared/hooks/use_fetch';
import { getFindings } from '../api/findings_api';
import FindingCard from './finding_card';
import '../findings.css';

export default function FindingsPage() {
  const { data, loading, error } = useFetch(() => getFindings());

  return (
    <div className="page-container fd-page">
      <div className="fd-list-header">
        <h1 className="fd-list-title">Findings</h1>
        <Link to="/findings/new" className="fd-btn-primary fd-btn-inline">
          <Plus size={18} /> New Findings
        </Link>
      </div>

      {loading && <p className="text-muted">Memuat temuan...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && data?.length === 0 && (
        <p className="text-muted">Belum ada temuan. Tambahkan lewat tombol New FINDINGS.</p>
      )}

      <div className="fd-card-grid">
        {data?.map((finding) => (
          <FindingCard key={finding.id} finding={finding} />
        ))}
      </div>
    </div>
  );
}