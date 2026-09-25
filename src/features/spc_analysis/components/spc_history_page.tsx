import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSpcHistory, type SpcHistoryItem } from '../api/spc_api';
import { getStatusColor } from '../utils/status_color';

const PERIOD_MAP: Record<string, string> = {
  'All Time': 'all',
  '3 Months': '3m',
  '6 Months': '6m',
  '1 Year': '1y',
};

const STATUS_MAP: Record<string, string> = {
  'All Status': '',
  'Process Capable': 'Process Capable',
  'Marginal': 'Marginal',
  'Not Capable': 'Not Capable',
  'Process Unstable': 'Process Unstable',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function SpcHistoryPage() {
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [periodFilter, setPeriodFilter] = useState('All Time');
  const [items, setItems] = useState<SpcHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const res = await getSpcHistory({
          period: PERIOD_MAP[periodFilter] ?? 'all',
          status: STATUS_MAP[statusFilter] || undefined,
        });
        setItems(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Gagal memuat riwayat analisis.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [statusFilter, periodFilter]);

  return (
    <div className="page-container">
      <h1>Analyses History</h1>

      <div className="filter-row">
        <div className="form-group">
          <label>Analysis Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>Process Capable</option>
            <option>Marginal</option>
            <option>Not Capable</option>
            <option>Process Unstable</option>
          </select>
        </div>

        <div className="form-group">
          <label>Period</label>
          <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
            <option>All Time</option>
            <option>3 Months</option>
            <option>6 Months</option>
            <option>1 Year</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-muted">Memuat riwayat analisis...</p>}
      {error && <p className="spc-error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-muted">Belum ada analisis SPC yang tersimpan.</p>
      )}

      <div className="history-list">
        {items.map((item) => (
          <div
            key={item.id}
            className="history-card"
            onClick={() => navigate(`/spc-analysis/history/${item.id}`)}
          >
            <div>
              <h4>{item.productName}</h4>
              {item.description && <p className="spc-description">{item.description}</p>}
              <p className="history-date">{formatDate(item.analyzedAt)}</p>
              <div className="spc-metric-mini">
                <span>Cp {item.cp}</span>
                <span>Cpk {item.cpk}</span>
              </div>
              <span className={`status-badge ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
            <span className="arrow">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}