export interface ActivityMeta {
  title: string;
  badge: string;
  color: string;
  background: string;
}

const ACTIVITY_MAP: Record<string, ActivityMeta> = {
  CapaAction: {
    title: 'CAPA Action',
    badge: 'UPDATE',
    color: '#2563eb',
    background: '#dbeafe',
  },
  CapaVerified: {
    title: 'CAPA Verified',
    badge: 'SUCCESS',
    color: '#16a34a',
    background: '#dcfce7',
  },
  FindingReported: {
    title: 'Finding Reported',
    badge: 'CRITICAL',
    color: '#dc2626',
    background: '#fee2e2',
  },
};

export function activityMeta(type: string): ActivityMeta {
  return (
    ACTIVITY_MAP[type] ?? {
      title: type,
      badge: type.toUpperCase(),
      color: '#475569',
      background: '#e2e8f0',
    }
  );
}