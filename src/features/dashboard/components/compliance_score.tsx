import { useFetch } from '../../../shared/hooks/use_fetch';
import { getComplianceScore } from '../api/dashboard_api';

const departmentColors: Record<string, string> = {
  Production: '#a855f7',
  Packaging: '#3b82f6',
  Warehouse: '#ec4899',
  QC: '#22c55e',
};

const colorFor = (dept: string) => departmentColors[dept] ?? '#64748b';

export default function ComplianceScore() {
  const { data, loading, error } = useFetch(getComplianceScore);

  console.log('compliance-score response', data)

  const departments = data?.data ?? [];

  return (
    <div className="compliance-section">
      <div className="compliance-header">
        <p className="card-label">COMPLIANCE SCORE</p>
        {typeof data?.overallScore === 'number' && (
          <span className="compliance-overall">
            Overall: <strong>{data.overallScore.toFixed(1)}%</strong>
          </span>
        )}
      </div>

      <div className="compliance-grid">
        {loading && <p className="text-muted">Memuat compliance score...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && departments.length === 0 && (
          <p className="text-muted">Belum ada data compliance.</p>
        )}

        {departments.map((item) => (
          <div
            key={item.department}
            className="compliance-box"
            style={{ borderLeftColor: colorFor(item.department) }}
          >
            <div className="compliance-top">
              <strong>{item.department}</strong>
              <span style={{ color: colorFor(item.department) }}>{(item.score ?? 0).toFixed(1)}%</span>
            </div>
            <div className="compliance-bar">
              <div
                className="compliance-fill"
                style={{ width: `${item.score ?? 0}%`, backgroundColor: colorFor(item.department) }}
              />
            </div>
            <p className="text-muted small">
              {item.conformResponses}/{item.totalResponses} sesuai · {item.totalAudit} audit
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}