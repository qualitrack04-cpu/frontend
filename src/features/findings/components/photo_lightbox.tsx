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
      className="fd-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${alt}`}
      onClick={onClose}
    >
      <button
        type="button"
        className="fd-lightbox-close"
        aria-label="Close preview"
        onClick={onClose}
        autoFocus
      >
        <X size={22} />
      </button>
      <img src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
      <p className="fd-lightbox-caption">{alt}</p>
    </div>
  );
}
