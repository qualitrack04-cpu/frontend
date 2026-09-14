import { useState, useEffect } from 'react';
import axios_instance from '../../../shared/api/axios_instance';

// Sesuaikan dengan field asli dari GET /api/Dashboard/compliance-score
interface ComplianceApiItem {
  department: string;
  score: number;
}

interface ComplianceItem extends ComplianceApiItem {
  color: string;
}

const departmentColors: Record<string, string> = {
  Production: '#a855f7',
  Packaging: '#3b82f6',
  Warehouse: '#ec4899',
  QC: '#22c55e',
};

export default function ComplianceScore() {
  const [compliance, setCompliance] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios_instance
      .get<ComplianceApiItem[]>('/Dashboard/compliance-score')
      .then((res) => {
        setCompliance(
          res.data.map((item) => ({
            ...item,
            color: departmentColors[item.department] ?? '#64748b',
          }))
        );
      })
      .catch((err) => setError(err.response?.data?.message ?? 'Gagal memuat compliance score'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="compliance-section">
      <p className="card-label">COMPLIANCE SCORE</p>
      <div className="compliance-grid">
        {loading && <p className="text-muted">Memuat compliance score...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading &&
          !error &&
          compliance.map((item) => (
            <div key={item.department} className="compliance-box" style={{ borderLeftColor: item.color }}>
              <div className="compliance-top">
                <strong>{item.department}</strong>
                <span style={{ color: item.color }}>{item.score}%</span>
              </div>
              <div className="compliance-bar">
                <div
                  className="compliance-fill"
                  style={{ width: `${item.score}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}