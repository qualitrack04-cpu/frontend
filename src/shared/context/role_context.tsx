import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { getProfile } from '../../features/auth/api/auth_api';

interface RoleContextValue {
  role: string;
  loading: boolean;
  refresh: () => Promise<void>;
}

// Jeda minimal antar-refresh saat window kembali fokus, supaya API tidak dipanggil terus-menerus.
const FOCUS_REFRESH_THROTTLE_MS = 60_000;
const ROLE_CHANGED_REDIRECT = '/login?reason=role-changed';

const RoleContext = createContext<RoleContextValue | null>(null);

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('fullName');
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (ctx) return ctx;

  // Fallback aman bila hook dipakai di luar provider.
  return { role: localStorage.getItem('role') ?? '', loading: false, refresh: async () => {} };
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState(() => localStorage.getItem('role') ?? '');
  const [loading, setLoading] = useState(true);
  const lastFetchRef = useRef(0);
  const redirectingRef = useRef(false);

  const refresh = useCallback(async (force: boolean = true) => {
    if (redirectingRef.current) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const now = Date.now();
    if (!force && now - lastFetchRef.current < FOCUS_REFRESH_THROTTLE_MS) return;
    lastFetchRef.current = now;

    try {
      const profile = await getProfile();
      const sessionRole = localStorage.getItem('role') ?? '';

      // Role di server berbeda dengan role saat token dibuat berarti klaim JWT sudah basi.
      // Token tidak bisa diperbarui tanpa endpoint refresh di backend, jadi sesi diakhiri
      // dan user diminta login ulang agar UI maupun hak akses API kembali konsisten.
      if (sessionRole && profile.role !== sessionRole) {
        redirectingRef.current = true;
        clearSession();
        window.location.href = ROLE_CHANGED_REDIRECT;
        return;
      }

      if (!sessionRole) {
        localStorage.setItem('role', profile.role);
      }
      if (profile.fullName) {
        localStorage.setItem('fullName', profile.fullName);
      }
      setRole(profile.role);
    } catch {
      // Error 401 sudah ditangani interceptor axios_instance.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh(true);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh(false);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'role') setRole(event.newValue ?? '');
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('storage', handleStorage);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refresh]);

  return (
    <RoleContext.Provider value={{ role, loading, refresh }}>
      {children}
    </RoleContext.Provider>
  );
}