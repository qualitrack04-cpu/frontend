import { useState, useEffect } from 'react';
import axios_instance from '../../../shared/api/axios_instance';

// Sesuaikan dengan field asli dari GET /api/Dashboard/summary — cek Swagger dulu
interface SummaryApiResponse {
  activeAudit: number;
  totalCapa: number;
  capaOpen: number;
  capaOverdue: number;
}

interface SummaryItem {
  label: string;
  value: number;
  color: string;
}

export default function SummaryCards() {
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios_instance
      .get<SummaryApiResponse>('/Dashboard/summary')
      .then((res) => {
        const data = res.data;
        setSummary([
          { label: 'Active Audit', value: data.activeAudit, color: '#3b82f6' },
          { label: 'Total CAPA', value: data.totalCapa, color: '#a855f7' },
          { label: 'CAPA Open', value: data.capaOpen, color: '#22c55e' },
          { label: 'CAPA Overdue', value: data.capaOverdue, color: '#ef4444' },
        ]);
      })
      .catch((err) => setError(err.response?.data?.message ?? 'Gagal memuat ringkasan'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="summary-cards">
      <p className="card-label">SUMMARY CARD</p>
      <div className="summary-grid">
        {loading && <p className="text-muted">Memuat ringkasan...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading &&
          !error &&
          summary.map((item) => (
            <div key={item.label} className="summary-box" style={{ borderTopColor: item.color }}>
              <span className="summary-value">{item.value}</span>
              <span className="summary-label">{item.label}</span>
            </div>
          ))}
      </div>
    </div>
  );
}