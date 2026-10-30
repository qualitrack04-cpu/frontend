import { useState, useEffect, useCallback } from 'react';
import { getIsoStandards } from '../api/iso_standards_api';
import type { GetIsoStandardsResponse } from '../api/iso_standards_api';

export function useIsoStandards(isActiveFilter?: boolean) {
  const [data, setData] = useState<GetIsoStandardsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIsoStandards(isActiveFilter);
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load ISO Standards');
    } finally {
      setLoading(false);
    }
  }, [isActiveFilter]);

  useEffect(() => {
    fetchStandards();
  }, [fetchStandards]);

  return {
    data,
    loading,
    error,
    refetch: fetchStandards,
  };
}
