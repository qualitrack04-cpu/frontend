import api from '../../../shared/api/axios_instance';

export interface SpcUnit {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface GetSpcUnitsResponse {
  total: number;
  data: SpcUnit[];
}

export interface CreateSpcUnitPayload {
  name: string;
  symbol: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateSpcUnitPayload {
  name: string;
  symbol: string;
  description?: string;
}

export async function getSpcUnits(isActive?: boolean): Promise<GetSpcUnitsResponse> {
  const params = new URLSearchParams();
  if (typeof isActive === 'boolean') {
    params.append('isActive', String(isActive));
  }
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get<GetSpcUnitsResponse>(`/admin/spc-units${queryString}`);
  return response.data;
}

export async function getSpcUnitById(id: string): Promise<SpcUnit> {
  const response = await api.get<SpcUnit>(`/admin/spc-units/${id}`);
  return response.data;
}

export async function createSpcUnit(payload: CreateSpcUnitPayload): Promise<SpcUnit> {
  const response = await api.post<SpcUnit>('/admin/spc-units', {
    name: payload.name.trim(),
    symbol: payload.symbol.trim(),
    description: payload.description?.trim() || null,
  });

  const created = response.data;

  // If initial status was specified as inactive, update status
  if (payload.isActive === false && created?.id) {
    await updateSpcUnitStatus(created.id, false);
    created.isActive = false;
  }

  return created;
}

export async function updateSpcUnit(id: string, payload: UpdateSpcUnitPayload): Promise<void> {
  await api.put(`/admin/spc-units/${id}`, {
    name: payload.name.trim(),
    symbol: payload.symbol.trim(),
    description: payload.description?.trim() || null,
  });
}

export async function updateSpcUnitStatus(id: string, isActive: boolean): Promise<void> {
  await api.patch(`/admin/spc-units/${id}/status`, isActive, {
    headers: { 'Content-Type': 'application/json' },
  });
}
