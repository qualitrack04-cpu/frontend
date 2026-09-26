import { Activity } from 'lucide-react';
import { useRecentActivity } from '../hooks/useRecentActivity';
import { activityMeta } from '../constants/activity_meta';

function relativeTime(iso: string) {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';

  const hours = Math.floor((Date.now() - then.getTime()) / 3_600_000);

  if (hours < 1) return 'Baru saja';
  if (hours < 24) return `${hours} jam lalu`;
  if (hours < 48) return 'Kemarin';

  return then.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RecentActivity() {
  const { data, loading, error } = useRecentActivity();

  return (
    <div className="profile-card recent-activity-card">
      <h3 className="recent-activity-title">
        <Activity size={16} /> Recent Activity
      </h3>

      {loading && <p className="text-muted">Memuat aktivitas...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className="text-muted">Belum ada aktivitas.</p>
      )}

      <ul className="activity-list">
        {data.map((item, i) => {
          const meta = activityMeta(item.activityType);
          return (
            <li key={`${item.relatedId}-${item.timestamp}-${i}`} className="activity-item">
              <span className="activity-dot" style={{ backgroundColor: meta.color }} />

              <div className="activity-body">
                <div className="activity-head">
                  <strong>{meta.title}</strong>
                  <span className="text-muted small">{relativeTime(item.timestamp)}</span>
                </div>

                <p className="activity-desc">{item.description}</p>

                <span
                  className="activity-badge"
                  style={{ color: meta.color, backgroundColor: meta.background }}
                >
                  {meta.badge}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}