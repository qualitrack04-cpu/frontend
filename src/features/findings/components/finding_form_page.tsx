import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ImagePlus, Info, Lock, Trash2 } from 'lucide-react';
import { useFetch } from '../../../shared/hooks/use_fetch';
import {
  categoryOptions,
  createFinding,
  departmentOptions,
  getFinding,
  getFindingPhotos,
  updateFinding,
  uploadFindingPhoto,
  type Finding,
  type FindingCategory,
  type FindingPhoto,
} from '../api/findings_api';
import FindingPhotoView from './finding_photo';
import PhotoLightbox from './photo_lightbox';
import UploadPhotoModal from './upload_photo_modal';
import '../findings.css';

interface Props {
  mode: 'create' | 'edit';
}

export default function FindingFormPage({ mode }: Props) {
  const isEdit = mode === 'edit';
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Temuan berasal dari sesi audit; id diteruskan lewat URL:
  // /findings/new?sessionId=...&checklistItemId=...
  const sessionId = searchParams.get('sessionId') ?? undefined;
  const checklistItemId = searchParams.get('checklistItemId') ?? undefined;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FindingCategory | ''>('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [clauseRef, setClauseRef] = useState('');
  const [pending, setPending] = useState<File[]>([]); // foto yang menunggu (mode create)
  const [photosVersion, setPhotosVersion] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  // ---- Data untuk mode edit ----
  const finding = useFetch<Finding | null>(
    () => (isEdit && id ? getFinding(id) : Promise.resolve(null)),
    [isEdit, id]
  );
  const photos = useFetch<FindingPhoto[]>(
    () => (isEdit && id ? getFindingPhotos(id) : Promise.resolve([])),
    [isEdit, id, photosVersion]
  );
  const loaded = finding.data;

  useEffect(() => {
    if (!loaded) return;
    setTitle(loaded.title);
    setCategory(loaded.category);
    setDepartment(loaded.department ?? '');
    setDescription(loaded.description ?? '');
    setClauseRef(loaded.clauseRef ?? '');
  }, [loaded]);

  // Preview foto pending; URL dibersihkan saat daftar berubah / unmount
  const previews = useMemo(
    () => pending.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [pending]
  );
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  // ---- Validasi (pesan mengikuti desain) ----
  const errors = {
    title: title.trim().length < 5 ? 'Required (Min. 5 characters)' : null,
    category: category === '' ? 'Required' : null,
    description: description.trim().length < 10 ? 'Required (Min. 10 characters)' : null,
  };
  const hasError = Object.values(errors).some(Boolean);

  const reporterName = isEdit
    ? (loaded?.reporterName ?? '')
    : (localStorage.getItem('fullName') ?? '');

  const deptOptions =
    department && !departmentOptions.includes(department)
      ? [department, ...departmentOptions]
      : departmentOptions;

  const photoCount = isEdit ? (photos.data?.length ?? 0) : pending.length;

  // Dipanggil modal saat tombol Upload ditekan
  const handleModalUpload = async (file: File) => {
    if (isEdit && id) {
      await uploadFindingPhoto(id, file);
      setPhotosVersion((v) => v + 1);
    } else {
      setPending((prev) => [...prev, file]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSubmitError(null);
    if (hasError || category === '') return;

    setSubmitting(true);
    try {
      if (isEdit && id) {
        // PUT menimpa seluruh field, jadi nilai lama yang tidak ada di form dikirim ulang
        await updateFinding(id, {
          title: title.trim(),
          category,
          department: department || null,
          description: description.trim(),
          clauseRef: clauseRef.trim() || null,
          reporterName: loaded?.reporterName ?? null,
          reporterId: loaded?.reporterId ?? null,
        });
        navigate('/findings');
        return;
      }

      const created = await createFinding({
        title: title.trim(),
        category,
        description: description.trim(),
        department: department || undefined,
        clauseRef: clauseRef.trim() || undefined,
        sessionId,
        checklistItemId,
        reporterName: reporterName || undefined,
      });

      const failed: string[] = [];
      for (const photo of pending) {
        try {
          await uploadFindingPhoto(created.id, photo);
        } catch {
          failed.push(photo.name);
        }
      }

      if (failed.length > 0) {
        // Temuan sudah tersimpan; jangan submit ulang agar tidak duplikat
        setSubmitError(
          `Temuan tersimpan, tetapi ${failed.length} foto gagal diunggah (${failed.join(', ')}). ` +
          'Tambahkan lagi lewat halaman Edit.'
        );
        setTimeout(() => navigate('/findings'), 3500);
        return;
      }
      navigate('/findings');
    } catch (err: any) {
      setSubmitError(err.response?.data?.message ?? 'Gagal menyimpan temuan.');
      setSubmitting(false);
    }
  };

  if (isEdit && finding.loading) {
    return (
      <div className="page-container fd-page">
        <p className="text-muted">Memuat temuan...</p>
      </div>
    );
  }
  if (isEdit && finding.error) {
    return (
      <div className="page-container fd-page">
        <Link to="/findings" className="fd-back">
          <ArrowLeft size={18} /> Back to Finding
        </Link>
        <p className="error-text">{finding.error}</p>
      </div>
    );
  }

  return (
    <div className="page-container fd-page">
      <Link to="/findings" className="fd-back">
        <ArrowLeft size={18} /> Back to Finding
      </Link>
      <h1 className="fd-title fd-title--form">{isEdit ? 'Edit Finding' : 'New Finding'}</h1>
      <p className="fd-subtitle">Record details of a non-conformance.</p>

      <form className="fd-form-grid" onSubmit={handleSubmit} noValidate>
        {/* ---------- Kolom kiri ---------- */}
        <div className="fd-form-main">
          <section className="fd-panel">
            <label className="fd-label" htmlFor="fd-title">
              Title
            </label>
            <input
              id="fd-title"
              className="fd-input"
              placeholder="Enter the finding title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={submitted && !!errors.title}
            />
            {submitted && errors.title && <p className="fd-error">{errors.title}</p>}
          </section>

          <div className="fd-row">
            <section className="fd-panel">
              <label className="fd-label" htmlFor="fd-category">
                Category
              </label>
              <select
                id="fd-category"
                className="fd-input"
                value={category}
                onChange={(e) => setCategory(e.target.value as FindingCategory | '')}
                aria-invalid={submitted && !!errors.category}
              >
                <option value="">Select Category...</option>
                {categoryOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {submitted && errors.category && <p className="fd-error">{errors.category}</p>}
            </section>

            <section className="fd-panel">
              <label className="fd-label" htmlFor="fd-department">
                Department
              </label>
              <select
                id="fd-department"
                className="fd-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select Department...</option>
                {deptOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </section>
          </div>

          <section className="fd-panel">
            <label className="fd-label" htmlFor="fd-description">
              Description
            </label>
            <textarea
              id="fd-description"
              className="fd-input fd-textarea"
              placeholder="Provide detailed context..."
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-invalid={submitted && !!errors.description}
            />
            {submitted && errors.description && (
              <p className="fd-error">{errors.description}</p>
            )}
          </section>

          <section className="fd-panel">
            <label className="fd-label" htmlFor="fd-clause">
              Clause Reference <span className="fd-optional">(optional)</span>
            </label>
            <input
              id="fd-clause"
              className="fd-input"
              placeholder="e.g. ISO 9001:2015 Clause 7.1.5.2"
              value={clauseRef}
              onChange={(e) => setClauseRef(e.target.value)}
            />
          </section>

          <section className="fd-panel">
            <div className="fd-panel-head">
              <span className="fd-label fd-label--flat">Evidence</span>
              <span className="fd-chip">
                {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
              </span>
            </div>

            {(photoCount > 0 || photos.error) && (
              <div className="fd-photo-grid">
                {isEdit
                  ? photos.data?.map((photo) => (
                    <FindingPhotoView
                      key={photo.id}
                      url={photo.url}
                      alt={photo.fileName ?? 'Evidence photo'}
                    />
                  ))
                  : previews.map((p, i) => (
                    <div key={p.url} className="fd-thumb">
                      <button
                        type="button"
                        className="fd-thumb-open"
                        aria-label={`Preview ${p.file.name}`}
                        onClick={() => setLightbox({ src: p.url, alt: p.file.name })}
                      >
                        <img src={p.url} alt={p.file.name} />
                      </button>
                      <button
                        type="button"
                        className="fd-thumb-remove"
                        aria-label={`Hapus ${p.file.name}`}
                        onClick={() => setPending((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            <button type="button" className="fd-add-photo" onClick={() => setModalOpen(true)}>
              <ImagePlus size={26} />
              <span>Add evidence photo</span>
            </button>
          </section>
        </div>

        {/* ---------- Kolom kanan ---------- */}
        <aside className="fd-form-side">
          <section className="fd-panel">
            <span className="fd-label">Reporter</span>
            <div className="fd-locked">
              <input
                className="fd-input"
                value={reporterName}
                readOnly
                aria-label="Reporter"
              />
              <Lock size={16} />
            </div>
          </section>

          {!isEdit && (
            <section className="fd-guidelines">
              <h2>
                <Info size={22} /> Severity Guidelines
              </h2>
              <p>
                <strong>Minor NC:</strong> Isolated nonconformity with limited impact, easily
                correctable, and not indicating a systemic failure.
              </p>
              <p>
                <strong>Major NC:</strong> Systemic or significant nonconformity that may affect
                product quality, safety, compliance, or system effectiveness.
              </p>
              <p>
                <strong>OFI:</strong> Opportunity to improve effectiveness, efficiency,
                consistency, or best practices; no requirement is currently violated.
              </p>
            </section>
          )}

          {submitError && <p className="fd-error">{submitError}</p>}

          <button type="submit" className="fd-btn-primary fd-btn-block" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save Edit' : 'Submit Findings'}
            {!submitting && <ArrowRight size={20} />}
          </button>
        </aside>
      </form>

      {lightbox && (
        <PhotoLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}

      <UploadPhotoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={handleModalUpload}
      />
    </div>
  );
}