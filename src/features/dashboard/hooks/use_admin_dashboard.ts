import { useState, useEffect, useCallback } from 'react';
import { getAdminDashboard } from '../api/admin_api';
import type { AdminDashboardSummary } from '../api/admin_api';

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);
        const result = await getAdminDashboard();
        if (mounted) {
          setData(result);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch admin dashboard');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
