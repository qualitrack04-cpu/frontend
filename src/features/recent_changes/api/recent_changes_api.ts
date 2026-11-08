import api from '../../../shared/api/axios_instance';

export interface RecentChangeItem {
  id: string;
  action: string;
  entityType: string;
  entityName: string;
  description: string;
  timestamp: string;
}

export function formatEntityType(rawType?: string): string {
  if (!rawType) return 'System Management';
  const clean = rawType.replace(/Management$/i, '').trim();

  switch (clean.toLowerCase()) {
    case 'isostandard':
    case 'iso standard':
      return 'ISO Standard Management';
    case 'spcunit':
    case 'spc unit':
      return 'SPC Unit Management';
    case 'checklisttemplate':
    case 'checklist template':
      return 'Checklist Template Management';
    case 'department':
      return 'Department Management';
    case 'user':
      return 'User Management';
    case 'systemconfig':
    case 'systemconfiguration':
    case 'system configuration':
      return 'System Configuration Management';
    default:
      return `${clean.replace(/([a-z])([A-Z])/g, '$1 $2')} Management`;
  }
}

export async function getRecentChanges(): Promise<RecentChangeItem[]> {
  try {
    const response = await api.get('/admin/dashboard');
    const backendChanges = response.data?.recentChanges;

    if (Array.isArray(backendChanges) && backendChanges.length > 0) {
      return backendChanges.map((b: any, index: number) => ({
        id: b.id || `rc-${index}`,
        action: b.action || 'UPDATE',
        entityType: formatEntityType(b.entityType),
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
