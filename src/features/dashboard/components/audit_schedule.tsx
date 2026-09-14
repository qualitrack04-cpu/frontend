import { useState, useEffect } from 'react';
import axios_instance from '../../../shared/api/axios_instance';
// path di atas asumsi lokasi file ini di: src/features/dashboard/components/
// sesuaikan kalau struktur folder kamu beda

interface AuditItem {
  id: string;
  title: string;
  date: string;
  daysLeft: string;
  department: 'Production' | 'Packaging' | 'Warehouse' | 'QC';
}

const departmentColors: Record<string, string> = {
  Production: '#a855f7',
  Packaging: '#3b82f6',
  Warehouse: '#ec4899',
  QC: '#22c55e',
};

export default function AuditSchedule() {
  const [audits, setAudits] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios_instance
      .get<AuditItem[]>('/Dashboard/audit-schedule')
      .then((res) => setAudits(res.data))
      .catch((err) => setError(err.response?.data?.message ?? 'Gagal memuat jadwal audit'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="profile-card audit-schedule-card">
      <div className="audit-schedule-header">
        <h3>Upcoming Audits</h3>
        <div className="legend">
          {Object.entries(departmentColors).map(([label, color]) => (
            <span key={label} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="audit-list">
        {loading && <p className="text-muted">Memuat jadwal audit...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && audits.length === 0 && (
          <p className="text-muted">Belum ada audit yang dijadwalkan.</p>
        )}

        {audits.map((audit) => (
          <div
            key={audit.id}
            className="audit-item"
            style={{ borderLeftColor: departmentColors[audit.department] }}
          >
            <strong>{audit.title}</strong>
            <div className="audit-meta">
              <span>📅 {audit.date}</span>
              <span style={{ color: departmentColors[audit.department] }}>🕒 {audit.daysLeft}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}