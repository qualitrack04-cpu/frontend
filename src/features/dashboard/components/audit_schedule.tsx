import { useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useFetch } from '../../../shared/hooks/use_fetch';
import { getAuditSchedule } from '../api/dashboard_api';

const departmentColors: Record<string, string> = {
  Production: '#a855f7',
  Packaging: '#3b82f6',
  Warehouse: '#ec4899',
  QC: '#22c55e',
};

const colorFor = (dept: string) => departmentColors[dept] ?? '#64748b';

function formatDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function daysLeftLabel(year: number, month: number, day: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(year, month - 1, day);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diff < 0) return `${Math.abs(diff)} hari lalu`;
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Besok';
  return `${diff} hari lagi`;
}

export default function AuditSchedule() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data, loading, error } = useFetch(
    () => getAuditSchedule(month, year),
    [month, year]
  );

  // Ratakan struktur per-hari jadi satu daftar, urut menaik
  const audits = useMemo(() => {
    if (!data) return [];
    return data.data
      .flatMap((entry) =>
        entry.departments.map((dept) => ({
          key: dept.scheduleId,
          day: entry.day,
          ...dept,
        }))
      )
      .filter((item) => {
        const target = new Date(year, month - 1, item.day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return target >= today;
      })
      .sort((a, b) => a.day - b.day);
  }, [data, year, month]);

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
          <p className="text-muted">Belum ada audit yang dijadwalkan bulan ini.</p>
        )}

        {audits.map((audit) => (
          <div
            key={audit.key}
            className="audit-item"
            style={{ borderLeftColor: colorFor(audit.department) }}
          >
            <strong>{audit.planTitle}</strong>
            <div className="audit-meta">
              <span className="audit-meta-item">
                <Calendar size={14} strokeWidth={2} />
                {formatDate(year, month, audit.day)}
              </span>
              <span
                className="audit-meta-item"
                style={{ color: colorFor(audit.department) }}
              >
                <Clock size={14} strokeWidth={2} />
                {daysLeftLabel(year, month, audit.day)}
              </span>
            </div>
            <p className="text-muted small">
              {audit.department} · {audit.standard}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}