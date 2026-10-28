import { useState, useEffect, useCallback } from 'react';
import { getSpcUnits, type SpcUnit } from '../api/spc_units_api';

export function useSpcUnits(isActive?: boolean) {
  const [units, setUnits] = useState<SpcUnit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSpcUnits(isActive);
      setUnits(res.data);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load SPC units');
    } finally {
      setLoading(false);
    }
  }, [isActive]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  return {
    units,
    total,
    loading,
    error,
    refetch: fetchUnits,
  };
}
