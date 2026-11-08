import { Link } from 'react-router-dom';
import { Pencil, Trash2, TriangleAlert, ClipboardCheck, CheckCircle2 } from 'lucide-react';
import type { AuditPlan } from '../api/audit_plan_api';
import { canManageAuditPlansFor, canRunChecklistFor } from '../../../shared/utils/role';
import { useRole } from '../../../shared/context/role_context';
import { parseUtcDate } from '../../../shared/utils/date_utils';

interface AuditCardProps {
  audit: AuditPlan;
  onDelete: (id: string) => void;
}

export default function AuditCard({ audit, onDelete }: AuditCardProps) {
  const schedule = audit.schedules[0];
  const { role } = useRole();
  const currentUserName = localStorage.getItem('fullName') ?? '';

  const isFinished = !!schedule?.isFinished;
  const isPriority = audit.priority === 'Priority';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const auditScheduledDate = schedule
    ? (parseUtcDate(schedule.scheduledDate) ?? new Date(schedule.scheduledDate))
    : null;
  const auditDateOnly = auditScheduledDate
    ? new Date(auditScheduledDate.getFullYear(), auditScheduledDate.getMonth(), auditScheduledDate.getDate())
    : null;
  const isOverdue = !isFinished && auditDateOnly !== null && auditDateOnly < today;

  const canRunChecklist = canRunChecklistFor(role, schedule?.auditorName, currentUserName);

  const date = auditScheduledDate;
  const day = date?.toLocaleDateString('en-US', { day: '2-digit' });
  const month = date?.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const year = date?.getFullYear();

  const dateBgColor = isFinished
    ? 'bg-[#e2e8f0] text-[#64748b]'
    : isOverdue
    ? 'bg-[#ef4444] text-white'
    : isPriority
    ? 'bg-[#0f2c52] text-white'
    : 'bg-[#f1f5f9] text-[#0f2c52]';

  return (
    <div
      className={`flex bg-white rounded-[12px] overflow-hidden min-w-0 min-h-[185px] transition-all duration-200 ${
        isFinished
          ? 'opacity-70 grayscale-[0.5] bg-[#f8fafc] border border-[#e2e8f0]'
          : isOverdue
          ? 'border-[1.5px] border-[#ef4444] shadow-[0_2px_10px_rgba(239,68,68,0.12)]'
          : 'border border-[#e2e8f0]'
      }`}
    >
      <div
        className={`shrink-0 w-[84px] sm:w-[110px] flex flex-col items-center justify-center p-[20px_8px] sm:p-[20px_12px] text-center ${dateBgColor}`}
      >
        <span className="text-[34px] font-extrabold leading-none">{day ?? '--'}</span>
        <span className="text-[15px] font-bold tracking-[0.5px] mt-[4px]">{month ?? '---'}</span>
        <span className="text-[13px] opacity-80">{year ?? ''}</span>
        {isOverdue && (
          <span className="flex items-center gap-[4px] text-[11px] font-semibold text-white mt-[12px]">
            <TriangleAlert size={12} /> Overdue
          </span>
        )}
        {!isOverdue && isPriority && !isFinished && (
          <span className="flex items-center gap-[4px] text-[12px] font-semibold text-[#fca5a5] mt-[12px]">
            <TriangleAlert size={13} /> Priority
          </span>
        )}
        {isFinished && (
          <span className="flex items-center gap-[4px] text-[12px] font-semibold text-[#16a34a] mt-[12px]">
            <CheckCircle2 size={13} /> Completed
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 p-4 sm:p-[20px_24px] flex flex-col gap-[12px]">
        <div className="flex justify-between items-start gap-[12px] min-h-[48px]">
          <div className="flex-1 min-w-0 flex flex-col">
            {isOverdue && (
              <span className="inline-flex items-center gap-[4px] text-[11.5px] font-semibold text-[#c81e1e] bg-[#fdf2f2] border border-[#fbd5d5] px-2.5 py-0.5 rounded-md mb-1.5 w-fit">
                <TriangleAlert size={12} className="text-[#c81e1e]" /> Overdue
              </span>
            )}
            <h3 className={`text-[19px] m-0 leading-[1.3] line-clamp-2 break-words [overflow-wrap:anywhere] [word-break:break-word] ${isFinished ? 'text-[#64748b]' : 'text-[#0f2c52]'}`}>
              {audit.title}
            </h3>
          </div>
          {canManageAuditPlansFor(role) && !isFinished && (
            <div className="flex gap-[6px] shrink-0">
              <Link to={`/audits/${audit.id}/edit`} className="w-[32px] h-[32px] rounded-[8px] border-none bg-transparent text-[#64748b] flex items-center justify-center hover:bg-[#f1f5f9]" aria-label="Edit">
                <Pencil size={16} />
              </Link>
              <button
                className="w-[32px] h-[32px] rounded-[8px] border-none bg-transparent text-[#dc2626] flex items-center justify-center cursor-pointer hover:bg-[#fef2f2]"
                onClick={() => onDelete(audit.id)}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-[8px] flex-wrap min-h-[28px] items-center">
          {schedule && (
            <span className="bg-[#f1f5f9] text-[#475569] text-[13px] font-medium px-[12px] py-[6px] rounded-[8px] truncate max-w-[200px]" title={schedule.department}>
              {schedule.department}
            </span>
          )}
          {schedule && (
            <span className="bg-[#f1f5f9] text-[#475569] text-[13px] font-medium px-[12px] py-[6px] rounded-[8px] truncate max-w-[200px]" title={schedule.auditorName}>
              {schedule.auditorName}
            </span>
          )}
        </div>

        {schedule ? (
          isFinished ? (
            <span className="inline-flex items-center gap-[8px] text-[14px] font-semibold px-[18px] py-[10px] rounded-[8px] w-fit max-w-full whitespace-nowrap mt-auto self-end text-white bg-[#94a3b8] cursor-not-allowed opacity-80">
              <ClipboardCheck size={16} /> Audit Checklist
            </span>
          ) : !canRunChecklist ? (
            <span
              className="inline-flex items-center gap-[8px] text-[14px] font-semibold px-[18px] py-[10px] rounded-[8px] w-fit max-w-full whitespace-nowrap mt-auto self-end text-slate-400 bg-slate-100 cursor-not-allowed border border-slate-200"
              title={
                role === 'Auditee'
                  ? 'Auditee cannot run audit checklists'
                  : 'You can only run checklists for audits assigned to you'
              }
            >
              <ClipboardCheck size={16} /> Audit Checklist
            </span>
          ) : (
            <Link to={`/audits/${audit.id}/schedule/${schedule.id}/checklist`} className="inline-flex items-center gap-[8px] text-[14px] font-semibold px-[18px] py-[10px] rounded-[8px] no-underline w-fit max-w-full whitespace-nowrap mt-auto self-end text-white bg-[#0f2c52] hover:bg-[#0c2444] transition-colors">
              <ClipboardCheck size={16} /> Audit Checklist
            </Link>
          )
        ) : (
          <span className="text-slate-500">No schedule yet</span>
        )}
      </div>
    </div>
  );
}
