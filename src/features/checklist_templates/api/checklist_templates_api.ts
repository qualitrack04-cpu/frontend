import api from '../../../shared/api/axios_instance';

export interface ChecklistTemplateItem {
  id: string;
  title: string;
  isoStandardId: string | null;
  isoStandardName: string;
  departmentId: string | null;
  departmentName: string;
  isSystemTemplate: boolean;
  itemCount: number;
  createdAt: string;
}

export interface DepartmentOption {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface IsoOption {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export async function getChecklistTemplates(
  isoStandardId?: string,
  departmentId?: string
): Promise<ChecklistTemplateItem[]> {
  const params = new URLSearchParams();
  if (isoStandardId) params.append('isoStandardId', isoStandardId);
  if (departmentId) params.append('departmentId', departmentId);

  const response = await api.get<any>(`/checklists?${params.toString()}`);
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  return [];
}

export async function getDepartments(): Promise<DepartmentOption[]> {
  const response = await api.get<any>('/departments');
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  return [];
}

export async function getIsoStandards(isActive?: boolean): Promise<IsoOption[]> {
  const url = isActive !== undefined ? `/admin/iso-standards?isActive=${isActive}` : '/admin/iso-standards';
  const response = await api.get<any>(url);
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  return [];
}

export interface CreateTemplatePayload {
  title: string;
  isoStandardId?: string;
  departmentId: string;
  items?: {
    question: string;
    description?: string;
    clauseRef: string;
    orderIndex: number;
  }[];
}

export async function createChecklistTemplate(payload: CreateTemplatePayload): Promise<any> {
  const response = await api.post('/checklists', payload);
  return response.data;
}

export interface UpdateTemplatePayload {
  title: string;
  standard: string;
  department: string;
  items: {
    id?: string;
    question: string;
    description?: string;
    clauseRef: string;
  }[];
}

export async function updateChecklistTemplate(
  id: string,
  payload: UpdateTemplatePayload
): Promise<any> {
  const response = await api.put(`/checklists/${id}`, payload);
  return response.data;
}

export async function deleteChecklistTemplate(id: string): Promise<void> {
  await api.delete(`/checklists/${id}`);
}
