import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

// Klik di luar gambar, tombol X, atau tekan Escape untuk menutup.
export default function PhotoLightbox({ src, alt, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-[rgba(15,44,82,0.9)] backdrop-blur-[4px] z-[9999] flex flex-col items-center justify-center p-[24px] animate-[fadein_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${alt}`}
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-[24px] right-[24px] bg-[rgba(255,255,255,0.1)] text-white border-none w-[44px] h-[44px] rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-[rgba(255,255,255,0.2)]"
        aria-label="Close preview"
        onClick={onClose}
        autoFocus
      >
        <X size={22} />
      </button>
      <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} className="max-w-full max-h-[80vh] object-contain rounded-[8px] shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
      <p className="text-white m-[16px_0_0_0] text-[15px] font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{alt}</p>
    </div>
  );
}
