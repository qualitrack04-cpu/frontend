import axios_instance from '../../../shared/api/axios_instance';

export interface AuditSession {
  id: string;
  scheduleId: string;
  checklistId: string;
  status: string; 
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
}

export interface AuditSummary {
  id: string;
  auditSessionId: string;
  content: string;
  createdAt: string;
}

interface ApiEnvelope<T> {
  message?: string;
  data: T;
}

export async function createAuditSession(
  scheduleId: string,
  checklistId: string,
  notes?: string
): Promise<AuditSession> {
  const response = await axios_instance.post<ApiEnvelope<AuditSession>>('/audit-sessions', {
    scheduleId,
    checklistId,
    notes,
  });
  return response.data.data;
}

export async function getAuditSessionByScheduleId(scheduleId: string): Promise<AuditSession | null> {
  try {
    const response = await axios_instance.get<ApiEnvelope<AuditSession>>(
      `/audit-sessions/by-schedule/${scheduleId}`
    );
    return response.data.data;
  } catch (err: any) {
    if (err.response?.status === 404) return null;
    throw err;
  }
}

export async function getAuditSessionById(id: string): Promise<AuditSession> {
  const response = await axios_instance.get<ApiEnvelope<AuditSession>>(`/audit-sessions/${id}`);
  return response.data.data;
}

export async function completeAuditSession(id: string): Promise<AuditSession> {
  const response = await axios_instance.patch<ApiEnvelope<AuditSession>>(`/audit-sessions/${id}/complete`);
  return response.data.data;
}


export async function cancelAuditSession(id: string): Promise<AuditSession> {
  const response = await axios_instance.patch<ApiEnvelope<AuditSession>>(`/audit-sessions/${id}/cancel`);
  return response.data.data;
}


export async function submitSessionSummary(sessionId: string, content: string): Promise<AuditSummary> {
  const response = await axios_instance.post<ApiEnvelope<AuditSummary>>(
    `/audit-sessions/${sessionId}/summary`,
    { content }
  );
  return response.data.data;
}


export async function getSessionSummary(sessionId: string): Promise<AuditSummary> {
  const response = await axios_instance.get<ApiEnvelope<AuditSummary>>(`/audit-sessions/${sessionId}/summary`);
  return response.data.data;
}