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