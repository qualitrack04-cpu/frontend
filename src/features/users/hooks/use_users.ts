import { useState, useEffect, useCallback } from 'react';
import { getUsers } from '../api/users_api';
import type { GetUsersResponse } from '../api/users_api';

export function useUsers(search?: string, role?: string, status?: string) {
  const [data, setData] = useState<GetUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getUsers(search, role, status);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [search, role, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, loading, error, refetch: fetchUsers };
}
