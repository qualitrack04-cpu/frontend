import api from '../../../shared/api/axios_instance';

export interface RecentChangeItem {
  id: string;
  action: string;
  entityType: string;
  entityName: string;
  description: string;
  timestamp: string;
}

export async function getRecentChanges(): Promise<RecentChangeItem[]> {
  try {
    const response = await api.get('/admin/dashboard');
    const backendChanges = response.data?.recentChanges;

    if (Array.isArray(backendChanges) && backendChanges.length > 0) {
      return backendChanges.map((b: any, index: number) => ({
        id: b.id || `rc-${index}`,
        action: b.action || 'UPDATE',
        entityType: b.entityType?.includes('Management') ? b.entityType : `${b.entityType} Management`,
        entityName: b.entityName || '',
        description: b.description || `${b.action} on ${b.entityType}`,
        timestamp: b.timestamp || new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn('Failed to fetch recent changes from /admin/dashboard:', err);
  }

  return [];
}
