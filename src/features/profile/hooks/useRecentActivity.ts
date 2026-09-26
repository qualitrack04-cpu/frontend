import { useState, useEffect } from 'react';
import { getRecentActivity } from '../api/profileApi';
import type { RecentActivityItem } from '../api/profileApi';

export function useRecentActivity() {
  const [data, setData] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchActivity() {
      try {
        setLoading(true);
        const result = await getRecentActivity();
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError('Gagal memuat aktivitas terbaru.');
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchActivity();
    return () => { isMounted = false; };
  }, []);

  return { data, loading, error };
}