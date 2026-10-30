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
      setError('File must be an image (JPG, PNG, or WEBP).');
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
      setError(err.response?.data?.message ?? 'Failed to upload photo.');
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[rgba(15,44,82,0.4)] backdrop-blur-[2px] z-[9000] flex items-end sm:items-center justify-center animate-[fadein_0.2s_ease-out]"
      role="presentation"
      onClick={() => !uploading && onClose()}
    >
      <div
        className="bg-white w-full max-w-[400px] rounded-t-[20px] sm:rounded-[16px] p-[24px] flex flex-col animate-[slideup_0.2s_ease-out]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fd-upload-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="block w-[40px] h-[4px] bg-[#cbd5e1] rounded-[2px] mx-auto mb-[16px] sm:hidden" aria-hidden="true" />
        <h3 id="fd-upload-title" className="text-[16px] font-bold text-[#0f2c52] m-0 mb-[20px] text-center">Upload Photo</h3>

        {previewUrl ? (
          <div className="relative w-full aspect-[4/3] rounded-[12px] overflow-hidden mb-[24px]">
            <img src={previewUrl} alt="Selected photo preview" className="w-full h-full object-cover" />
            <button
              type="button"
              className="absolute top-[12px] right-[12px] w-[36px] h-[36px] bg-[rgba(0,0,0,0.6)] text-white border-none rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-[#dc2626]"
              aria-label="Delete photo"
              onClick={() => setFile(null)}
              disabled={uploading}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-[12px] h-[160px] bg-[#f8fafc] border-[2px] border-dashed border-[#cbd5e1] rounded-[12px] cursor-pointer transition-all duration-200 text-[#64748b] text-[14px] p-0 hover:bg-[#f1f5f9] hover:border-[#94a3b8] hover:text-[#0f2c52] mb-[24px]"
            onClick={() => inputRef.current?.click()}
          >
            <span className="w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,44,82,0.05)]">
              <ImagePlus size={24} />
            </span>
            <strong className="font-bold">Select Image</strong>
          </button>
        )}

        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleChange} />

        {error && <p className="text-[#dc2626] text-[13px] mt-[4px]">{error}</p>}

        {file && (
          <button
            type="button"
            className="w-full mb-[12px] bg-[#0f2c52] text-white border-none p-[16px_24px] rounded-[8px] text-[15px] font-bold cursor-pointer inline-flex items-center justify-center gap-[12px] transition-all duration-200 shadow-[0_4px_12px_rgba(15,44,82,0.1)] hover:bg-[#0c2444] hover:-translate-y-[1px] hover:shadow-[0_6px_16px_rgba(15,44,82,0.15)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            onClick={handleUpload}
            disabled={uploading}
          >
            <CloudUpload size={20} />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}

        <button
          type="button"
          className="bg-transparent border-none text-[#64748b] text-[14.5px] font-semibold cursor-pointer p-[12px] hover:text-[#1e293b]"
          onClick={onClose}
          disabled={uploading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}