import { useState, useRef } from 'react';
import { X, UploadCloud, HardDrive, Camera, Link2, Cloud } from 'lucide-react';
import { fileUrl } from '../../../shared/utils/file_url';

interface ChangePhotoModalProps {
  currentName: string;
  currentRole: string;
  currentPhotoUrl?: string | null;
  onClose: () => void;
  onSave: (file: File | null) => void;
}

export default function ChangePhotoModal({ currentName, currentRole, currentPhotoUrl, onClose, onSave }: ChangePhotoModalProps) {
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

  const handleWebUrl = async () => {
    const url = prompt('Masukkan URL gambar:');
    if (url) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], "profile_picture.jpg", { type: blob.type });
        handleFileSelect(file);
      } catch (e) {
        alert('Gagal mengambil gambar dari URL tersebut. Pastikan URL valid dan mengizinkan akses (CORS).');
      }
    }
  };

  const handleGDrive = () => {
    alert('Integrasi Google Drive membutuhkan konfigurasi API Keys. Fitur ini akan segera hadir.');
  };

  const handleCamera = () => {
    alert('Akses kamera membutuhkan HTTPS dan izin browser. Fitur ini akan diaktifkan di tahap produksi.');
  };

  return (
    <div className="fixed inset-0 bg-[rgba(15,44,82,0.4)] backdrop-blur-[2px] z-[9000] flex items-end sm:items-center justify-center animate-[fadein_0.2s_ease-out]">
      <div className="bg-white w-full max-w-[400px] rounded-t-[20px] sm:rounded-[16px] p-[24px] flex flex-col animate-[slideup_0.2s_ease-out]">
        <div className="flex justify-between items-center mb-[20px]">
          <h3 className="text-[16px] font-bold text-[#0f2c52] m-0">Change Profile Picture</h3>
          <button className="bg-transparent border-none text-[#64748b] cursor-pointer p-0 flex hover:text-[#0f2c52]" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-[12px] p-[16px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] mb-[24px]">
          {currentPhotoUrl ? (
            <img src={fileUrl(currentPhotoUrl)} alt={currentName} className="w-[50px] h-[50px] rounded-full object-cover" />
          ) : (
            <div className="w-[50px] h-[50px] rounded-full bg-[#cbd5e1] text-[#475569] flex items-center justify-center font-bold text-[20px]">{currentName.charAt(0)}</div>
          )}
          <div>
            <strong className="text-[15px] text-[#0f2c52] block">{currentName}</strong>
            <p className="text-[13px] text-[#64748b] m-0 mt-[2px]">{currentRole}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-[12px] mb-[24px]">
          <button onClick={handleGDrive} className="flex flex-col items-center gap-[6px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] p-[12px] rounded-[10px] text-[13px] font-semibold text-[#64748b] cursor-pointer transition-colors duration-200 hover:bg-[#f1f5f9] hover:border-[#94a3b8] hover:text-[#0f2c52]">
            <Cloud size={16} />
            <span>Google Drive</span>
          </button>
          <label className="flex flex-col items-center gap-[6px] bg-[#eef1fb] border-[1.5px] border-[#1e6fd9] p-[12px] rounded-[10px] text-[13px] font-semibold text-[#1e6fd9] cursor-pointer transition-colors duration-200">
            <HardDrive size={16} />
            <span>Local Device</span>
            <input type="file" accept="image/*" hidden onChange={handleInputChange} />
          </label>
          <button onClick={handleCamera} className="flex flex-col items-center gap-[6px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] p-[12px] rounded-[10px] text-[13px] font-semibold text-[#64748b] cursor-pointer transition-colors duration-200 hover:bg-[#f1f5f9] hover:border-[#94a3b8] hover:text-[#0f2c52]">
            <Camera size={16} />
            <span>Take Photo</span>
          </button>
          <button onClick={handleWebUrl} className="flex flex-col items-center gap-[6px] bg-[#f8fafc] border-[1.5px] border-[#e2e8f0] p-[12px] rounded-[10px] text-[13px] font-semibold text-[#64748b] cursor-pointer transition-colors duration-200 hover:bg-[#f1f5f9] hover:border-[#94a3b8] hover:text-[#0f2c52]">
            <Link2 size={16} />
            <span>Web URL</span>
          </button>
        </div>

        <div
          className="flex flex-col items-center justify-center gap-[8px] min-h-[160px] bg-[#f8fafc] border-[2px] border-dashed border-[#cbd5e1] rounded-[12px] p-[20px] text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="max-w-[120px] max-h-[120px] object-cover rounded-[8px] shadow-sm border border-[#e2e8f0]" />
          ) : (
            <>
              <div className="w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,44,82,0.05)] text-[#64748b] mb-[4px]">
                <UploadCloud size={26} />
              </div>
              <strong className="text-[14px] text-[#475569]">Drag &amp; drop image here</strong>
              <p className="text-[13px] text-[#94a3b8] m-0">or use Local Device button above</p>
              <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.5px] m-0 mt-[4px]">JPG, PNG, GIF up to 5MB</p>
            </>
          )}
        </div>

        <div className="flex gap-[12px] mt-[24px]">
          <button className="flex-1 bg-transparent text-[#64748b] border-none p-[12px] rounded-[8px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#f1f5f9]" onClick={onClose}>Cancel</button>
          <button
            className="flex-[2] bg-[#0f2c52] text-white border-none p-[12px] rounded-[8px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#0c2444] hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            disabled={!selectedFile}
            onClick={() => onSave(selectedFile)}
          >
            Save &amp; Apply Photo
          </button>
        </div>
      </div>
    </div>
  );
}