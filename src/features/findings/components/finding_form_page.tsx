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
      <div className="max-w-full m-0 text-left">
        <p className="text-slate-500">Memuat temuan...</p>
      </div>
    );
  }
  if (isEdit && finding.error) {
    return (
      <div className="max-w-full m-0 text-left">
        <Link to="/findings" className="inline-flex items-center gap-[8px] text-[#64748b] text-[14px] font-semibold no-underline mb-[24px] transition-colors duration-200 hover:text-[#0f2c52]">
          <ArrowLeft size={18} /> Back to Finding
        </Link>
        <p className="text-red-600">{finding.error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-full m-0 text-left">
      <Link to="/findings" className="inline-flex items-center gap-[8px] text-[#64748b] text-[14px] font-semibold no-underline mb-[24px] transition-colors duration-200 hover:text-[#0f2c52]">
        <ArrowLeft size={18} /> Back to Finding
      </Link>
      <h1 className="text-[3rem] font-bold text-[#0f2c52] m-0 mb-[8px] tracking-[-0.5px] leading-[1.25]">{isEdit ? 'Edit Finding' : 'New Finding'}</h1>
      <p className="text-slate-500 mt-[-6px] mb-[24px] text-[13px]">Record details of a non-conformance.</p>

      <form className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-[32px] items-start" onSubmit={handleSubmit} noValidate>
        {/* ---------- Kolom kiri ---------- */}
        <div className="flex flex-col gap-[24px]">
          <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px] flex flex-col">
            <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]" htmlFor="fd-title">
              Title
            </label>
            <input
              id="fd-title"
              className="w-full p-[14px_16px] border border-[#e2e8f0] rounded-[8px] font-inherit text-[14.5px] text-[#1e293b] bg-[#f8fafc] transition-all duration-200 appearance-none focus:outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] focus:bg-white aria-[invalid=true]:border-[#ef4444] aria-[invalid=true]:bg-[#fef2f2]"
              placeholder="Enter the finding title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={submitted && !!errors.title}
            />
            {submitted && errors.title && <p className="text-[#dc2626] text-[12.5px] m-[6px_0_0_0]">{errors.title}</p>}
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
            <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px] flex flex-col">
              <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]" htmlFor="fd-category">
                Category
              </label>
              <select
                id="fd-category"
                className="w-full p-[14px_16px] border border-[#e2e8f0] rounded-[8px] font-inherit text-[14.5px] text-[#1e293b] bg-[#f8fafc] transition-all duration-200 appearance-none focus:outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] focus:bg-white aria-[invalid=true]:border-[#ef4444] aria-[invalid=true]:bg-[#fef2f2]"
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
              {submitted && errors.category && <p className="text-[#dc2626] text-[12.5px] m-[6px_0_0_0]">{errors.category}</p>}
            </section>

            <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px] flex flex-col">
              <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]" htmlFor="fd-department">
                Department
              </label>
              <select
                id="fd-department"
                className="w-full p-[14px_16px] border border-[#e2e8f0] rounded-[8px] font-inherit text-[14.5px] text-[#1e293b] bg-[#f8fafc] transition-all duration-200 appearance-none focus:outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] focus:bg-white"
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

          <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px] flex flex-col">
            <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]" htmlFor="fd-description">
              Description
            </label>
            <textarea
              id="fd-description"
              className="w-full p-[14px_16px] border border-[#e2e8f0] rounded-[8px] font-inherit text-[14.5px] text-[#1e293b] bg-[#f8fafc] transition-all duration-200 appearance-none focus:outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] focus:bg-white aria-[invalid=true]:border-[#ef4444] aria-[invalid=true]:bg-[#fef2f2] resize-y"
              placeholder="Provide detailed context..."
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-invalid={submitted && !!errors.description}
            />
            {submitted && errors.description && (
              <p className="text-[#dc2626] text-[12.5px] m-[6px_0_0_0]">{errors.description}</p>
            )}
          </section>

          <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px] flex flex-col">
            <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]" htmlFor="fd-clause">
              Clause Reference <span className="normal-case font-normal text-[#94a3b8] tracking-normal ml-[4px]">(optional)</span>
            </label>
            <input
              id="fd-clause"
              className="w-full p-[14px_16px] border border-[#e2e8f0] rounded-[8px] font-inherit text-[14.5px] text-[#1e293b] bg-[#f8fafc] transition-all duration-200 appearance-none focus:outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] focus:bg-white"
              placeholder="e.g. ISO 9001:2015 Clause 7.1.5.2"
              value={clauseRef}
              onChange={(e) => setClauseRef(e.target.value)}
            />
          </section>

          <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px] flex flex-col">
            <div className="flex justify-between items-center mb-[24px]">
              <span className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-0">Evidence</span>
              <span className="bg-[#f1f5f9] text-[#475569] p-[4px_12px] rounded-[16px] text-[13px] font-semibold">
                {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
              </span>
            </div>

            {(photoCount > 0 || photos.error) && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[16px] mb-[24px]">
                {isEdit
                  ? photos.data?.map((photo) => (
                    <FindingPhotoView
                      key={photo.id}
                      url={photo.url}
                      alt={photo.fileName ?? 'Evidence photo'}
                    />
                  ))
                  : previews.map((p, i) => (
                    <div key={p.url} className="relative w-full aspect-[4/3] rounded-[8px] overflow-hidden bg-[#f1f5f9]">
                      <button
                        type="button"
                        className="w-full h-full p-0 border-none bg-none cursor-pointer block"
                        aria-label={`Preview ${p.file.name}`}
                        onClick={() => setLightbox({ src: p.url, alt: p.file.name })}
                      >
                        <img src={p.url} alt={p.file.name} className="w-full h-full object-cover" />
                      </button>
                      <button
                        type="button"
                        className="absolute top-[8px] right-[8px] w-[28px] h-[28px] bg-[rgba(0,0,0,0.6)] text-white border-none rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-[#dc2626]"
                        aria-label={`Hapus ${p.file.name}`}
                        onClick={() => setPending((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            <button type="button" className="w-full h-[120px] bg-[#f8fafc] border-[2px] border-dashed border-[#cbd5e1] rounded-[12px] flex flex-col items-center justify-center gap-[12px] text-[#64748b] font-semibold text-[14px] cursor-pointer transition-all duration-200 hover:bg-[#f1f5f9] hover:border-[#94a3b8] hover:text-[#0f2c52]" onClick={() => setModalOpen(true)}>
              <ImagePlus size={26} />
              <span>Add evidence photo</span>
            </button>
          </section>
        </div>

        {/* ---------- Kolom kanan ---------- */}
        <aside className="sticky top-[24px] flex flex-col gap-[24px]">
          <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px] flex flex-col">
            <span className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]">Reporter</span>
            <div className="relative flex items-center">
              <input
                className="w-full p-[14px_16px] border border-[#e2e8f0] rounded-[8px] font-inherit text-[14.5px] text-[#1e293b] bg-[#f8fafc] transition-all duration-200 appearance-none focus:outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] focus:bg-white pr-[40px] !bg-[#f1f5f9] !text-[#64748b] pointer-events-none"
                value={reporterName}
                readOnly
                aria-label="Reporter"
              />
              <Lock size={16} className="absolute right-[14px] text-[#94a3b8]" />
            </div>
          </section>

          {!isEdit && (
            <section className="bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-[12px] p-[24px]">
              <h2 className="flex items-center gap-[8px] text-[14px] text-[#0f2c52] m-0 mb-[16px] uppercase tracking-[0.5px] font-bold">
                <Info size={22} /> Severity Guidelines
              </h2>
              <p className="text-[13.5px] text-[#475569] leading-[1.5] m-0 mb-[12px] last:mb-0">
                <strong className="text-[#1e293b] font-bold">Minor NC:</strong> Isolated nonconformity with limited impact, easily
                correctable, and not indicating a systemic failure.
              </p>
              <p className="text-[13.5px] text-[#475569] leading-[1.5] m-0 mb-[12px] last:mb-0">
                <strong className="text-[#1e293b] font-bold">Major NC:</strong> Systemic or significant nonconformity that may affect
                product quality, safety, compliance, or system effectiveness.
              </p>
              <p className="text-[13.5px] text-[#475569] leading-[1.5] m-0 mb-[12px] last:mb-0">
                <strong className="text-[#1e293b] font-bold">OFI:</strong> Opportunity to improve effectiveness, efficiency,
                consistency, or best practices; no requirement is currently violated.
              </p>
            </section>
          )}

          {submitError && <p className="text-[#dc2626] text-[12.5px] m-[6px_0_0_0]">{submitError}</p>}

          <button type="submit" className="bg-[#0f2c52] text-white border-none p-[16px_24px] rounded-[8px] text-[15px] font-bold cursor-pointer inline-flex items-center justify-center gap-[12px] transition-all duration-200 shadow-[0_4px_12px_rgba(15,44,82,0.1)] hover:bg-[#0c2444] hover:-translate-y-[1px] hover:shadow-[0_6px_16px_rgba(15,44,82,0.15)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none w-full" disabled={submitting}>
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