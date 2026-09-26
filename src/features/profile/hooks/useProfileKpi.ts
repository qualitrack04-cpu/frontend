import { useState, useEffect } from 'react';
import { getProfileKpi } from '../api/profileApi';
import type { ProfileKpi } from '../api/profileApi';

// enabled = false -> tidak fetch (role yang tidak menampilkan KPI)
export function useProfileKpi(enabled = true) {
  const [data, setData] = useState<ProfileKpi | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let isMounted = true;

    async function fetchKpi() {
      try {
        setLoading(true);
        const result = await getProfileKpi();
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError('Gagal memuat data quality score.');
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchKpi();
    return () => { isMounted = false; };
  }, [enabled]);

  return { data, loading, error };
}