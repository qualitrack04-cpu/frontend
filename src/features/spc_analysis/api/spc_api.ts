import axios_instance from '../../../shared/api/axios_instance';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpcAnalyzePayload {
  file: File;
  productName: string;   // digunakan sebagai ParameterName di BE
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

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * POST /api/Spc/analyze
 * Upload Excel file + parameter, terima hasil analisis langsung.
 */
export async function analyzeSpc(payload: SpcAnalyzePayload): Promise<SpcResult> {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('productName', payload.productName);
  formData.append('lsl', String(payload.lsl));
  formData.append('usl', String(payload.usl));
  if (payload.target !== undefined) formData.append('target', String(payload.target));
  if (payload.unit)        formData.append('unit', payload.unit);
  if (payload.description) formData.append('description', payload.description);

  const res = await axios_instance.post<SpcResult>('/Spc/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/**
 * GET /api/Spc/history?period=3m&productName=xxx&status=xxx
 */
export async function getSpcHistory(params?: {
  period?: string;
  productName?: string;
  status?: string;
}): Promise<SpcHistoryResponse> {
  const res = await axios_instance.get<SpcHistoryResponse>('/Spc/history', { params });
  return res.data;
}

/**
 * GET /api/Spc/{id}
 */
export async function getSpcById(id: string): Promise<SpcResult> {
  const res = await axios_instance.get<SpcResult>(`/Spc/${id}`);
  return res.data;
}
