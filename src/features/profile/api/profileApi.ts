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
  const response = await axiosInstance.get('/profile/kpi'); // baseURL sudah termasuk /api
  const data = response.data ?? {};
  const totalAssigned = data.totalCapaAssigned ?? data.totalAssigned ?? 0;
  const totalCompleted = data.totalCapaClosed ?? data.totalCompleted ?? 0;
  const totalCompletedOnTime = data.totalCapaClosedOnTime ?? data.totalCompletedOnTime ?? 0;
  const totalOverdue = data.totalOverdue ?? data.totalCapaOpenInProgress ?? 0;

  const qualityScore =
    data.qualityScore != null
      ? (data.qualityScore > 1 ? data.qualityScore : data.qualityScore * 100)
      : data.onTimeRate != null
      ? data.onTimeRate * 100
      : data.onTimeCompletionRate != null
      ? (data.onTimeCompletionRate > 1 ? data.onTimeCompletionRate : data.onTimeCompletionRate * 100)
      : (totalCompleted > 0 ? (totalCompletedOnTime / totalCompleted) * 100 : 0);

  const successRate =
    data.complianceScore != null
      ? (data.complianceScore > 1 ? data.complianceScore : data.complianceScore * 100)
      : data.successRate != null
      ? (data.successRate > 1 ? data.successRate : data.successRate * 100)
      : (totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0);

  return {
    ...data,
    kpiBasis: data.kpiBasis ?? 'Audit',
    totalAssigned,
    totalCompleted,
    totalCompletedOnTime,
    totalOverdue,
    qualityScore: Math.round(qualityScore * 10) / 10,
    successRate: Math.round(successRate * 10) / 10,
  };
}

export async function getRecentActivity(limit = 10): Promise<RecentActivityItem[]> {
  const response = await axiosInstance.get('/profile/recent-activity', {
    params: { limit },
  });
  return response.data;
}