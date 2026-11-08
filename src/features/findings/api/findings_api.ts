import axios_instance from '../../../shared/api/axios_instance';

// Enum / string kategori dari Swagger & Sistem.
export type FindingCategory = string;
export type FindingStatus = 'Open' | 'InProgress' | 'Closed';

export const FINDING_CATEGORY_IDS: Record<string, string> = {};

// ⚠️ Field selain yang ada di UpdateFindingRequest (id, status, sessionId,
// createdAt) masih ASUMSI. Cocokkan dengan response GET /api/findings.
export interface Finding {
  id: string;
  title: string;
  department?: string | null;
  reporterName?: string | null;
  reporterId?: string | null;
  category: FindingCategory;
  categoryId?: string | null;
  categoryName?: string | null;
  description?: string | null;
  clauseRef?: string | null;
  status: FindingStatus;
  sessionId?: string | null;
  createdAt?: string;
  foundAt?: string;
}

// Bentuk response GET /api/uploads/finding/{findingId} (lihat UploadController.GetFindingFiles):
// backend sudah mengirim `url` langsung (hasil storage.GetPresignedUrl), jadi
// foto bisa dipakai langsung sebagai <img src> tanpa perlu fetch terpisah.
export interface FindingPhoto {
  id: string;
  fileName?: string | null;
  url: string;
}

// Body POST /api/findings (dari Swagger).
export interface CreateFindingPayload {
  title: string;
  department?: string;
  sessionId?: string;
  checklistItemId?: string;
  reporterName?: string;
  reporterId?: string;
  category: FindingCategory;
  categoryId?: string;
  description?: string;
  clauseRef?: string;
}

// Body PUT /api/findings/{id} (UpdateFindingRequest).
export interface UpdateFindingPayload {
  title: string;
  department?: string | null;
  reporterName?: string | null;
  reporterId?: string | null;
  category: FindingCategory;
  categoryId?: string;
  description?: string | null;
  clauseRef?: string | null;
}

export interface FindingListParams {
  status?: FindingStatus;
  category?: FindingCategory;
  from?: string;
  to?: string;
  sessionId?: string;
}

// Label di dropdown form.
export const categoryOptions: { value: FindingCategory; label: string }[] = [
  { value: 'Major NC', label: 'Major NC' },
  { value: 'Minor NC', label: 'Minor NC' },
  { value: 'OFI', label: 'OFI' },
];

// Label badge di kartu list.
export const categoryBadgeLabel: Record<string, string> = {
  MajorNC: 'Major NC',
  'Major NC': 'Major NC',
  MinorNC: 'Minor NC',
  'Minor NC': 'Minor NC',
  Observation: 'OFI',
  OFI: 'OFI',
};

export const statusLabel: Record<FindingStatus, string> = {
  Open: 'Open',
  InProgress: 'In Progress',
  Closed: 'Closed',
};

export function normalizeFindingCategory(raw?: string | null): FindingCategory {
  if (!raw) return '';
  return raw.trim();
}

// GET /api/findings?status=&category=&from=&to=
export async function getFindings(params: FindingListParams = {}): Promise<Finding[]> {
  const res = await axios_instance.get<Finding[]>('/findings', { params });
  return (res.data || []).map((f: any) => ({
    ...f,
    category: normalizeFindingCategory(f.categoryName || f.category),
  }));
}

// GET /api/findings/{id}
export async function getFinding(id: string): Promise<Finding> {
  const res = await axios_instance.get<Finding>(`/findings/${id}`);
  const f = res.data;
  return {
    ...f,
    category: normalizeFindingCategory(f.categoryName || f.category),
  };
}

// POST /api/findings
export async function createFinding(payload: CreateFindingPayload): Promise<Finding> {
  let categoryId = payload.categoryId;
  if (!categoryId && payload.category) {
    try {
      const res = await axios_instance.get<any[]>('/system-config/finding-categories');
      const norm = (s: string) => s.toLowerCase().replace(/[\s_-]/g, '');
      const target = norm(payload.category);
      const found = res.data.find((item: any) => norm(item.name) === target);
      if (found?.id) categoryId = found.id;
    } catch {
      // fallback
    }
  }

  const res = await axios_instance.post<Finding>('/findings', {
    ...payload,
    categoryId,
  });
  return res.data;
}

// PUT /api/findings/{id}
export async function updateFinding(id: string, payload: UpdateFindingPayload) {
  let categoryId = payload.categoryId;
  if (!categoryId && payload.category) {
    try {
      const res = await axios_instance.get<any[]>('/system-config/finding-categories');
      const norm = (s: string) => s.toLowerCase().replace(/[\s_-]/g, '');
      const target = norm(payload.category);
      const found = res.data.find((item: any) => norm(item.name) === target);
      if (found?.id) categoryId = found.id;
    } catch {
      // fallback
    }
  }

  const res = await axios_instance.put(`/findings/${id}`, {
    ...payload,
    categoryId,
  });
  return res.data;
}

// PATCH /api/findings/{id}/status (body = string enum polos)
export async function updateFindingStatus(id: string, status: FindingStatus) {
  // JSON.stringify wajib: axios mengirim string apa adanya, sedangkan
  // backend mengharapkan JSON valid, yaitu "Closed" dengan tanda kutip.
  const res = await axios_instance.patch(`/findings/${id}/status`, JSON.stringify(status));
  return res.data;
}

// GET /api/uploads/finding/{findingId}
export async function getFindingPhotos(findingId: string): Promise<FindingPhoto[]> {
  const res = await axios_instance.get<FindingPhoto[]>(`/uploads/finding/${findingId}`);
  return res.data;
}

// POST /api/uploads/finding/{findingId}  (multipart/form-data)
export async function uploadFindingPhoto(findingId: string, file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await axios_instance.post(`/uploads/finding/${findingId}`, form, {
    headers: { 'Content-Type': undefined },
  });
  return res.data;
}

// DELETE /api/uploads/{fileId}
export async function deleteFindingPhoto(fileId: string) {
  const res = await axios_instance.delete(`/uploads/${fileId}`);
  return res.data;
}

// Catatan: sebelumnya ada fungsi fetchFileBlob() yang mengambil foto lewat
// GET /api/uploads/file/{fileId} sebagai blob. Itu salah asumsi — endpoint
// itu ternyata mengembalikan JSON metadata (bukan file mentah), sehingga
// hasilnya selalu gagal di-parse sebagai gambar ("Gagal memuat" di UI).
// GetFindingFiles (di bawah, dipanggil lewat getFindingPhotos) sudah
// mengirim `url` langsung ke file publiknya, jadi tidak perlu fetch
// terpisah lagi — cukup pakai `photo.url` langsung sebagai <img src>.

interface ListEnvelope<T> {
  total: number;
  data: T[];
}

export type FindingRecord = Finding;

// GET /api/findings/without-capa
export async function getFindingsWithoutCapa(): Promise<Finding[]> {
  const res = await axios_instance.get<ListEnvelope<Finding>>('/findings/without-capa');
  return res.data.data;
}

// GET /api/findings/by-session/{sessionId}
export async function getFindingsBySession(sessionId: string): Promise<Finding[]> {
  const res = await axios_instance.get<ListEnvelope<Finding>>(`/findings/by-session/${sessionId}`);
  return res.data.data;
}

