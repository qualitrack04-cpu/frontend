import axios_instance from '../../../shared/api/axios_instance';

// ---------- Summary ----------
export interface SummaryResponse {
  activeAudit: number;
  totalCapa: number;
  capaOpen: number;
  capaOverdue: number;
}

export async function getSummary(): Promise<SummaryResponse> {
  const response = await axios_instance.get('/Dashboard/summary');
  return response.data;
}

// ---------- Compliance Score ----------
export interface ComplianceDepartment {
  department: string;
  score: number;
  totalAudit: number;
  totalResponses: number;
  conformResponses: number;
}

export interface ComplianceScoreResponse {
  overallScore: number;
  data: ComplianceDepartment[];
}

export async function getComplianceScore(): Promise<ComplianceScoreResponse> {
  const response = await axios_instance.get('/Dashboard/compliance-score');
  return response.data;
}

// ---------- Audit Schedule ----------
export interface ScheduleDepartment {
  department: string;
  scheduleId: string;
  planTitle: string;
  standard: string;
}

export interface ScheduleDay {
  day: number;
  departments: ScheduleDepartment[];
}

export interface AuditScheduleResponse {
  month: number;
  year: number;
  data: ScheduleDay[];
}

export async function getAuditSchedule(
  month: number,
  year: number
): Promise<AuditScheduleResponse> {
  const response = await axios_instance.get('/Dashboard/audit-schedule', {
    params: { month, year },
  });
  return response.data;
}

// ---------- Monthly Report ----------
export interface MonthlyReportSummary {
  totalSchedules: number;
  completedAudit: number;
  inProgressAudit: number;
  notStartedAudit: number;
  complianceScore: number;
  totalFindings: number;
  totalCapa: number;
  capaOpen: number;
  capaOverdue: number;
}

export interface MonthlyReportSchedule {
  sessionId: string | null;
  scheduleId: string;
  planId: string;
  department: string;
  auditorName: string;
  scheduledDate: string;
  status: string;
  totalFindings: number;
  majorNC: number;
  minorNC: number;
  observation: number;
}

export interface MonthlyReportResponse {
  month: number;
  year: number;
  generatedAt: string;
  summary: MonthlyReportSummary;
  schedules: MonthlyReportSchedule[];
}

export async function getMonthlyReport(
  month: number,
  year: number
): Promise<MonthlyReportResponse> {
  const response = await axios_instance.get('/Dashboard/monthly-report', {
    params: { month, year },
  });
  return response.data;
}

// ---------- PDF ----------
export async function downloadAuditReportPdf(sessionId: string): Promise<Blob> {
  const response = await axios_instance.get(`/Pdf/audit-report/${sessionId}`, {
    responseType: 'blob',
  });
  return response.data;
}