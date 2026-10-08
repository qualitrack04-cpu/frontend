import { Link } from 'react-router-dom';
import { Pencil, Trash2, TriangleAlert, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import type { AuditPlan } from '../api/audit_plan_api';
import { canManageAuditPlans } from '../../../shared/utils/role';

interface AuditCardProps {
  audit: AuditPlan;
  onDelete: (id: string) => void;
}

export default function AuditCard({ audit, onDelete }: AuditCardProps) {
  const schedule = audit.schedules[0];
  const isPriority = audit.priority === 'Priority';
  const isFinished = !!schedule?.isFinished;

  const date = schedule ? new Date(schedule.scheduledDate) : null;
  const day = date?.toLocaleDateString('en-US', { day: '2-digit' });
  const month = date?.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const year = date?.getFullYear();

  return (
    <div className={`flex bg-white border border-[#e2e8f0] rounded-[12px] overflow-hidden min-w-0 min-h-[185px] ${isFinished ? 'opacity-70 grayscale-[0.5] bg-[#f8fafc]' : ''}`}>
      <div
        className={`shrink-0 w-[110px] flex flex-col items-center justify-center p-[20px_12px] text-center ${
          isFinished ? 'bg-[#e2e8f0] text-[#64748b]' : isPriority ? 'bg-[#0f2c52] text-white' : 'bg-[#f1f5f9] text-[#0f2c52]'
        }`}
      >
        <span className="text-[34px] font-extrabold leading-none">{day ?? '--'}</span>
        <span className="text-[15px] font-bold tracking-[0.5px] mt-[4px]">{month ?? '---'}</span>
        <span className="text-[13px] opacity-80">{year ?? ''}</span>
        {isPriority && !isFinished && (
          <span className="flex items-center gap-[4px] text-[12px] font-semibold text-[#fca5a5] mt-[12px]">
            <TriangleAlert size={13} /> Priority
          </span>
        )}
        {isFinished && (
          <span className="flex items-center gap-[4px] text-[12px] font-semibold text-[#16a34a] mt-[12px]">
            <CheckCircle2 size={13} /> Selesai
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 p-[20px_24px] flex flex-col gap-[12px]">
        <div className="flex justify-between items-start gap-[12px] min-h-[48px]">
          <h3 className={`flex-1 min-w-0 text-[19px] m-0 leading-[1.3] line-clamp-2 ${isFinished ? 'text-[#64748b]' : 'text-[#0f2c52]'}`}>{audit.title}</h3>
          {canManageAuditPlans() && (
            <div className="flex gap-[6px] shrink-0">
              <Link to={`/audits/${audit.id}/edit`} className="w-[32px] h-[32px] rounded-[8px] border-none bg-transparent text-[#64748b] flex items-center justify-center hover:bg-[#f1f5f9]" aria-label="Edit">
                <Pencil size={16} />
              </Link>
              <button
                className="w-[32px] h-[32px] rounded-[8px] border-none bg-transparent text-[#dc2626] flex items-center justify-center cursor-pointer hover:bg-[#fef2f2]"
                onClick={() => onDelete(audit.id)}
                aria-label="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-[8px] flex-wrap min-h-[28px] items-center">
          {schedule && <span className="bg-[#f1f5f9] text-[#475569] text-[13px] font-medium px-[12px] py-[6px] rounded-[8px]">{schedule.department}</span>}
          {schedule && <span className="bg-[#f1f5f9] text-[#475569] text-[13px] font-medium px-[12px] py-[6px] rounded-[8px]">{schedule.auditorName}</span>}
        </div>

        {schedule ? (
          <Link to={`/audits/${audit.id}/schedule/${schedule.id}/checklist`} className={`inline-flex items-center gap-[8px] text-[14px] font-semibold px-[18px] py-[10px] rounded-[8px] no-underline w-fit mt-auto self-end text-white ${isFinished ? 'bg-[#94a3b8] hover:bg-[#7c8aa0]' : 'bg-[#0f2c52] hover:bg-[#0c2444]'}`}>
            <ClipboardCheck size={16} /> Audit Checklist
          </Link>
        ) : (
          <span className="text-slate-500">Belum ada jadwal</span>
        )}
      </div>
    </div>
  );
}
