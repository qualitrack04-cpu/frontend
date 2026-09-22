import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { CloudUpload, ImagePlus, Trash2 } from 'lucide-react';

const MAX_SIZE_MB = 5;

interface Props {
  open: boolean;
  onClose: () => void;
  // Dipanggil saat tombol Upload ditekan. Kalau melempar error, modal tetap terbuka.
  onUpload: (file: File) => Promise<void>;
}

export default function UploadPhotoModal({ open, onClose, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Reset setiap kali modal dibuka
  useEffect(() => {
    if (open) {
      setFile(null);
      setError(null);
      setUploading(false);
    }
  }, [open]);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  // Tutup dengan Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !uploading && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, uploading, onClose]);

  if (!open) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = ''; // supaya file yang sama bisa dipilih ulang
    if (!picked) return;

    if (!picked.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }
    if (picked.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran gambar maksimal ${MAX_SIZE_MB} MB.`);
      return;
    }
    setError(null);
    setFile(picked);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await onUpload(file);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Gagal mengunggah foto.');
      setUploading(false);
    }
  };

  return (
    <div
      className="fd-modal-overlay"
      role="presentation"
      onClick={() => !uploading && onClose()}
    >
      <div
        className="fd-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fd-upload-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="fd-modal-handle" aria-hidden="true" />
        <h3 id="fd-upload-title">Upload Photo</h3>

        {previewUrl ? (
          <div className="fd-modal-preview">
            <img src={previewUrl} alt="Preview foto yang dipilih" />
            <button
              type="button"
              className="fd-modal-trash"
              aria-label="Hapus foto"
              onClick={() => setFile(null)}
              disabled={uploading}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="fd-modal-dropzone"
            onClick={() => inputRef.current?.click()}
          >
            <span className="fd-modal-dropzone-icon">
              <ImagePlus size={24} />
            </span>
            <strong>Select Image</strong>
          </button>
        )}

        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleChange} />

        {error && <p className="error-text">{error}</p>}

        {file && (
          <button
            type="button"
            className="fd-btn-primary fd-modal-upload"
            onClick={handleUpload}
            disabled={uploading}
          >
            <CloudUpload size={20} />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}

        <button
          type="button"
          className="fd-modal-cancel"
          onClick={onClose}
          disabled={uploading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}