import { useState, useEffect } from 'react';
import { getAuditPlanById, type AuditPlan, type ScheduleResponse } from '../api/audit_plan_api';
import {
  getAuditSessionByScheduleId,
  getSessionSummary,
  type AuditSession,
  type AuditSummary,
} from '../api/audit_session_api';
import { getChecklistItems } from '../api/checklist_api';
import { getResponsesBySession } from '../api/audit_response_api';

export interface ChecklistResultItem {
  id: string;
  question: string; 
  status: 'pass' | 'fail' | 'pending';
}

export function useAuditReport(planId: string, scheduleId: string) {
  const [plan, setPlan] = useState<AuditPlan | null>(null);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [session, setSession] = useState<AuditSession | null>(null);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [results, setResults] = useState<ChecklistResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const planData = await getAuditPlanById(planId);
        if (cancelled) return;
        setPlan(planData);

        const scheduleData = planData.schedules.find((s) => s.id === scheduleId) ?? null;
        setSchedule(scheduleData);
        if (!scheduleData) throw new Error('Jadwal audit tidak ditemukan');

        const sessionData = await getAuditSessionByScheduleId(scheduleId);
        if (!sessionData) throw new Error('Sesi audit tidak ditemukan');
        if (cancelled) return;
        setSession(sessionData);

        const [summaryData, checklistItemsResponse, responses] = await Promise.all([
          getSessionSummary(sessionData.id),
          getChecklistItems(sessionData.checklistId), // checklistId ada di session, bukan di plan
          getResponsesBySession(sessionData.id),
        ]);
        if (cancelled) return;

        setSummary(summaryData);
        setResults(
          checklistItemsResponse.items.map((item) => {
            const r = responses.find((res) => res.checklistItemId === item.id);
            const status: 'pass' | 'fail' | 'pending' = !r ? 'pending' : r.isPassed ? 'pass' : 'fail';
            return { id: item.id, question: item.question, status };
          })
        );
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.message ?? err.message ?? 'Gagal memuat laporan audit');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [planId, scheduleId]);

  return { plan, schedule, session, summary, results, loading, error };
}