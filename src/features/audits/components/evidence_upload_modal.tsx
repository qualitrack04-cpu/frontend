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
      setError(err.response?.data?.message ?? 'Gagal mengunggah bukti');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="evidence-modal-box">
        <div className="evidence-drag-handle" />
        <h3 className="evidence-modal-title">Upload Evidence</h3>

        {!previewUrl ? (
          <label className="evidence-dropzone">
            <ImagePlus size={22} />
            <span>Select Image</span>
            <input type="file" accept="image/*" hidden onChange={handleSelect} />
          </label>
        ) : (
          <div className="evidence-preview-wrapper">
            <img src={previewUrl} alt="Preview" className="evidence-preview-img" />
            <button className="evidence-delete-btn" onClick={handleRemove} aria-label="Hapus">
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        {previewUrl && (
          <button className="btn-evidence-upload" onClick={handleUpload} disabled={uploading}>
            <UploadCloud size={16} /> {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}

        <button className="evidence-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}