import api from '../../../shared/api/axios_instance';

export interface IsoStandard {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface GetIsoStandardsResponse {
  total: number;
  data: IsoStandard[];
}

export async function getIsoStandards(isActive?: boolean): Promise<GetIsoStandardsResponse> {
  const params = new URLSearchParams();
  if (typeof isActive === 'boolean') {
    params.append('isActive', String(isActive));
  }
  const response = await api.get(`/admin/iso-standards?${params.toString()}`);
  return response.data;
}

export async function getIsoStandardById(id: string): Promise<IsoStandard> {
  const response = await api.get(`/admin/iso-standards/${id}`);
  return response.data;
}

export async function createIsoStandard(data: {
  name: string;
  code: string;
  description?: string;
}): Promise<IsoStandard> {
  const response = await api.post('/admin/iso-standards', data);
  return response.data;
}

export async function updateIsoStandard(
  id: string,
  data: {
    name: string;
    code: string;
    description?: string;
  }
): Promise<void> {
  await api.put(`/admin/iso-standards/${id}`, data);
}

export async function updateIsoStandardStatus(id: string, isActive: boolean): Promise<void> {
  await api.patch(`/admin/iso-standards/${id}/status`, isActive, {
    headers: { 'Content-Type': 'application/json' },
  });
}
