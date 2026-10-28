import api from '../../../shared/api/axios_instance';

export interface TimeZoneOption {
  code: string;
  name: string;
  systemTimeZoneId: string;
  utcOffsets: number;
}

export interface TimeZoneResponse {
  timeZone: string;
  getSystemTimeZoneId: string;
  utcOffsets: number;
  updatedAt?: string;
}

export interface DateFormatResponse {
  dateFormat: string;
  updateAt?: string;
}

export interface FindingCategoryItem {
  id: string;
  name: string;
  description: string;
  hexaCode?: string;
  severity: number;
  requiresImmediateAction: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

export interface CapaStatusItem {
  id: string;
  name: string;
  description: string;
  hexaCode?: string;
  orderIndex: number;
  isTerminal: boolean;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

// Timezone
export async function getTimeZoneOptions(): Promise<TimeZoneOption[]> {
  const res = await api.get('/system-config/timezone/options');
  return res.data;
}

export async function getTimeZone(): Promise<TimeZoneResponse> {
  const res = await api.get('/system-config/timezone');
  return res.data;
}

export async function updateTimeZone(timeZone: string) {
  const res = await api.put('/system-config/timezone', { timeZone });
  return res.data;
}

// Date Format
export async function getDateFormat(): Promise<DateFormatResponse> {
  const res = await api.get('/system-config/date-format');
  return res.data;
}

export async function updateDateFormat(dateFormat: string) {
  const res = await api.put('/system-config/date-format', { dateFormat });
  return res.data;
}

// Finding Categories
export async function getFindingCategories(): Promise<FindingCategoryItem[]> {
  const res = await api.get('/system-config/finding-categories');
  return res.data;
}

export async function createFindingCategory(payload: {
  name: string;
  description: string;
  hexaCode?: string;
  severity?: number;
  requiresImmediateAction?: boolean;
}) {
  const res = await api.post('/system-config/finding-categories', {
    name: payload.name,
    description: payload.description,
    hexaCode: payload.hexaCode || '#808080',
    severity: payload.severity ?? 3,
    requiresImmediateAction: payload.requiresImmediateAction ?? false,
  });
  return res.data;
}

export async function updateFindingCategory(
  id: string,
  payload: {
    name: string;
    description: string;
    hexaCode?: string;
    severity?: number;
    requiresImmediateAction?: boolean;
  }
) {
  const res = await api.put(`/system-config/finding-categories/${id}`, {
    name: payload.name,
    description: payload.description,
    hexaCode: payload.hexaCode || '#808080',
    severity: payload.severity ?? 3,
    requiresImmediateAction: payload.requiresImmediateAction ?? false,
  });
  return res.data;
}

export async function deleteFindingCategory(id: string) {
  const res = await api.delete(`/system-config/finding-categories/${id}`);
  return res.data;
}

// CAPA Statuses
export async function getCapaStatuses(): Promise<CapaStatusItem[]> {
  const res = await api.get('/system-config/capa-statuses');
  return res.data;
}

export async function createCapaStatus(payload: {
  name: string;
  description: string;
  hexaCode?: string;
  orderIndex?: number;
  isTerminal?: boolean;
}) {
  const res = await api.post('/system-config/capa-statuses', {
    name: payload.name,
    description: payload.description,
    hexaCode: payload.hexaCode || '#808080',
    orderIndex: payload.orderIndex ?? 1,
    isTerminal: payload.isTerminal ?? false,
  });
  return res.data;
}

export async function updateCapaStatus(
  id: string,
  payload: {
    name: string;
    description: string;
    hexaCode?: string;
    orderIndex?: number;
    isTerminal?: boolean;
  }
) {
  const res = await api.put(`/system-config/capa-statuses/${id}`, {
    name: payload.name,
    description: payload.description,
    hexaCode: payload.hexaCode || '#808080',
    orderIndex: payload.orderIndex ?? 1,
    isTerminal: payload.isTerminal ?? false,
  });
  return res.data;
}

export async function deleteCapaStatus(id: string) {
  const res = await api.delete(`/system-config/capa-statuses/${id}`);
  return res.data;
}
