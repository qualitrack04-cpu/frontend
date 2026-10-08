import { useMemo, useState } from 'react';
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

  const audits = useMemo(() => {
    const list = data?.data ?? [];
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
        const target = new Date(year, month - 1, item.day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return target >= today;
      })
      .sort((a, b) => a.day - b.day);
  }, [data, year, month]);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[24px]">
      <div className="flex justify-between items-center mb-[16px] flex-wrap gap-[8px]">
        <h3 className="text-[22px] font-bold text-[#0f2c52] m-0">Upcoming Audits</h3>
        <div className="flex gap-[12px] text-[13px] text-[#475569]">
          {Object.entries(departmentColors).map(([label, color]) => (
            <span key={label} className="flex items-center gap-[4px]">
              <span className="w-[8px] h-[8px] rounded-full inline-block" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-[12px]">
        {loading && <p className="text-slate-500">Memuat jadwal audit...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && audits.length === 0 && (
          <p className="text-slate-500">Belum ada audit yang dijadwalkan bulan ini.</p>
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