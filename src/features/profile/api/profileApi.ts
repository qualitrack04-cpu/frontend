import axiosInstance from '../../../shared/api/axios_instance';

export interface ProfileKpi {
  totalCapaAssigned: number;
  totalCapaClosed: number;
  totalCapaOpenInProgress: number;
  totalCapaClosedOnTime: number;
  totalFindingsReported: number;
  onTimeCompletionRate: number; // desimal 0..1, misal 0.857
  // KPI tugas: Auditee berbasis CAPA, Auditor berbasis jadwal audit
  kpiBasis: 'Audit' | 'Capa';
  totalAssigned: number;
  totalCompleted: number;
  totalCompletedOnTime: number;
  totalOverdue: number;
  qualityScore: number; // desimal 0..1: selesai tepat waktu / yang sudah dikerjakan
  successRate: number;  // desimal 0..1: selesai / seluruh tugas yang diberikan
}

export interface RecentActivityItem {
  activityType: string;
  description: string;
  timestamp: string;
  relatedId: string;
}

export async function getProfileKpi(): Promise<ProfileKpi> {
  const response = await axiosInstance.get('/Profile/kpi'); // baseURL sudah termasuk /api
  const data = response.data ?? {};
  // Default 0 kalau ada field yang tidak dikirim backend (mis. backend versi lama) supaya tidak NaN
  return {
    ...data,
    kpiBasis: data.kpiBasis ?? 'Audit',
    totalAssigned: data.totalAssigned ?? 0,
    totalCompleted: data.totalCompleted ?? 0,
    totalCompletedOnTime: data.totalCompletedOnTime ?? 0,
    totalOverdue: data.totalOverdue ?? 0,
    qualityScore: data.qualityScore ?? 0,
    successRate: data.successRate ?? 0,
  };
}

export async function getRecentActivity(limit = 10): Promise<RecentActivityItem[]> {
  const response = await axiosInstance.get('/Profile/recent-activity', {
    params: { limit },
  });
  return response.data;
}