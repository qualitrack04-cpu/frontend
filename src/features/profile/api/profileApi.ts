import axiosInstance from '../../../shared/api/axios_instance';

export interface ProfileKpi {
  qualityScore: number;
  qualityLabel: string;
  successRate: number;
  successCount: string;
  target: number;
  onTime: number;
  overdue: number;
  // TODO: sesuaikan setelah lihat response asli backend
}

export interface RecentActivityItem {
  id: string;
  description: string;
  date: string;
  // TODO: sesuaikan setelah lihat response asli backend
}

export async function getProfileKpi(): Promise<ProfileKpi> {
  const response = await axiosInstance.get('/Profile/kpi'); // baseURL sudah termasuk /api
  return response.data;
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const response = await axiosInstance.get('/Profile/recent-activity'); // baseURL sudah termasuk /api
  return response.data;
}