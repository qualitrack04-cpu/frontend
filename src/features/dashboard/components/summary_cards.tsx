import { useFetch } from '../../../shared/hooks/use_fetch';
import { getSummary } from '../api/dashboard_api';

export default function SummaryCards() {
  const { data, loading, error } = useFetch(getSummary);

  const items = data
    ? [
        { label: 'Active Audit', value: data.activeAudit, color: '#3b82f6' },
        { label: 'Total CAPA', value: data.totalCapa, color: '#a855f7' },
        { label: 'CAPA Open', value: data.capaOpen, color: '#22c55e' },
        { label: 'CAPA Overdue', value: data.capaOverdue, color: '#ef4444' },
      ]
    : [];

  return (
    <div className="summary-cards">
      <p className="card-label">SUMMARY CARD</p>
      <div className="summary-grid">
        {loading && <p className="text-muted">Memuat ringkasan...</p>}
        {error && <p className="error-text">{error}</p>}

        {items.map((item) => (
          <div key={item.label} className="summary-box" style={{ borderTopColor: item.color }}>
            <span className="summary-value">{item.value}</span>
            <span className="summary-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}