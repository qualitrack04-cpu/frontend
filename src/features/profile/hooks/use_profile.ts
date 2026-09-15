import { useState, useEffect } from 'react';
import { getProfile} from '../../auth/api/auth_api';
import type { ProfileData } from '../../auth/api/auth_api';

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProfile() {
    try {
      setLoading(true);
      const result = await getProfile();
      setProfile(result);
    } catch (err) {
      setError('Gagal memuat data profil.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
}