import { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Monitor,
  Camera,
  Link2,
  Cloud,
  Check,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { fileUrl } from '../../../shared/utils/file_url';

interface ChangePhotoModalProps {
  currentName: string;
  currentRole: string;
  currentPhotoUrl?: string | null;
  onClose: () => void;
  onSave: (file: File | null) => void;
}

export default function ChangePhotoModal({
  currentName,
  currentRole,
  currentPhotoUrl,
  onClose,
  onSave,
}: ChangePhotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gdrive' | 'local' | 'camera' | 'web'>('local');

  // Input states
  const [webUrlInput, setWebUrlInput] = useState('');
  const [gdriveInput, setGdriveInput] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Camera states
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Stop camera when closing or switching tab
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle switching tabs
  const handleTabSwitch = (tab: 'gdrive' | 'local' | 'camera' | 'web') => {
    setMediaError(null);
    if (activeTab === 'camera' && tab !== 'camera') {
      stopCamera();
    }
    setActiveTab(tab);

    if (tab === 'camera') {
      startCamera();
    }
  };

  // 1. LOCAL DEVICE: File selection & Drop
  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMediaError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMediaError('Image size exceeds 5MB limit.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMediaError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };

  // 2. CAMERA: Start webcam & capture
  const startCamera = async () => {
    stopCamera();
    setMediaError(null);
    setCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setCameraActive(false);
      setMediaError('Unable to access camera. Please allow permissions or upload a file.');
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      handleFileSelect(file);
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  // 3. WEB URL: Load image from URL
  const handleLoadWebUrl = async () => {
    if (!webUrlInput.trim()) {
      setMediaError('Please enter an image URL.');
      return;
    }

    setLoadingMedia(true);
    setMediaError(null);

    try {
      const response = await fetch(webUrlInput.trim());
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL does not point to a valid image');
      }

      const file = new File([blob], `web-photo-${Date.now()}.jpg`, { type: blob.type });
      handleFileSelect(file);
      setWebUrlInput('');
    } catch {
      // Fallback: load into HTML Image element and draw to canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 400;
        canvas.height = img.naturalHeight || 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `web-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
              handleFileSelect(file);
              setWebUrlInput('');
              setLoadingMedia(false);
            }
          }, 'image/jpeg', 0.92);
        }
      };
      img.onerror = () => {
        setMediaError('Failed to load image from this URL. Please verify the URL or save and upload directly.');
        setLoadingMedia(false);
      };
      img.src = webUrlInput.trim();
    } finally {
      setLoadingMedia(false);
    }
  };

  // 4. GOOGLE DRIVE: Parse share link ID & load image
  const handleLoadGdrive = async (linkToUse?: string) => {
    const rawLink = linkToUse || gdriveInput.trim();
    if (!rawLink) {
      setMediaError('Please enter a Google Drive link.');
      return;
    }

    setLoadingMedia(true);
    setMediaError(null);

    // Extract Google Drive File ID from URL
    // Examples: https://drive.google.com/file/d/1A2B3C.../view?usp=sharing
    // or https://drive.google.com/open?id=1A2B3C...
    const match = rawLink.match(/\/d\/([a-zA-Z0-9_-]+)/) || rawLink.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fileId = match ? match[1] : rawLink.trim();

    // High quality direct thumbnail link for Google Drive
    const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

    try {
      const response = await fetch(directUrl);
      if (!response.ok) throw new Error('Failed to load Drive file');
      const blob = await response.blob();
      const file = new File([blob], `drive-photo-${fileId}.jpg`, { type: blob.type || 'image/jpeg' });
      handleFileSelect(file);
      setGdriveInput('');
    } catch {
      // Direct load through image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 400;
        canvas.height = img.naturalHeight || 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `drive-photo-${fileId}.jpg`, { type: 'image/jpeg' });
              handleFileSelect(file);
              setGdriveInput('');
              setLoadingMedia(false);
            }
          }, 'image/jpeg', 0.92);
        }
      };
      img.onerror = () => {
        setMediaError('Could not fetch file from Google Drive. Ensure the file sharing is set to "Anyone with the link can view".');
        setLoadingMedia(false);
      };
      img.src = directUrl;
    } finally {
      setLoadingMedia(false);
    }
  };

  // Quick Preset Avatars
  const sampleAvatars = [
    { label: 'Auditor 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
    { label: 'Auditor 2', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80' },
    { label: 'Manager 1', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80' },
    { label: 'Manager 2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  ];

  const handleApplyPreset = async (url: string) => {
    setLoadingMedia(true);
    setMediaError(null);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'preset-avatar.jpg', { type: blob.type || 'image/jpeg' });
      handleFileSelect(file);
    } catch {
      setMediaError('Failed to load avatar preset.');
    } finally {
      setLoadingMedia(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-xs p-3 sm:p-6 flex min-h-full items-center justify-center animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[540px] my-auto overflow-hidden flex flex-col max-h-[92vh] relative animate-[scaleIn_0.15s_ease-out]">
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <h3 className="text-[17px] sm:text-[18px] font-bold text-[#0F294A] m-0">
            Change Profile Picture
          </h3>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors bg-transparent border-none cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Current User Identity Bar */}
          <div className="flex items-center gap-3.5 p-3.5 bg-[#F8FAFC] border border-slate-200/80 rounded-xl">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="New Preview"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#16A34A] shadow-xs shrink-0"
              />
            ) : currentPhotoUrl ? (
              <img
                src={fileUrl(currentPhotoUrl)}
                alt={currentName}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#E2EDF8] text-[#1E40AF] flex items-center justify-center font-bold text-[18px] shrink-0">
                {currentName.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-[15px] font-bold text-[#0F294A] m-0 leading-snug truncate">
                {currentName}
              </h4>
              <p className="text-[12.5px] text-slate-500 m-0 font-medium truncate">
                {currentRole}
              </p>
            </div>
            {previewUrl && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                New Photo Ready
              </span>
            )}
          </div>

          {/* Error Banner */}
          {mediaError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 border border-red-100">
              <AlertCircle size={15} className="shrink-0" />
              <span>{mediaError}</span>
            </div>
          )}

          {/* 4 Source Option Buttons (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {/* 1. Google Drive */}
            <button
              type="button"
              onClick={() => handleTabSwitch('gdrive')}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer bg-white text-center ${
                activeTab === 'gdrive'
                  ? 'border-[#16A34A] text-[#16A34A] bg-[#F0FDF4]/50 shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Cloud size={17} className={activeTab === 'gdrive' ? 'text-[#16A34A]' : 'text-slate-600'} />
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-[#16A34A] text-white px-1.5 py-0.5 rounded-full">
                  <Check size={9} strokeWidth={3} /> Connected
                </span>
              </div>
              <span className="text-[12.5px] font-semibold">Google Drive</span>
            </button>

            {/* 2. Local Device */}
            <button
              type="button"
              onClick={() => {
                handleTabSwitch('local');
                fileInputRef.current?.click();
              }}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer bg-white text-center ${
                activeTab === 'local'
                  ? 'border-[#2563EB] text-[#2563EB] bg-[#EFF6FF] shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <Monitor size={17} className={activeTab === 'local' ? 'text-[#2563EB]' : 'text-slate-600'} />
              <span className="text-[12.5px] font-semibold">Local Device</span>
            </button>

            {/* 3. Take Photo */}
            <button
              type="button"
              onClick={() => handleTabSwitch('camera')}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer bg-white text-center ${
                activeTab === 'camera'
                  ? 'border-[#2563EB] text-[#2563EB] bg-[#EFF6FF] shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <Camera size={17} className={activeTab === 'camera' ? 'text-[#2563EB]' : 'text-slate-600'} />
              <span className="text-[12.5px] font-semibold">Take Photo</span>
            </button>

            {/* 4. Web URL */}
            <button
              type="button"
              onClick={() => handleTabSwitch('web')}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer bg-white text-center ${
                activeTab === 'web'
                  ? 'border-[#2563EB] text-[#2563EB] bg-[#EFF6FF] shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <Link2 size={17} className={activeTab === 'web' ? 'text-[#2563EB]' : 'text-slate-600'} />
              <span className="text-[12.5px] font-semibold">Web URL</span>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            hidden
            onChange={handleInputChange}
          />

          {/* Active Tab Panel */}

          {/* TAB 1: GOOGLE DRIVE */}
          {activeTab === 'gdrive' && (
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Paste Google Drive File Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={gdriveInput}
                    onChange={(e) => setGdriveInput(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view"
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-800 outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleLoadGdrive()}
                    disabled={loadingMedia || !gdriveInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-semibold text-[13px] border-none cursor-pointer disabled:opacity-50 transition-colors shrink-0"
                  >
                    {loadingMedia ? <RefreshCw size={14} className="animate-spin" /> : 'Import'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 m-0 mt-1.5">
                  Make sure the file sharing permission is set to "Anyone with the link".
                </p>
              </div>

              {/* Quick Preset Gallery */}
              <div className="pt-3 border-t border-slate-200/80">
                <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-600 mb-2">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Or Pick a Cloud Avatar Preset</span>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {sampleAvatars.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(avatar.url)}
                      className="group relative rounded-xl overflow-hidden border-2 border-slate-200 hover:border-[#16A34A] transition-all p-0 cursor-pointer bg-white aspect-square"
                    >
                      <img
                        src={avatar.url}
                        alt={avatar.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] py-0.5 text-center font-semibold">
                        {avatar.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOCAL DEVICE (Dropzone) */}
          {activeTab === 'local' && (
            <div
              className="flex flex-col items-center justify-center min-h-[160px] bg-[#EEF2F6]/70 border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center cursor-pointer transition-colors hover:bg-[#EEF2F6]"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="w-12 h-12 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center shadow-sm mb-2.5">
                <UploadCloud size={24} />
              </div>
              <strong className="text-[14px] font-bold text-slate-800">
                Drag &amp; drop image here
              </strong>
              <p className="text-[12px] text-slate-500 m-0 mt-1">
                or click to browse from your device
              </p>
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mt-2.5">
                JPG, PNG, WebP up to 5MB
              </span>
            </div>
          )}

          {/* TAB 3: CAMERA (Webcam feed & capture) */}
          {activeTab === 'camera' && (
            <div className="bg-slate-900 rounded-2xl overflow-hidden p-3 flex flex-col items-center text-center">
              <div className="relative w-full max-w-[380px] aspect-[4/3] bg-black rounded-xl overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <Camera size={32} className="text-slate-400 mb-2" />
                    <p className="text-[13px] text-slate-300">Camera preview not active</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="mt-2 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-[12px] font-semibold border-none cursor-pointer"
                    >
                      Start Camera
                    </button>
                  </div>
                )}
              </div>

              {cameraActive && (
                <div className="flex items-center justify-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={captureCameraPhoto}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-semibold text-[13px] border-none cursor-pointer shadow-md transition-colors"
                  >
                    <Camera size={16} />
                    <span>Capture Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-[13px] border-none cursor-pointer transition-colors"
                  >
                    Turn Off
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WEB URL */}
          {activeTab === 'web' && (
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider">
                Enter Web Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webUrlInput}
                  onChange={(e) => setWebUrlInput(e.target.value)}
                  placeholder="https://example.com/profile-picture.jpg"
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-[13px] text-slate-800 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
                />
                <button
                  type="button"
                  onClick={handleLoadWebUrl}
                  disabled={loadingMedia || !webUrlInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-[13px] border-none cursor-pointer disabled:opacity-50 transition-colors shrink-0"
                >
                  {loadingMedia ? <RefreshCw size={14} className="animate-spin" /> : 'Load Image'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 m-0">
                You can paste direct image links from Unsplash, LinkedIn, or any public image URL.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 bg-slate-50/70">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-[13.5px] transition-colors bg-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedFile}
            onClick={() => {
              stopCamera();
              onSave(selectedFile);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#0F294A] hover:bg-[#0B1E38] text-white font-semibold text-[13.5px] transition-colors shadow-sm border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save &amp; Apply Photo
          </button>
        </div>
      </div>
    </div>
  );
}