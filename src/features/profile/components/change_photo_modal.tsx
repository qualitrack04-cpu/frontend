import { useState } from 'react';
import { X, UploadCloud, HardDrive, Camera, Link2, Cloud } from 'lucide-react';

interface ChangePhotoModalProps {
  currentName: string;
  currentRole: string;
  onClose: () => void;
  onSave: (file: File | null) => void;
}

export default function ChangePhotoModal({ currentName, currentRole, onClose, onSave }: ChangePhotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };

  return (
    <div className="modal-overlay">
      <div className="photo-modal-box">
        <div className="photo-modal-header">
          <h3>Change Profile Picture</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="photo-preview-row">
          <div className="avatar-placeholder">{currentName.charAt(0)}</div>
          <div>
            <strong>{currentName}</strong>
            <p className="text-muted">{currentRole}</p>
          </div>
        </div>

        <div className="photo-source-grid">
          <button className="photo-source-btn" disabled title="Belum tersedia">
            <Cloud size={16} />
            <span>Google Drive</span>
          </button>
          <label className="photo-source-btn active-source">
            <HardDrive size={16} />
            <span>Local Device</span>
            <input type="file" accept="image/*" hidden onChange={handleInputChange} />
          </label>
          <button className="photo-source-btn" disabled title="Belum tersedia">
            <Camera size={16} />
            <span>Take Photo</span>
          </button>
          <button className="photo-source-btn" disabled title="Belum tersedia">
            <Link2 size={16} />
            <span>Web URL</span>
          </button>
        </div>

        <div
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="dropzone-preview" />
          ) : (
            <>
              <UploadCloud size={28} className="dropzone-icon" />
              <strong>Drag & drop image here</strong>
              <p className="text-muted">or use Local Device button above</p>
              <p className="text-muted small">JPG, PNG, GIF up to 5MB</p>
            </>
          )}
        </div>

        <div className="photo-modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            disabled={!selectedFile}
            onClick={() => onSave(selectedFile)}
          >
            Save & Apply Photo
          </button>
        </div>
      </div>
    </div>
  );
}