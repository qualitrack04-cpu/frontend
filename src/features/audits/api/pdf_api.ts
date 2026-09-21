import axios_instance from '../../../shared/api/axios_instance';

export interface PdfReportResult {
  pdfUrl: string; 
}

export async function generatePdfReport(sessionId: string): Promise<PdfReportResult> {
  const response = await axios_instance.get(`/Pdf/audit-report/${sessionId}`);
  return response.data;
}