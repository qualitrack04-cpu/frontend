import axios_instance from '../../../shared/api/axios_instance';

export interface ChecklistItem {
  id: string;
  question: string; // ⚠️ backend pakai "Question", BUKAN "title"
  description: string | null;
  clauseRef: string;
  orderIndex: number;
}


export interface ChecklistListItem {
  id: string;
  title: string;
  standard: string;
  department: string;
  createdAt: string;
  totalItems: ChecklistItem[];
}

export interface ChecklistDetail {
  id: string;
  title: string;
  standard: string;
  department: string;
  createdAt: string;
  items: ChecklistItem[];
}

export interface ChecklistItemsResponse {
  checklistId: string;
  title: string;
  standard: string;
  department: string;
  totalItems: number; 
  items: ChecklistItem[];
}

export async function getChecklists(standard?: string, department?: string): Promise<ChecklistListItem[]> {
  const response = await axios_instance.get<ChecklistListItem[]>('/Checklist', {
    params: { standard, department },
  });
  return response.data;
}


export async function getChecklistById(id: string): Promise<ChecklistDetail> {
  const response = await axios_instance.get<ChecklistDetail>(`/Checklist/${id}`);
  return response.data;
}

export async function getChecklistItems(checklistId: string): Promise<ChecklistItemsResponse> {
  const response = await axios_instance.get<ChecklistItemsResponse>(`/Checklist/${checklistId}/items`);
  return response.data;
}

export async function deleteChecklist(id: string): Promise<void> {
  await axios_instance.delete(`/Checklist/${id}`);
}

export interface CreateChecklistItemPayload {
  question: string;
  description?: string;
  clauseRef: string;
  orderIndex: number;
}

export interface CreateChecklistPayload {
  title: string;
  standard: string;
  department: string;
  items: CreateChecklistItemPayload[];
}

export async function createChecklist(payload: CreateChecklistPayload): Promise<ChecklistDetail> {
  const response = await axios_instance.post<ChecklistDetail>('/Checklist', payload);
  return response.data;
}