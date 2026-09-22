import axios_instance from '../../../shared/api/axios_instance';
import { getChecklistItems, type ChecklistItem, type ChecklistItemsResponse } from './checklist_api';

export { getChecklistItems };
export type { ChecklistItem, ChecklistItemsResponse };

export interface AuditResponseRecord {
  id: string;
  checklistItemId: string;
  question: string | null;
  isPassed: boolean;
  answer: string; 
  notes: string | null;
}

interface GetBySessionEnvelope {
  total: number;
  data: AuditResponseRecord[];
}

export interface BatchResponseItem {
  checklistItemId: string;
  isPassed: boolean;
  notes?: string;
}

interface BatchSaveResult {
  message: string;
  total: number;
}

interface SaveProgressResult {
  message: string;
}

export async function getResponsesBySession(sessionId: string): Promise<AuditResponseRecord[]> {
  const response = await axios_instance.get<GetBySessionEnvelope>(`/AuditResponse/by-session/${sessionId}`);
  return response.data.data;
}

export async function submitResponseBatch(
  sessionId: string,
  responses: BatchResponseItem[]
): Promise<BatchSaveResult> {
  const res = await axios_instance.post<BatchSaveResult>('/AuditResponse/batch', {
    sessionId,
    responses,
  });
  return res.data;
}

export async function saveResponseProgress(
  sessionId: string,
  checklistItemId: string,
  isPassed: boolean,
  notes?: string
): Promise<SaveProgressResult> {
  const res = await axios_instance.post<SaveProgressResult>('/AuditResponse/progress', {
    sessionId,
    checklistItemId,
    isPassed,
    notes,
  });
  return res.data;
}

export function calculateProgress(
  responses: AuditResponseRecord[],
  totalChecklistItems: number
): { completionPercent: number; pendingCount: number } {
  const answered = responses.length;
  const pendingCount = Math.max(totalChecklistItems - answered, 0);
  const completionPercent =
    totalChecklistItems > 0 ? Math.round((answered / totalChecklistItems) * 100) : 0;

  return { completionPercent, pendingCount };
}