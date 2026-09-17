import { useState, useEffect } from 'react';

export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => active && setData(result))
      .catch((err: any) => {
        if (!active) return;
        setError(
          err.response?.status === 404
            ? 'Data belum tersedia.'
            : err.response?.data?.message ?? 'Gagal memuat data.'
        );
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}