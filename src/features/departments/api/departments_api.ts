import api from '../../../shared/api/axios_instance';

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  logoUrl?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateDepartmentPayload {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  color?: string;
}

export interface UpdateDepartmentPayload {
  name: string;
  code: string;
  description?: string;
  color?: string;
}

export async function getDepartments(): Promise<DepartmentItem[]> {
  const response = await api.get<DepartmentItem[]>('/departments');
  return response.data;
}

export async function getDepartmentById(id: string): Promise<DepartmentItem> {
  const response = await api.get<DepartmentItem>(`/departments/${id}`);
  return response.data;
}

export async function createDepartment(payload: CreateDepartmentPayload): Promise<DepartmentItem> {
  // Generate code if not provided (e.g. from department name initials or letters)
  const code = payload.code || 
    payload.name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 10) || 'DEPT';

  const response = await api.post<DepartmentItem>('/departments', {
    name: payload.name.trim(),
    code,
    description: payload.description || '',
    color: payload.color,
  });

  const created = response.data;

  // If initial status was set to inactive, update status
  if (payload.isActive === false && created?.id) {
    await updateDepartmentStatus(created.id, false);
    created.isActive = false;
  }

  return created;
}

export async function updateDepartment(id: string, payload: UpdateDepartmentPayload): Promise<DepartmentItem> {
  const response = await api.put<DepartmentItem>(`/departments/${id}`, payload);
  return response.data;
}

export async function updateDepartmentStatus(id: string, isActive: boolean): Promise<void> {
  await api.patch(`/departments/${id}/status`, isActive, {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function uploadDepartmentLogo(id: string, file: File): Promise<DepartmentItem> {
  const formData = new FormData();
  formData.append('file', file);

  // Content-Type undefined => biarkan browser mengisi multipart/form-data + boundary
  const response = await api.post<DepartmentItem>(`/departments/${id}/logo`, formData, {
    headers: { 'Content-Type': undefined },
  });
  return response.data;
}

export async function removeDepartmentLogo(id: string): Promise<DepartmentItem> {
  const response = await api.delete<DepartmentItem>(`/departments/${id}/logo`);
  return response.data;
}

export async function deleteDepartment(id: string): Promise<void> {
  await api.delete(`/departments/${id}`);
}
