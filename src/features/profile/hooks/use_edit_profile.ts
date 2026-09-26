import { useState } from 'react';
import { updateProfile, changePassword, uploadProfilePhoto, removeProfilePhoto } from '../../auth/api/auth_api';

export function useEditProfile() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State terpisah untuk aksi foto (upload/hapus), supaya tidak ikut
  // ter-disable/ter-error oleh proses simpan nama & password, dan supaya
  // pesan errornya bisa ditampilkan tepat di kartu foto.
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

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
    setPhotoSaving(true);
    setPhotoError(null);
    try {
      const result = await uploadProfilePhoto(file);
      return result.url as string;
    } catch (err: any) {
      setPhotoError(err.response?.data?.message || 'Gagal mengunggah foto.');
      throw err;
    } finally {
      setPhotoSaving(false);
    }
  }

  async function deletePhoto() {
    setPhotoSaving(true);
    setPhotoError(null);
    try {
      await removeProfilePhoto();
    } catch (err: any) {
      setPhotoError(err.response?.data?.message || 'Gagal menghapus foto.');
      throw err;
    } finally {
      setPhotoSaving(false);
    }
  }

  return { saveProfile, savePhoto, deletePhoto, saving, error, photoSaving, photoError };
}