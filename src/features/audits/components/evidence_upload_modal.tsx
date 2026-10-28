import { useState } from 'react';
import { ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import { uploadAuditResponseEvidence } from '../api/upload_api';

interface EvidenceUploadModalProps {
  responseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EvidenceUploadModal({ responseId, onClose, onSuccess }: EvidenceUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadAuditResponseEvidence(responseId, file);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(15,44,82,0.4)] backdrop-blur-[2px] flex items-end sm:items-center justify-center z-[1000] animate-[fadein_0.2s_ease-out]">
      <div className="bg-white w-full max-w-[400px] rounded-t-[20px] sm:rounded-[16px] p-[24px] flex flex-col animate-[slideup_0.2s_ease-out]">
        <div className="w-[40px] h-[4px] bg-[#cbd5e1] rounded-[2px] mx-auto mb-[16px] sm:hidden" />
        <h3 className="text-center text-[16px] text-[#0f2c52] m-0 mb-[20px] font-bold">Upload Evidence</h3>

        {!previewUrl ? (
          <label className="flex flex-col items-center justify-center gap-[12px] h-[140px] border-[2px] border-dashed border-[#cbd5e1] rounded-[12px] bg-[#f8fafc] text-[#64748b] font-semibold text-[14px] cursor-pointer transition-all duration-200 hover:bg-[#f1f5f9] hover:border-[#94a3b8] hover:text-[#0f2c52]">
            <ImagePlus size={22} />
            <span>Select Image</span>
            <input type="file" accept="image/*" hidden onChange={handleSelect} />
          </label>
        ) : (
          <div className="relative w-full h-[200px] rounded-[12px] overflow-hidden mb-[20px]">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button className="absolute top-[8px] right-[8px] w-[32px] h-[32px] bg-[rgba(0,0,0,0.6)] text-white border-none rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-[#dc2626]" onClick={handleRemove} aria-label="Remove">
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {error && <p className="text-[#dc2626] text-[13px] mt-[4px]">{error}</p>}

        {previewUrl && (
          <button className="bg-[#0f2c52] text-white border-none p-[14px] rounded-[8px] text-[14px] font-semibold flex items-center justify-center gap-[8px] cursor-pointer w-full disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleUpload} disabled={uploading}>
            <UploadCloud size={16} /> {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}

        <button className="bg-transparent text-[#64748b] border-none text-[14px] font-semibold mt-[16px] cursor-pointer hover:text-[#1e293b]" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}