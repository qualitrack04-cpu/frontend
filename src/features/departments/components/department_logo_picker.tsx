import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, RotateCcw, Trash2 } from 'lucide-react';
import { fileUrl } from '../../../shared/utils/file_url';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface DepartmentLogoPickerProps {
  /** File logo yang baru dipilih admin (belum di-upload). */
  file: File | null;
  /** Logo yang sudah tersimpan di server. */
  existingUrl?: string | null;
  /** True = logo tersimpan akan dihapus saat disimpan. */
  removeExisting: boolean;
  onSelectFile: (file: File | null) => void;
  onToggleRemoveExisting: (remove: boolean) => void;
  disabled?: boolean;
}

export default function DepartmentLogoPicker({
  file,
  existingUrl,
  removeExisting,
  onSelectFile,
  onToggleRemoveExisting,
  disabled = false,
}: DepartmentLogoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Object URL untuk preview file lokal, di-revoke saat file berubah / unmount
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const savedLogo = !removeExisting ? fileUrl(existingUrl) : undefined;
  const previewUrl = objectUrl ?? savedLogo ?? null;
  const hasSavedLogo = Boolean(savedLogo);

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    // Reset supaya file yang sama tetap memicu onChange
    event.target.value = '';
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Logo must be a JPG or PNG image');
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError('Logo size must not exceed 5 MB');
      return;
    }

    setError(null);
    onSelectFile(selected);
    // Memilih logo baru berarti logo tersimpan otomatis diganti
    if (hasSavedLogo) onToggleRemoveExisting(false);
  };

  const handleRemove = () => {
    setError(null);
    if (file) {
      onSelectFile(null);
      return;
    }
    if (hasSavedLogo) {
      onToggleRemoveExisting(true);
    }
  };

  const handleUndo = () => {
    setError(null);
    onToggleRemoveExisting(false);
  };

  const showRemoveButton = Boolean(file) || hasSavedLogo;
  const showUndoButton = removeExisting && Boolean(existingUrl);

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
          {previewUrl ? (
            <img src={previewUrl} alt="Department logo" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-slate-400" strokeWidth={1.8} />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-[12.5px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {previewUrl ? 'Change Logo' : 'Choose Logo'}
            </button>

            {showRemoveButton && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                title="Remove logo"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-transparent text-[#DC2626] hover:bg-red-50 font-medium text-[12.5px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} strokeWidth={2} />
                Remove
              </button>
            )}

            {showUndoButton && (
              <button
                type="button"
                onClick={handleUndo}
                disabled={disabled}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-[12.5px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={13} strokeWidth={2} />
                Undo
              </button>
            )}
          </div>

          <p className="text-[11.5px] text-slate-400 m-0 mt-1">
            {error ? <span className="text-[#DC2626] font-medium">{error}</span> : 'PNG or JPG, max 5 MB'}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handlePick}
        disabled={disabled}
      />
    </div>
  );
}