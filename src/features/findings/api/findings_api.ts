import axios_instance from '../../../shared/api/axios_instance';

// Enum dari Swagger.
export type FindingCategory = 'MajorNC' | 'MinorNC' | 'Observation' | 'OFI';
export type FindingStatus = 'Open' | 'InProgress' | 'Closed';

// ⚠️ Field selain yang ada di UpdateFindingRequest (id, status, sessionId,
// createdAt) masih ASUMSI. Cocokkan dengan response GET /api/Finding.
export interface Finding {
  id: string;
  title: string;
  department?: string | null;
  reporterName?: string | null;
  reporterId?: string | null;
  category: FindingCategory;
  description?: string | null;
  clauseRef?: string | null;
  status: FindingStatus;
  sessionId?: string | null;
  createdAt: string;
}

// ⚠️ ASUMSI bentuk response GET /api/Upload/finding/{findingId}.
export interface FindingPhoto {
  id: string;
  fileName?: string | null;
}

// Body POST /api/Finding (dari Swagger).
export interface CreateFindingPayload {
  title: string;
  department?: string;
  sessionId?: string;
  checklistItemId?: string;
  reporterName?: string;
  reporterId?: string;
  category: FindingCategory;
  description?: string;
  clauseRef?: string;
}

// Body PUT /api/Finding/{id} (UpdateFindingRequest).
export interface UpdateFindingPayload {
  title: string;
  department?: string | null;
  reporterName?: string | null;
  reporterId?: string | null;
  category: FindingCategory;
  description?: string | null;
  clauseRef?: string | null;
}

export interface FindingListParams {
  status?: FindingStatus;
  category?: FindingCategory;
  from?: string;
  to?: string;
}

// Label di dropdown form.
export const categoryOptions: { value: FindingCategory; label: string }[] = [
  { value: 'MajorNC', label: 'Major NC' },
  { value: 'MinorNC', label: 'Minor NC' },
  { value: 'Observation', label: 'Observation' },
  { value: 'OFI', label: 'OFI' },
];

// Label badge di kartu list (desain memakai "Observe").
export const categoryBadgeLabel: Record<FindingCategory, string> = {
  MajorNC: 'Major NC',
  MinorNC: 'Minor NC',
  Observation: 'Observe',
  OFI: 'OFI',
};

export const statusLabel: Record<FindingStatus, string> = {
  Open: 'Open',
  InProgress: 'In Progress',
  Closed: 'Closed',
};

// ⚠️ Dashboard memakai key "QC", desain detail menampilkan "Quality Control".
// Ganti sesuai nilai department yang dipakai backend.
export const departmentOptions = ['Production', 'Packaging', 'Warehouse', 'QC'];

// GET /api/Finding?status=&category=&from=&to=
export async function getFindings(params: FindingListParams = {}): Promise<Finding[]> {
  const res = await axios_instance.get<Finding[]>('/Finding', { params });
  return res.data;
}

// GET /api/Finding/{id}
export async function getFinding(id: string): Promise<Finding> {
  const res = await axios_instance.get<Finding>(`/Finding/${id}`);
  return res.data;
}

// POST /api/Finding
export async function createFinding(payload: CreateFindingPayload): Promise<Finding> {
  const res = await axios_instance.post<Finding>('/Finding', payload);
  return res.data;
}

// PUT /api/Finding/{id}
export async function updateFinding(id: string, payload: UpdateFindingPayload) {
  const res = await axios_instance.put(`/Finding/${id}`, payload);
  return res.data;
}

// PATCH /api/Finding/{id}/status (body = string enum polos)
export async function updateFindingStatus(id: string, status: FindingStatus) {
  // JSON.stringify wajib: axios mengirim string apa adanya, sedangkan
  // backend mengharapkan JSON valid, yaitu "Closed" dengan tanda kutip.
  const res = await axios_instance.patch(`/Finding/${id}/status`, JSON.stringify(status));
  return res.data;
}

// GET /api/Upload/finding/{findingId}
export async function getFindingPhotos(findingId: string): Promise<FindingPhoto[]> {
  const res = await axios_instance.get<FindingPhoto[]>(`/Upload/finding/${findingId}`);
  return res.data;
}

// POST /api/Upload/finding/{findingId}  (multipart/form-data)
export async function uploadFindingPhoto(findingId: string, file: File) {
  const form = new FormData();
  form.append('file', file); // ⚠️ cek nama field yang diminta backend
  const res = await axios_instance.post(`/Upload/finding/${findingId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// Deteksi tipe gambar dari byte awal (magic bytes), untuk jaga-jaga kalau
// backend mengirim Content-Type yang salah (mis. application/octet-stream).
async function sniffImageType(blob: Blob): Promise<string | null> {
  const b = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e) return 'image/png';
  if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'image/gif';
  if (b[0] === 0x52 && b[1] === 0x49 && b[8] === 0x57) return 'image/webp';
  return null;
}

// GET /api/Upload/file/{fileId}
// Endpoint butuh Bearer token, jadi <img src> langsung tidak bisa.
// Ambil sebagai blob lewat axios lalu buat object URL.
export async function fetchFileBlob(fileId: string): Promise<Blob> {
  const res = await axios_instance.get<Blob>(`/Upload/file/${fileId}`, {
    responseType: 'blob',
  });
  const blob = res.data;
  if (blob.type.startsWith('image/')) return blob;

  const sniffed = await sniffImageType(blob);
  if (sniffed) return new Blob([blob], { type: sniffed });

  // Bukan gambar (mungkin JSON / base64 / URL). Tampilkan isinya di console untuk diagnosis.
  const preview = (await blob.text()).slice(0, 300);
  console.error(
    `[findings] /Upload/file/${fileId} bukan gambar. Content-Type: "${blob.type}". Isi:`,
    preview
  );
  throw new Error('Response file bukan gambar');
}
