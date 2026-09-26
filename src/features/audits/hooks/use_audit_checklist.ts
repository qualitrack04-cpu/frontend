import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuditPlanById, type AuditPlan, type ScheduleResponse } from '../api/audit_plan_api';
import {
  createAuditSession,
  getAuditSessionByScheduleId,
  type AuditSession,
} from '../api/audit_session_api';
import { getResponsesBySession, saveResponseProgress } from '../api/audit_response_api';
import {
  getChecklists,
  getChecklistItems,
  type ChecklistListItem,
  type ChecklistItem,
} from '../api/checklist_api';
import { createFinding } from '../../findings/api/findings_api';

export type ItemStatus = 'pending' | 'pass' | 'fail';

export interface ChecklistItemState extends ChecklistItem {
  status: ItemStatus;
  responseId: string | null; 
  showFindingInput: boolean;
  findingSubmitted: boolean;
}

export function useAuditChecklist(planId: string, scheduleId: string) {
  const [plan, setPlan] = useState<AuditPlan | null>(null);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [session, setSession] = useState<AuditSession | null>(null);
  const [items, setItems] = useState<ChecklistItemState[]>([]);

  const [needsChecklistSelection, setNeedsChecklistSelection] = useState(false);
  const [checklistOptions, setChecklistOptions] = useState<ChecklistListItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadItemsForSession = useCallback(async (sessionData: AuditSession) => {
    const [checklistItemsResponse, responses] = await Promise.all([
      getChecklistItems(sessionData.checklistId),
      getResponsesBySession(sessionData.id),
    ]);

    const merged: ChecklistItemState[] = checklistItemsResponse.items.map((item) => {
      const existing = responses.find((r) => r.checklistItemId === item.id);
      const status: ItemStatus = !existing ? 'pending' : existing.isPassed ? 'pass' : 'fail';
      return {
        ...item,
        status,
        responseId: existing?.id ?? null,
        showFindingInput: false,
        findingSubmitted: status === 'fail', 
      };
    });
    setItems(merged);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setSession(null);
      setItems([]);
      setNeedsChecklistSelection(false);
      setChecklistOptions([]);

      try {
        const planData = await getAuditPlanById(planId);
        if (cancelled) return;
        setPlan(planData);

        const scheduleData = planData.schedules.find((s) => s.id === scheduleId) ?? null;
        setSchedule(scheduleData);
        if (!scheduleData) {
          setError('Jadwal audit tidak ditemukan pada audit plan ini');
          return;
        }
        
        let sessionData = await getAuditSessionByScheduleId(scheduleId);
        if (cancelled) return;

        if (!sessionData) {
          const checklists = await getChecklists();
          if (cancelled) return;
          
          const matched =
            checklists.find(
              (c) => c.title === scheduleData.clauseRef && c.department === scheduleData.department
            ) ?? checklists.find((c) => c.title === scheduleData.clauseRef);

          if (!matched) {
            const sameDept = checklists.filter((c) => c.department === scheduleData.department);
            setChecklistOptions(sameDept.length > 0 ? sameDept : checklists);
            setNeedsChecklistSelection(true);
            return;
          }

          try {
            sessionData =await createAuditSession(scheduleId, matched.id);
          } catch {
            sessionData = await getAuditSessionByScheduleId(scheduleId);
          }
          if (cancelled) return;
        }
        
        if (!sessionData) {
          setError('Gagal memulai sesi audit');
          return;
        }

        setSession(sessionData);
        await loadItemsForSession(sessionData);
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.message ?? 'Gagal memuat audit checklist');
      } finally {
        if (!cancelled) setLoading(false);
      }        
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [planId, scheduleId, loadItemsForSession]);

  const selectChecklist = useCallback(
    async (checklistId: string) => {
      setLoading(true);
      setError(null);
      try {
        const sessionData = await createAuditSession(scheduleId, checklistId);
        setSession(sessionData);
        setNeedsChecklistSelection(false);
        await loadItemsForSession(sessionData);
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Gagal memulai sesi audit');
      } finally {
        setLoading(false);
      }
    },
    [scheduleId, loadItemsForSession]
  );

  const markStatus = useCallback(
    async (itemId: string, status: 'pass' | 'fail') => {
      if (!session) return;

      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? { ...it, status, showFindingInput: status === 'fail' && !it.findingSubmitted }
            : it
        )
      );

      try {
        await saveResponseProgress(session.id, itemId, status === 'pass');
        const responses = await getResponsesBySession(session.id);
        const record = responses.find((r) => r.checklistItemId === itemId);
        if (record) {
          setItems((prev) =>
            prev.map((it) => (it.id === itemId ? { ...it, responseId: record.id } : it))
          );
        }
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Gagal menyimpan jawaban');
      }
    },
    [session]
  );

  const submitFinding = useCallback(
    async (itemId: string, description: string) => {
      if (!session || !schedule) return;
      const item = items.find((it) => it.id === itemId);
      if (!item) return;

      try {
        await createFinding({
          sessionId: session.id,
          checklistItemId: itemId,
          description,
          title: item.question,
          department: schedule.department,
          clauseRef: item.clauseRef,
          category: 'MinorNC', 
        });
        setItems((prev) =>
          prev.map((it) =>
            it.id === itemId ? { ...it, showFindingInput: false, findingSubmitted: true } : it
          )
        );
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Gagal menyimpan temuan (finding)');
      }
    },
    [session, schedule, items]
  );

  const pendingCount = items.filter((it) => it.status === 'pending').length;
  const completionPercent =
    items.length === 0 ? 0 : Math.round(((items.length - pendingCount) / items.length) * 100);

  return {
    plan,
    schedule,
    session,
    items,
    needsChecklistSelection,
    checklistOptions,
    selectChecklist,
    loading,
    error,
    pendingCount,
    completionPercent,
    markStatus,
    submitFinding,
    navigate,
  };
}