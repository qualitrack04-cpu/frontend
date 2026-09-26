import axios_instance from '../../../shared/api/axios_instance';

// Enum dari Swagger (Models/CAPA.cs -> CAPAStatus).
export type CapaStatus = 'Open' | 'InProgress' | 'PendingVerification' | 'Closed';

export interface CapaAction {
  id: string;
  capaId?: string | null;
  description: string;
  doneById?: string | null;
  doneByName?: string | null;
  doneAt: string;
}

export interface CapaCloseOut {
  id: string;
  capaId?: string | null;
  isEffective: boolean;
  verificationNotes: string;
  verifiedById?: string | null;
  verifiedByName?: string | null;
  verifiedAt: string;
}

// Response DTO dari GET /api/Capa, /api/Capa/{id}, /api/Capa/overdue.
export interface Capa {
  id: string;
  findingId: string;
  findingTitle: string;
  findingCategory: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction?: string | null;
  deadline: string; // DateOnly -> "yyyy-MM-dd"
  status: CapaStatus;
  picId?: string | null;
  picName?: string | null;
  createdAt: string;
  closedAt?: string | null;
  updatedAt?: string | null;
  actions: CapaAction[];
  closeOut?: CapaCloseOut | null;
}

// Body POST /api/Capa/finding/{findingId} (CreateCapaRequest).
// Catatan: form "Create CAPA" di desain punya field Title, Description, Action
// Plan. Title tidak ada di backend (dipakai lokal saja di form). Description
// -> rootCause, Action Plan -> correctiveAction. Lihat catatan di
// create_capa_page.tsx / use_create_capa.ts.
export interface CreateCapaPayload {
  rootCause: string;
  correctiveAction: string;
  preventiveAction?: string;
  deadline: string; // "yyyy-MM-dd"
  picId?: string;
  picName?: string;
}

// Body PUT /api/Capa/{id} (UpdateCapaRequestDto).
export interface UpdateCapaPayload {
  rootCause: string;
  correctiveAction: string;
  preventiveAction?: string;
  deadline: string;
  picId?: string;
  picName?: string;
}

// Body POST /api/Capa/{id}/actions (AddCapaActionRequest).
export interface AddCapaActionPayload {
  description: string;
  doneById: string;
}

// Body POST /api/Capa/{id}/closeout (CloseOutVerificationRequest).
export interface CloseOutPayload {
  isEffective: boolean;
  verificationNotes: string;
  verifiedById: string;
}

export interface CapaListParams {
  status?: CapaStatus;
}

// Label untuk badge status di list & detail.
export const capaStatusLabel: Record<CapaStatus, string> = {
  Open: 'Open',
  InProgress: 'In Progress',
  PendingVerification: 'Pending Verification',
  Closed: 'Done',
};

// GET /api/Capa?status=
export async function getCapas(params: CapaListParams = {}): Promise<Capa[]> {
  const res = await axios_instance.get<Capa[]>('/Capa', { params });
  return res.data;
}

// GET /api/Capa/overdue
export async function getOverdueCapas(): Promise<Capa[]> {
  const res = await axios_instance.get<Capa[]>('/Capa/overdue');
  return res.data;
}

// GET /api/Capa/{id}
export async function getCapa(id: string): Promise<Capa> {
  const res = await axios_instance.get<Capa>(`/Capa/${id}`);
  return res.data;
}

// POST /api/Capa/finding/{findingId}
export async function createCapaFromFinding(findingId: string, payload: CreateCapaPayload): Promise<Capa> {
  const res = await axios_instance.post<Capa>(`/Capa/finding/${findingId}`, payload);
  return res.data;
}

// PUT /api/Capa/{id}
export async function updateCapa(id: string, payload: UpdateCapaPayload) {
  const res = await axios_instance.put(`/Capa/${id}`, payload);
  return res.data;
}

// PATCH /api/Capa/{id}/status (body = string enum polos, sama seperti Finding).
export async function updateCapaStatus(id: string, status: CapaStatus) {
  const res = await axios_instance.patch(`/Capa/${id}/status`, JSON.stringify(status));
  return res.data;
}

// POST /api/Capa/{id}/actions
export async function addCapaAction(id: string, payload: AddCapaActionPayload): Promise<CapaAction> {
  const res = await axios_instance.post<CapaAction>(`/Capa/${id}/actions`, payload);
  return res.data;
}

// POST /api/Capa/{id}/closeout
export async function closeOutCapa(id: string, payload: CloseOutPayload): Promise<CapaCloseOut> {
  const res = await axios_instance.post<CapaCloseOut>(`/Capa/${id}/closeout`, payload);
  return res.data;
}

// DELETE /api/Capa/{id}
export async function deleteCapa(id: string) {
  const res = await axios_instance.delete(`/Capa/${id}`);
  return res.data;
}
