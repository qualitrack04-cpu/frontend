import { Clock, Activity } from 'lucide-react';
import { useRecentActivity } from '../hooks/useRecentActivity';
import { activityMeta } from '../constants/activity_meta';

function relativeTime(iso: string) {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';

  const diffMs = Date.now() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return then.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RecentActivity() {
  const { data, loading, error } = useRecentActivity();

  const hasData = !loading && !error && data && data.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <h3 className="flex items-center gap-2.5 text-[16px] font-bold text-[#0F294A] m-0">
          <Clock size={18} className="text-[#0F294A]" />
          <span>Recent Activity</span>
        </h3>
        {hasData && (
          <span className="text-[11.5px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {data.length} events
          </span>
        )}
      </div>

      {loading && (
        <div className="py-12 text-center text-slate-400 text-sm">
          Loading recent activity...
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
          {error}
        </div>
      )}

      {!loading && !error && hasData && (
        <ul className="list-none p-0 m-0 flex flex-col gap-6">
          {data.slice(0, 10).map((item, i) => {
            const meta = activityMeta(item.activityType);
            return (
              <li
                key={`${item.relatedId}-${item.timestamp}-${i}`}
                className="flex gap-4 relative before:absolute before:content-[''] before:top-4 before:bottom-[-24px] before:left-[5px] before:w-[2px] before:bg-slate-200 last:before:hidden"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 mt-1 z-10 shadow-[0_0_0_4px_#fff]"
                  style={{ backgroundColor: meta.color }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <strong className="text-[14.5px] text-slate-900 font-bold leading-tight">
                      {meta.title}
                    </strong>
                    <span className="text-[12px] text-slate-400 font-normal shrink-0">
                      {relativeTime(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-[13px] text-slate-600 leading-relaxed m-0 mb-2 font-normal">
                    {item.description}
                  </p>

                  <span
                    className="inline-block px-2.5 py-0.5 rounded-md text-[10.5px] font-bold uppercase tracking-wider"
                    style={{ color: meta.color, backgroundColor: meta.background }}
                  >
                    {meta.badge}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !error && !hasData && (
        <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <Activity size={22} />
          </div>
          <p className="text-[14px] font-semibold text-slate-700 m-0">No Recent Activity</p>
          <p className="text-[12.5px] text-slate-400 m-0 mt-1 max-w-[280px]">
            Activities related to completed audits, findings reported, and CAPA actions will appear here in real time.
          </p>
        </div>
      )}
    </div>
  );
}