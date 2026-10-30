import { useState, useEffect, useCallback } from 'react';
import { 
  getUsersActivity, 
  getUserOverview, 
  type UserActivityItem, 
  type UserOverviewData 
} from '../api/users_activity_api';

export function useUsersActivity() {
  const [activities, setActivities] = useState<UserActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsersActivity();
      setActivities(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load user activity');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
  };
}

export function useUserOverview(userId?: string) {
  const [overview, setOverview] = useState<UserOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserOverview(userId);
      setOverview(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load user summary profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    overview,
    loading,
    error,
    refetch: fetchOverview,
  };
}
