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
  createdAt?: string;
  foundAt?: string;
}

// Bentuk response GET /api/Upload/finding/{findingId} (lihat UploadController.GetFindingFiles):
// backend sudah mengirim `url` langsung (hasil storage.GetPresignedUrl), jadi
// foto bisa dipakai langsung sebagai <img src> tanpa perlu fetch terpisah.
export interface FindingPhoto {
  id: string;
  fileName?: string | null;
  url: string;
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
  sessionId?: string;
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

// GET /api/Finding?status=Open — khusus finding belum ada CAPA
export async function getFindingsWithoutCapa(): Promise<Finding[]> {
  const res = await axios_instance.get<Finding[]>('/Finding', { params: { status: 'Open' } });
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

// Catatan: sebelumnya ada fungsi fetchFileBlob() yang mengambil foto lewat
// GET /api/Upload/file/{fileId} sebagai blob. Itu salah asumsi — endpoint
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

// GET /api/Finding/without-capa
export async function getFindingsWithoutCapa(): Promise<Finding[]> {
  const res = await axios_instance.get<ListEnvelope<Finding>>('/Finding/without-capa');
  return res.data.data;
}

// GET /api/Finding/by-session/{sessionId}
export async function getFindingsBySession(sessionId: string): Promise<Finding[]> {
  const res = await axios_instance.get<ListEnvelope<Finding>>(`/Finding/by-session/${sessionId}`);
  return res.data.data;
}

