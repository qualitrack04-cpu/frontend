import { useState, useEffect, useCallback } from 'react';
import { getRecentChanges, type RecentChangeItem } from '../api/recent_changes_api';

export function useRecentChanges() {
  const [changes, setChanges] = useState<RecentChangeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChanges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecentChanges();
      setChanges(data);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat riwayat perubahan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChanges();
  }, [fetchChanges]);

  return {
    changes,
    loading,
    error,
    refetch: fetchChanges,
  };
}
