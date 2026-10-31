import axios_instance from '../../../shared/api/axios_instance';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpcAnalyzePayload {
  file: File;
  productName: string;   
  lsl: number;
  usl: number;
  target?: number;
  unit?: string;
  description?: string;
}

export interface SpcResult {
  id: string;
  parameterName: string;
  description?: string;
  mean: number;
  standardDeviation: number;
  ucl: number;
  lcl: number;
  lsl: number;
  usl: number;
  cp: number;
  cpk: number;
  status: string;
  isStable: boolean;
  dataCount: number;
  analyzedAt: string;
  data: number[];
  target?: number;
  unit?: string;
  outOfControlPoints: number[];
}

export interface SpcUnit {
  id: string;
  name: string;
  symbol: string;
}

export interface SpcHistoryItem {
  id: string;
  productName: string;
  description?: string;
  cp: number;
  cpk: number;
  status: string;
  isStable: boolean;
  analyzedAt: string;
}

export interface SpcHistoryResponse {
  period: string;
  startDate: string;
  endDate: string;
  total: number;
  data: SpcHistoryItem[];
}


export async function analyzeSpc(payload: SpcAnalyzePayload): Promise<SpcResult> {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('productName', payload.productName);
  formData.append('lsl', String(payload.lsl));
  formData.append('usl', String(payload.usl));
  if (payload.target !== undefined) formData.append('target', String(payload.target));
  if (payload.unit)        formData.append('unit', payload.unit);
  if (payload.description) formData.append('description', payload.description);

  const res = await axios_instance.post<SpcResult>('/spc/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}


export async function getSpcHistory(params?: {
  period?: string;
  productName?: string;
  status?: string;
}): Promise<SpcHistoryResponse> {
  const res = await axios_instance.get<SpcHistoryResponse>('/spc/history', { params });
  return res.data;
}


export async function getSpcById(id: string): Promise<SpcResult> {
  const res = await axios_instance.get<SpcResult>(`/spc/${id}`);
  return res.data;
}


export async function getSpcUnits(): Promise<SpcUnit[]> {
  const res = await axios_instance.get<{ total: number; data: SpcUnit[] }>('/spc/list-units');
  return res.data.data;
}
