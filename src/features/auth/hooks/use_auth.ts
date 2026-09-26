import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/auth_api';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const result = await loginApi({ email, password });

      if (!result?.token) {
        throw new Error('Response login tidak berisi token.')
      }

      localStorage.setItem('token', result.token);
      localStorage.setItem('role', result.role ?? '');
      localStorage.setItem('fullName', result.fullName ?? '');

      navigate('/dashboard', {replace: true}); 
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? err.message ?? 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error };
}