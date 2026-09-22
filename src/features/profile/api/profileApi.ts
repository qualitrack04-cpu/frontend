import axiosInstance from '../../../shared/api/axios_instance';

export interface ProfileKpi {
  totalCapaAssigned: number;
  totalCapaClosed: number;
  totalCapaOpenInProgress: number;
  totalCapaClosedOnTime: number;
  totalFindingsReported: number;
  onTimeCompletionRate: number; // desimal 0..1, misal 0.857
}

export interface RecentActivityItem {
  activityType: string;
  description: string;
  timestamp: string;
  relatedId: string;
}

export async function getProfileKpi(): Promise<ProfileKpi> {
  const response = await axiosInstance.get('/Profile/kpi'); // baseURL sudah termasuk /api
  return response.data;
}

export async function getRecentActivity(limit = 10): Promise<RecentActivityItem[]> {
  const response = await axiosInstance.get('/Profile/recent-activity', {
    params: { limit },
  });
  return response.data;
}