import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAuditPlans, deleteAuditPlan, type AuditPlan } from '../api/audit_plan_api';

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
      setError(err.response?.data?.message ?? 'Gagal memuat daftar audit plan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteAuditPlan(id);
      setAllAudits((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Gagal menghapus audit plan');
    }
  }, []);

  // ⚠️ priority sekarang enum string ('Low'|'Common'|'High'), bukan boolean.
  // Verifikasi value 'High' ini sesuai dengan enum AuditPriority asli di backend.
  const audits = useMemo(
    () => (tab === 'priority' ? allAudits.filter((a) => a.priority === 'High') : allAudits),
    [allAudits, tab]
  );

  return { audits, loading, error, tab, setTab, handleDelete };
}