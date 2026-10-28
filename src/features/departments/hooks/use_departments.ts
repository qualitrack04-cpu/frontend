import { useState, useEffect, useCallback } from 'react';
import { getDepartments, type DepartmentItem } from '../api/departments_api';

export function useDepartments() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    loading,
    error,
    refetch: fetchDepartments,
  };
}
