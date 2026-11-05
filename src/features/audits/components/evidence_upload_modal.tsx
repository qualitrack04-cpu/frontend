import { useState } from 'react';
import { ImagePlus, Trash2, UploadCloud, FileText } from 'lucide-react';
import { uploadAuditResponseEvidence } from '../api/upload_api';

interface EvidenceUploadModalProps {
  responseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf'];

export default function EvidenceUploadModal({ responseId, onClose, onSuccess }: EvidenceUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = '';
    if (!selected) return;

    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size must not exceed ${MAX_SIZE_MB} MB.`);
      return;
    }

    const ext = selected.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      setError('Allowed file formats: JPG, JPEG, PNG, or PDF.');
      return;
    }

    setError(null);
    setFile(selected);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadAuditResponseEvidence(responseId, file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      onSuccess();
    } catch (err: any) {
      const data = err.response?.data;
      const msg =
        data?.message ||
        data?.title ||
        (data?.errors ? Object.values(data.errors).flat().join(' ') : null);
      setError(msg ?? 'Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  const isPdf = file?.name.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 bg-[rgba(15,44,82,0.4)] backdrop-blur-[2px] flex items-end sm:items-center justify-center z-[1000] animate-[fadein_0.2s_ease-out]">
      <div className="bg-white w-full max-w-[400px] max-h-[90vh] overflow-y-auto rounded-t-[20px] sm:rounded-[16px] p-5 sm:p-6 flex flex-col animate-[slideup_0.2s_ease-out]">
        <div className="w-[40px] h-[4px] bg-[#cbd5e1] rounded-[2px] mx-auto mb-[16px] sm:hidden" />
        <h3 className="text-center text-[16px] text-[#0f2c52] m-0 mb-[20px] font-bold">Upload Evidence</h3>

        {!previewUrl ? (
          <label className="flex flex-col items-center justify-center gap-[12px] h-[140px] border-[2px] border-dashed border-[#cbd5e1] rounded-[12px] bg-[#f8fafc] text-[#64748b] font-semibold text-[14px] cursor-pointer transition-all duration-200 hover:bg-[#f1f5f9] hover:border-[#94a3b8] hover:text-[#0f2c52]">
            <ImagePlus size={22} />
            <span>Select File (JPG, PNG, PDF)</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              hidden
              onChange={handleSelect}
            />
          </label>
        ) : (
          <div className="relative w-full h-[200px] rounded-[12px] overflow-hidden mb-[20px] bg-[#f1f5f9] flex items-center justify-center">
            {isPdf ? (
              <div className="flex flex-col items-center gap-[8px] p-4 text-center">
                <FileText size={48} className="text-[#0f2c52]" />
                <span className="text-[13px] font-semibold text-[#1e293b] truncate max-w-[280px]">
                  {file?.name}
                </span>
                <span className="text-[11px] text-[#64748b]">
                  {((file?.size ?? 0) / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            )}
            <button
              className="absolute top-[8px] right-[8px] w-[32px] h-[32px] bg-[rgba(0,0,0,0.6)] text-white border-none rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-[#dc2626]"
              onClick={handleRemove}
              aria-label="Remove"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {error && <p className="text-[#dc2626] text-[13px] mt-[4px]">{error}</p>}

        {previewUrl && (
          <button
            className="bg-[#0f2c52] text-white border-none p-[14px] rounded-[8px] text-[14px] font-semibold flex items-center justify-center gap-[8px] cursor-pointer w-full disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleUpload}
            disabled={uploading}
          >
            <UploadCloud size={16} /> {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}

        <button
          className="bg-transparent text-[#64748b] border-none text-[14px] font-semibold mt-[16px] cursor-pointer hover:text-[#1e293b]"
          onClick={() => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            onClose();
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}