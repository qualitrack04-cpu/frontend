import { useState } from 'react';
import { updateProfile, changePassword, uploadProfilePhoto } from '../../auth/api/auth_api';

export function useEditProfile() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile(fullName: string, newPassword: string) {
    setSaving(true);
    setError(null);
    try {
      // Update nama dulu
      await updateProfile({ fullName });

      // Kalau user isi field password baru, kirim request ganti password terpisah
      if (newPassword) {
        await changePassword({ newPassword, confirmPassword: newPassword });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan perubahan.');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function savePhoto(file: File) {
    setSaving(true);
    setError(null);
    try {
      const result = await uploadProfilePhoto(file);
      return result.url as string;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengunggah foto.');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return { saveProfile, savePhoto, saving, error };
}