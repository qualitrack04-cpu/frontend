import axios_instance from '../../../shared/api/axios_instance';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export async function getDepartments(): Promise<Department[]> {
  const response = await axios_instance.get<Department[]>('/departments');
  return response.data;
}

export interface IsoStandardOption {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
}

export async function getIsoStandards(isActive = true): Promise<IsoStandardOption[]> {
  const response = await axios_instance.get<any>(`/admin/iso-standards?isActive=${isActive}`);
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  return [];
}