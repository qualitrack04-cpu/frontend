import { Link } from 'react-router-dom';
import { Pencil, Trash2, TriangleAlert, ClipboardCheck } from 'lucide-react';
import type { AuditPlan } from '../api/audit_plan_api';
import { canManageAuditPlans } from '../../../shared/utils/role';

interface AuditCardProps {
  audit: AuditPlan;
  onDelete: (id: string) => void;
}

export default function AuditCard({ audit, onDelete }: AuditCardProps) {
  const schedule = audit.schedules[0];
  const isPriority = audit.priority === 'Priority';

  const date = schedule ? new Date(schedule.scheduledDate) : null;
  const day = date?.toLocaleDateString('en-US', { day: '2-digit' });
  const month = date?.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const year = date?.getFullYear();

  return (
    <div className="audit-plan-card">
      <div className={`audit-date-block ${isPriority ? 'audit-date-block--priority' : ''}`}>
        <span className="audit-date-day">{day ?? '--'}</span>
        <span className="audit-date-month">{month ?? '---'}</span>
        <span className="audit-date-year">{year ?? ''}</span>
        {isPriority && (
          <span className="audit-priority-tag">
            <TriangleAlert size={13} /> Priority
          </span>
        )}
      </div>

      <div className="audit-plan-card-body">
        <div className="audit-plan-title-row">
          <h3>{audit.title}</h3>
          {canManageAuditPlans() && (
            <div className="audit-card-actions">
              <Link to={`/audits/${audit.id}/edit`} className="audit-icon-btn" aria-label="Edit">
                <Pencil size={16} />
              </Link>
              <button
                className="audit-icon-btn audit-icon-btn--danger"
                onClick={() => onDelete(audit.id)}
                aria-label="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="audit-tag-row">
          {schedule && <span className="tag-badge">{schedule.department}</span>}
          {schedule && <span className="tag-badge">{schedule.auditorName}</span>}
        </div>

        {schedule ? (
          <Link to={`/audits/${audit.id}/schedule/${schedule.id}/checklist`} className="btn-checklist">
            <ClipboardCheck size={16} /> Audit Checklist
          </Link>
        ) : (
          <span className="text-muted">Belum ada jadwal</span>
        )}
      </div>
    </div>
  );
}