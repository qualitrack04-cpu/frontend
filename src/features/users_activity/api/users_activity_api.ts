import api from '../../../shared/api/axios_instance';

export interface UserActivityItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  role: string;
  status: 'Active' | 'Inactive';
  activityName: string;
  description: string;
  timestamp: string;
}

export interface UserOverviewData {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    photoUrl?: string;
  };
  successRate: {
    percentage: number;
    achieved: number;
    total: number;
    target: number;
  };
  qualityScore: {
    score: number;
    auditStatusText: string;
    onTimeAuditsText: string;
  };
  recentActivities: {
    id: string;
    activityName: string;
    description: string;
    timestamp: string;
  }[];
}

export async function getUsersActivity(): Promise<UserActivityItem[]> {
  try {
    const response = await api.get('/admin/dashboard');
    const backendActivities = response.data?.recentActivities;

    if (Array.isArray(backendActivities) && backendActivities.length > 0) {
      return backendActivities.map((b: any, index: number) => {
        let extractedName = b.userName;
        if (!extractedName && typeof b.description === 'string') {
          const match = b.description.match(/oleh\s+(.+)$/i);
          if (match && match[1]) extractedName = match[1].trim();
        }
        const finalName = extractedName || 'System User';

        return {
          id: b.relatedId || `ua-${index}`,
          userId: b.userId || `u-${index + 1}`,
          userName: finalName,
          userEmail: b.userEmail || `${finalName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          role: b.role || (b.activityType === 'CapaVerified' ? 'Quality Manager' : b.activityType === 'FindingReported' ? 'Auditor Internal' : 'Auditee'),
          status: b.status || 'Active',
          activityName: b.activityType || 'Activity',
          description: b.description || 'Recent activity logged',
          timestamp: b.timestamp || new Date().toISOString(),
        };
      });
    }
  } catch (err) {
    console.warn('Failed to fetch user activities from /admin/dashboard:', err);
  }

  return [];
}

export async function getUserOverview(userId?: string): Promise<UserOverviewData> {
  try {
    const response = await api.get('/admin/dashboard');
    const backendActivities = response.data?.recentActivities;

    const userActivities = Array.isArray(backendActivities)
      ? backendActivities
          .filter((b: any) => !userId || b.userId === userId)
          .map((b: any, index: number) => ({
            id: `uoa-${index}`,
            activityName: b.activityType || 'Activity',
            description: b.description || 'Recent activity logged',
            timestamp: b.timestamp || new Date().toISOString(),
          }))
      : [];

    // Find the user info from activities or users endpoint
    const matchedActivity = Array.isArray(backendActivities)
      ? backendActivities.find((b: any) => b.userId === userId)
      : null;

    return {
      user: {
        id: matchedActivity?.userId || userId || '',
        fullName: matchedActivity?.userName || 'Unknown User',
        email: matchedActivity?.userEmail || '',
        role: matchedActivity?.role || 'Auditor Internal',
        photoUrl: matchedActivity?.userPhoto,
      },
      successRate: {
        percentage: 0,
        achieved: 0,
        total: 0,
        target: 90,
      },
      qualityScore: {
        score: 0,
        auditStatusText: 'No Audits Yet',
        onTimeAuditsText: '0/0 On-Time Audits',
      },
      recentActivities: userActivities,
    };
  } catch (err) {
    console.warn('Failed to fetch user overview from /admin/dashboard:', err);
  }

  return {
    user: {
      id: userId || '',
      fullName: 'Unknown User',
      email: '',
      role: 'Auditor Internal',
    },
    successRate: { percentage: 0, achieved: 0, total: 0, target: 90 },
    qualityScore: { score: 0, auditStatusText: 'No Audits Yet', onTimeAuditsText: '0/0 On-Time Audits' },
    recentActivities: [],
  };
}
