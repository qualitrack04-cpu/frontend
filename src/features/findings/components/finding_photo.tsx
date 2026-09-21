import { useEffect, useState } from 'react';
import { fetchFileBlob } from '../api/findings_api';
import PhotoLightbox from './photo_lightbox';

interface Props {
  fileId: string;
  alt: string;
}

// Thumbnail kecil; klik untuk membuka preview besar.
// <img src="/api/Upload/file/..."> tidak mengirim header Authorization,
// jadi file diambil sebagai blob lewat axios_instance lalu dipakai sebagai object URL.
export default function FindingPhotoView({ fileId, alt }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setSrc(null);
    setFailed(false);

    fetchFileBlob(fileId)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch((err) => {
        if (!active) return;
        console.error(`[findings] gagal memuat foto ${fileId}`, err);
        setFailed(true);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  if (failed) {
    return <div className="fd-thumb fd-thumb--empty">Gagal memuat</div>;
  }
  if (!src) {
    return <div className="fd-thumb fd-thumb--loading" aria-busy="true" />;
  }

  return (
    <>
      <div className="fd-thumb">
        <button
          type="button"
          className="fd-thumb-open"
          aria-label={`Preview ${alt}`}
          onClick={() => setOpen(true)}
        >
          <img
            src={src}
            alt={alt}
            onError={() => {
              console.error(`[findings] foto ${fileId} tidak bisa dirender sebagai gambar`);
              setFailed(true);
            }}
          />
        </button>
      </div>
      {open && <PhotoLightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}