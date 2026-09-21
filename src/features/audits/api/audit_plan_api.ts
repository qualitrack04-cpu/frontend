import axios_instance from '../../../shared/api/axios_instance';

export type AuditPriority = 'Low' | 'Common' | 'High';


export interface ScheduleResponse {
  id: string;
  clauseRef: string;
  auditorId: string | null;
  auditorName: string;
  scheduledDate: string;
  department: string;
  completedAt: string | null;
  isFinished: boolean;
}

export interface AuditPlan {
  id: string;
  title: string;
  year: number;
  standard: string;
  createdAt: string;
  description: string | null;
  priority: AuditPriority;
  totalSchedules: number;
  schedules: ScheduleResponse[];
}

interface ApiEnvelope<T> {
  message?: string;
  data: T;
}

interface ListEnvelope<T> {
  message?: string;
  total: number;
  data: T[];
}

export async function getAuditPlans(): Promise<AuditPlan[]> {
  const response = await axios_instance.get<ListEnvelope<AuditPlan>>('/AuditPlan');
  return response.data.data;
}

export async function getAuditPlanById(id: string): Promise<AuditPlan> {
  const response = await axios_instance.get<ApiEnvelope<AuditPlan>>(`/AuditPlan/${id}`);
  return response.data.data;
}

export interface CreateSchedulePayload {
  clauseRef: string;
  auditorName: string;
  scheduledDate: string; 
  department: string;
}

export interface CreateAuditPlanPayload {
  title: string;
  year: number;
  standard: string;
  priority?: AuditPriority; 
  description?: string;
  schedules?: CreateSchedulePayload[];
}

interface CreatePlanResult {
  message: string;
  data: { id: string; title: string };
}

export async function createAuditPlan(payload: CreateAuditPlanPayload): Promise<CreatePlanResult> {
  const response = await axios_instance.post<CreatePlanResult>('/AuditPlan', payload);
  return response.data;
}

export interface UpdateAuditPlanPayload {
  title: string;
  year: number;
  standard: string;
  priority: AuditPriority;
  description?: string;
  schedules?: CreateSchedulePayload[];
}

export async function updateAuditPlan(id: string, payload: UpdateAuditPlanPayload): Promise<AuditPlan> {
  const response = await axios_instance.put<ApiEnvelope<AuditPlan>>(`/AuditPlan/${id}`, payload);
  return response.data.data;
}

export async function deleteAuditPlan(id: string): Promise<void> {
  await axios_instance.delete(`/AuditPlan/${id}`);
}