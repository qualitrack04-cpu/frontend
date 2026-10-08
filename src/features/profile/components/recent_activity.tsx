import { useState } from 'react';
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
  const [visibleCount, setVisibleCount] = useState(5);

  return (
    <div className="bg-white rounded-[12px] p-[24px] border border-[#e2e8f0] flex flex-col h-full">
      <h3 className="flex items-center gap-[8px] text-[14px] font-bold text-[#0f2c52] uppercase tracking-[0.5px] m-0 mb-[20px] pb-[16px] border-b border-[#e2e8f0]">
        <Activity size={16} /> Recent Activity
      </h3>

      {loading && <p className="text-[#64748b]">Memuat aktivitas...</p>}
      {error && <p className="text-[#dc2626] text-[13px] mt-[4px]">{error}</p>}
      {!loading && !error && data.length === 0 && (
        <p className="text-[#64748b]">Belum ada aktivitas.</p>
      )}

      <ul className="list-none p-0 m-0 flex flex-col gap-[20px]">
        {data.slice(0, visibleCount).map((item, i) => {
          const meta = activityMeta(item.activityType);
          return (
            <li key={`${item.relatedId}-${item.timestamp}-${i}`} className="flex gap-[16px] relative before:absolute before:content-[''] before:top-[24px] before:bottom-[-20px] before:left-[5px] before:w-[2px] before:bg-[#e2e8f0] last:before:hidden">
              <span className="w-[12px] h-[12px] rounded-full shrink-0 mt-[4px] z-[1] shadow-[0_0_0_4px_#fff]" style={{ backgroundColor: meta.color }} />

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-[4px]">
                  <strong className="text-[14.5px] text-[#1e293b] font-bold">{meta.title}</strong>
                  <span className="text-[12px] text-[#94a3b8]">{relativeTime(item.timestamp)}</span>
                </div>

                <p className="text-[13.5px] text-[#475569] leading-[1.4] m-0 mb-[8px]">{item.description}</p>

                <span
                  className="inline-block p-[2px_8px] rounded-[12px] text-[11px] font-bold uppercase tracking-[0.5px]"
                  style={{ color: meta.color, backgroundColor: meta.background }}
                >
                  {meta.badge}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      
      {visibleCount < data.length && (
        <button 
          onClick={() => setVisibleCount(c => c + 5)}
          className="mt-[20px] bg-transparent border border-[#cbd5e1] text-[#475569] p-[8px_16px] rounded-[8px] font-semibold text-[13px] cursor-pointer hover:bg-[#f8fafc] hover:text-[#0f2c52] transition-colors self-center"
        >
          Load More
        </button>
      )}
    </div>
  );
}