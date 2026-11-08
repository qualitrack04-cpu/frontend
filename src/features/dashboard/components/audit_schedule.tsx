import { useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useFetch } from '../../../shared/hooks/use_fetch';
import { useDepartmentColors } from '../../../shared/hooks/use_department_colors';
import { getAuditSchedule } from '../api/dashboard_api';
import { getAuditPlans } from '../../audits/api/audit_plan_api';

function formatDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
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

  if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''} ago`;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${diff} days left`;
}

export default function AuditSchedule() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const colorFor = useDepartmentColors();

  const { data: scheduleData, loading: scheduleLoading, error } = useFetch(
    () => getAuditSchedule(month, year),
    [month, year]
  );
  const { data: plansData, loading: plansLoading } = useFetch(getAuditPlans);

  const completedScheduleIds = useMemo(() => {
    const set = new Set<string>();
    for (const plan of plansData ?? []) {
      for (const schedule of plan.schedules ?? []) {
        if (schedule.isFinished && schedule.id) {
          set.add(schedule.id);
        }
      }
    }
    return set;
  }, [plansData]);

  const audits = useMemo(() => {
    const list = scheduleData?.data ?? [];
    if (!Array.isArray(list)) return [];
    return list
      .flatMap((entry) =>
        (entry?.departments ?? []).map((dept) => ({
          key: dept.scheduleId,
          day: entry.day,
          ...dept,
        }))
      )
      .filter((item) => {
        // Saring audit yang sudah selesai (sesuai Mobile)
        if (completedScheduleIds.has(item.scheduleId)) {
          return false;
        }
        const target = new Date(year, month - 1, item.day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return target >= today;
      })
      .sort((a, b) => a.day - b.day);
  }, [scheduleData, completedScheduleIds, year, month]);

  const loading = scheduleLoading || (plansLoading && !plansData);

  // Legend diambil dari department yang benar-benar muncul di jadwal
  const legend = useMemo(() => {
    const names: string[] = [];
    for (const audit of audits) {
      if (audit.department && !names.includes(audit.department)) {
        names.push(audit.department);
      }
    }
    return names;
  }, [audits]);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[24px]">
      <div className="flex justify-between items-center mb-[16px] flex-wrap gap-[8px]">
        <h3 className="text-[22px] font-bold text-[#0f2c52] m-0">Upcoming Audits</h3>
        <div className="flex gap-[12px] text-[13px] text-[#475569] flex-wrap">
          {legend.map((label) => (
            <span key={label} className="flex items-center gap-[4px]">
              <span className="w-[8px] h-[8px] rounded-full inline-block" style={{ backgroundColor: colorFor(label) }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[12px]">
        {loading && <p className="text-slate-500">Loading audit schedule...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && audits.length === 0 && (
          <p className="text-slate-500">No audits scheduled for this month.</p>
        )}

        {audits.slice(0, 5).map((audit) => (
          <div
            key={audit.key}
            className="bg-[#f8fafc] p-[14px_16px] rounded-[8px] border-l-[4px]"
            style={{ borderLeftColor: colorFor(audit.department) }}
          >
            <strong className="text-[#0f2c52] text-[15px]">{audit.planTitle}</strong>
            <div className="flex gap-[16px] mt-[6px] text-[13px] text-[#64748b]">
              <span className="inline-flex items-center gap-[6px]">
                <Calendar size={14} strokeWidth={2} />
                {formatDate(year, month, audit.day)}
              </span>
              <span
                className="inline-flex items-center gap-[6px]"
                style={{ color: colorFor(audit.department) }}
              >
                <Clock size={14} strokeWidth={2} />
                {daysLeftLabel(year, month, audit.day)}
              </span>
            </div>
            <p className="text-slate-500 text-[13px] m-0 mt-[2px]">
              {audit.department} · {audit.standard}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}