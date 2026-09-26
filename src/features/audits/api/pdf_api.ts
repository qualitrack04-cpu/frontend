import axios_instance from '../../../shared/api/axios_instance';

export interface PdfReportResult {
  pdfUrl: string; 
}

// Backend generate PDF, simpan ke storage, lalu balikin URL-nya (untuk view & share)
export async function generatePdfReport(sessionId: string): Promise<PdfReportResult> {
  const response = await axios_instance.get<PdfReportResult>(`/Pdf/audit-report/${sessionId}/link`);
  return response.data;
}

// Ambil file PDF langsung sebagai blob (untuk tombol download)
export async function downloadPdfReport(sessionId: string): Promise<Blob> {
  const response = await axios_instance.get(`/Pdf/audit-report/${sessionId}`, {
    responseType: 'blob',
  });
  return response.data;
}