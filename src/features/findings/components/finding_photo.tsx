import { useState } from 'react';
import PhotoLightbox from './photo_lightbox';
import { fileUrl } from '../../../shared/utils/file_url';

interface Props {
  url: string;
  alt: string;
}

// Thumbnail kecil; klik untuk membuka preview besar.
// Backend (UploadController.GetFindingFiles) sudah mengirim `url` langsung
// ke file yang di-serve publik lewat static files middleware, jadi cukup
// dipakai langsung sebagai <img src> (digabung base URL API lewat fileUrl()).
export default function FindingPhotoView({ url, alt }: Props) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const src = fileUrl(url);

  if (failed || !src) {
    return <div className="relative w-full aspect-[4/3] rounded-[8px] overflow-hidden bg-[#f1f5f9] flex items-center justify-center text-[13px] text-[#94a3b8] italic">Gagal memuat</div>;
  }

  return (
    <>
      <div className="relative w-full aspect-[4/3] rounded-[8px] overflow-hidden bg-[#f1f5f9]">
        <button
          type="button"
          className="w-full h-full p-0 border-none bg-none cursor-pointer block"
          aria-label={`Preview ${alt}`}
          onClick={() => setOpen(true)}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => {
              console.error(`[findings] foto ${url} gagal dimuat`);
              setFailed(true);
            }}
          />
        </button>
      </div>
      {open && <PhotoLightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}
