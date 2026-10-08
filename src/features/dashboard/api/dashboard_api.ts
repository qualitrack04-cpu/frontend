import axios_instance from '../../../shared/api/axios_instance';

// ---------- Summary ----------
export interface SummaryResponse {
  activeAudit: number;
  totalCapa: number;
  capaOpen: number;
  capaOverdue: number;
}

export async function getSummary(): Promise<SummaryResponse> {
  const response = await axios_instance.get('/dashboard/summary');
  return response.data;
}

// ---------- Quality Trend ----------
export interface QualityTrendPoint {
  month: string;
  year: number;
  score: number;
}

export interface QualityTrendResponse {
  currentScore: number;
  trendPercentage: number;
  data: QualityTrendPoint[];
}

export async function getQualityTrend(months: number = 6): Promise<QualityTrendResponse> {
  const timeframe = months === 12 ? '1y' : (months === 3 ? '3m' : '6m');
  const response = await axios_instance.get('quality-scores/overall-trend', {
    params: { timeframe }
  });
  
  // Backend returns List<OverallTrendDto> which we map to QualityTrendPoint
  const points: QualityTrendPoint[] = response.data.map((item: any) => ({
    month: item.monthName || (item.periodLabel ? item.periodLabel.split(' ')[0] : ''), // "Jan 2026" -> "Jan"
    year: item.year || 0,
    score: item.overallScore ?? item.score ?? 0
  }));

  const currentScore = points.length > 0 ? points[points.length - 1].score : 0;
  const previousScore = points.length > 1 ? points[points.length - 2].score : currentScore;
  const trendPercentage = previousScore > 0 ? Math.round(((currentScore - previousScore) / previousScore) * 100) : 0;

  return {
    currentScore,
    trendPercentage,
    data: points
  };
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
  const response = await axios_instance.get('/dashboard/compliance-score');
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
  const response = await axios_instance.get('/dashboard/audit-schedule', {
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
  const response = await axios_instance.get('/dashboard/monthly-report', {
    params: { month, year },
  });
  return response.data;
}

// ---------- PDF ----------
export async function downloadAuditReportPdf(sessionId: string): Promise<Blob> {
  const response = await axios_instance.get(`/pdf/audit-report/${sessionId}`, {
    responseType: 'blob',
  });
  return response.data;
}