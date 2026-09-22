import axios_instance from '../../../shared/api/axios_instance';

export type FindingCategory = 'MinorNC' | 'MajorNC' | 'Observation';
export type FindingStatusValue = 'Open' | 'InProgress' | 'Closed';

export interface CreateFindingPayload {
  sessionId: string;
  checklistItemId: string;
  description: string;
  title: string; 
  department: string; 
  clauseRef: string; 
  category?: FindingCategory;
  reporterId?: string;
  reporterName?: string;
}

export async function createFinding(payload: CreateFindingPayload) {
  const response = await axios_instance.post('/Finding', payload);
  return response.data;
}

export interface FindingRecord {
  id: string;
  title: string;
  department: string;
  category: FindingCategory;
  description: string;
  clauseRef: string;
  foundAt: string;
  status: FindingStatusValue;
  sessionId: string;
  checklistItemId: string;
  reporterName: string | null;
  reporterId: string | null;
  reporterFullName: string | null; 
}

interface ListEnvelope<T> {
  total: number;
  data: T[];
}

export async function getFindingsBySession(sessionId: string): Promise<FindingRecord[]> {
  const response = await axios_instance.get<ListEnvelope<FindingRecord>>(`/Finding/by-session/${sessionId}`);
  return response.data.data;
}