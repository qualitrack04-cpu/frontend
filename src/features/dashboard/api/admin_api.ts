import api from '../../../shared/api/axios_instance';

export interface AdminActivity {
  activityType: string;
  description: string;
  userName: string;
  timestamp: string;
}

export interface AdminRecentChange {
  action: string;
  entityType: string;
  entityName: string;
  description: string;
  timestamp: string;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  totalIsoStandards: number;
  totalDepartments: number;
  totalChecklistTemplates: number;
  totalSpcUnits: number;
  recentActivities: AdminActivity[];
  recentChanges: AdminRecentChange[];
}

export async function getAdminDashboard(): Promise<AdminDashboardSummary> {
  const response = await api.get('/admin/dashboard');
  return response.data;
}
