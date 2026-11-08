import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAuditPlans, deleteAuditPlan, type AuditPlan } from '../api/audit_plan_api';
import { parseUtcDate } from '../../../shared/utils/date_utils';

export type AuditTab = 'all' | 'priority';

export function useAuditPlans() {
  const [allAudits, setAllAudits] = useState<AuditPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<AuditTab>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditPlans();
      setAllAudits(data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load audit plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Audit plan will be deleted permanently. Are you sure you want to delete this audit?')) {
      return;
    }
    try {
      await deleteAuditPlan(id);
      setAllAudits((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to delete audit plan');
    }
  }, []);

  const audits = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const isAuditOverdue = (audit: AuditPlan) => {
      const schedule = audit.schedules[0];
      if (!schedule || schedule.isFinished) return false;
      const scheduledDate = parseUtcDate(schedule.scheduledDate) ?? new Date(schedule.scheduledDate);
      const auditDate = new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate());
      return auditDate < today;
    };

    // 1. Saring audit yang selesai lebih dari 24 jam lalu (sesuai Mobile)
    const visibleAudits = allAudits.filter((a) => {
      const schedule = a.schedules[0];
      if (!schedule || !schedule.isFinished) return true;
      if (!schedule.completedAt) return true;
      const completedDate = parseUtcDate(schedule.completedAt) ?? new Date(schedule.completedAt);
      const completedTime = completedDate.getTime();
      const diffHours = (now.getTime() - completedTime) / (1000 * 60 * 60);
      return diffHours <= 24;
    });

    // 2. Tab filter: 'priority' mencakup priority flag ATAU overdue (sesuai Mobile)
    const filtered = tab === 'priority'
      ? visibleAudits.filter((a) => a.priority === 'Priority' || isAuditOverdue(a))
      : visibleAudits;

    // 3. Sorting: audit belum selesai di atas, audit selesai di paling bawah (sesuai Mobile)
    return [...filtered].sort((a, b) => {
      const aFinished = !!a.schedules[0]?.isFinished;
      const bFinished = !!b.schedules[0]?.isFinished;
      if (aFinished === bFinished) return 0;
      return aFinished ? 1 : -1;
    });
  }, [allAudits, tab]);

  return { audits, loading, error, tab, setTab, handleDelete };
}