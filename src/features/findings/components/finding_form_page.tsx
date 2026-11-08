import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ImagePlus, Info, Lock, Trash2 } from 'lucide-react';
import { useFetch } from '../../../shared/hooks/use_fetch';
import {
  createFinding,
  getFinding,
  getFindingPhotos,
  updateFinding,
  uploadFindingPhoto,
  type Finding,
  type FindingPhoto,
} from '../api/findings_api';
import { getFindingCategories } from '../../system_configuration/api/system_config_api';
import { getDepartments } from '../../departments/api/departments_api';
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
  const [categoryId, setCategoryId] = useState('');
  const [category, setCategory] = useState('');
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

  // State untuk custom dropdown
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const [deptOpen, setDeptOpen] = useState(false);
  const deptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setDeptOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCategoryOpen(false);
        setDeptOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // ---- Kategori & Department dinamis ----
  const categoriesFetch = useFetch(getFindingCategories);
  const activeCategories = useMemo(
    () => (categoriesFetch.data || []).filter((c) => c.isActive !== false),
    [categoriesFetch.data]
  );
  const departmentsFetch = useFetch(getDepartments);

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
    const catName = (loaded as any).categoryName || loaded.category || '';
    setCategory(catName);

    if (loaded.categoryId) {
      setCategoryId(loaded.categoryId);
    } else if (activeCategories.length > 0) {
      const norm = (s: string) => s.toLowerCase().replace(/[\s_-]/g, '');
      const found = activeCategories.find((c) => norm(c.name) === norm(catName));
      if (found) {
        setCategoryId(found.id);
      }
    }
    setDepartment(loaded.department ?? '');
    setDescription(loaded.description ?? '');
    setClauseRef(loaded.clauseRef ?? '');
  }, [loaded, activeCategories]);

  // Preview foto pending; URL dibersihkan saat daftar berubah / unmount
  const previews = useMemo(
    () => pending.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [pending]
  );
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  // ---- Validasi (pesan mengikuti desain) ----
  const errors = {
    title: title.trim().length < 5 ? 'Required (Min. 5 characters)' : null,
    category: !categoryId && !category ? 'Required' : null,
    description: description.trim().length < 10 ? 'Required (Min. 10 characters)' : null,
  };
  const hasError = Object.values(errors).some(Boolean);

  const reporterName = isEdit
    ? (loaded?.reporterName ?? '')
    : (localStorage.getItem('fullName') ?? '');

  const deptOptions = useMemo(() => {
    const list = (departmentsFetch.data || [])
      .filter((d) => d.isActive !== false)
      .map((d) => d.name);
    if (department && !list.includes(department)) {
      return [department, ...list];
    }
    return list;
  }, [departmentsFetch.data, department]);

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
    if (hasError || (!categoryId && !category)) return;

    setSubmitting(true);
    try {
      if (isEdit && id) {
        // PUT menimpa seluruh field, jadi nilai lama yang tidak ada di form dikirim ulang
        await updateFinding(id, {
          title: title.trim(),
          category,
          categoryId: categoryId || undefined,
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
        categoryId: categoryId || undefined,
        description: description.trim(),
        department: department || undefined,
        clauseRef: clauseRef.trim() || undefined,
        sessionId,
        checklistItemId,
        reporterName: reporterName || undefined,
      });

      const findingId = created?.id || (created as any)?.Id;
      const failed: string[] = [];
      for (const photo of pending) {
        try {
          if (!findingId) throw new Error('Finding ID is missing');
          await uploadFindingPhoto(findingId, photo);
        } catch {
          failed.push(photo.name);
        }
      }

      if (failed.length > 0) {
        // Temuan sudah tersimpan; jangan submit ulang agar tidak duplikat
        setSubmitError(
          `Finding saved, but ${failed.length} photos failed to upload (${failed.join(', ')}). ` +
          'You can re-upload them on the Edit page.'
        );
        setTimeout(() => navigate('/findings'), 3500);
        return;
      }
      navigate('/findings');
    } catch (err: any) {
      setSubmitError(err.response?.data?.message ?? 'Failed to save finding.');
      setSubmitting(false);
    }
  };

  if (isEdit && finding.loading) {
    return (
      <div className="max-w-full m-0 text-left">
        <p className="text-slate-500">Loading finding...</p>
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
      <h1 className="text-2xl sm:text-[28px] font-bold text-[#0f2c52] !m-0 !mb-2">{isEdit ? 'Edit Finding' : 'New Finding'}</h1>
      <p className="text-slate-500 mt-0 mb-6 text-[13px]">Record details of a non-conformance.</p>

      <form className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-[32px] items-start" onSubmit={handleSubmit} noValidate>
        {/* ---------- Kolom kiri ---------- */}
        <div className="flex flex-col gap-6 sm:gap-[32px] min-w-0">
          <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-5 sm:p-7 md:p-[32px] flex flex-col">
            <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]" htmlFor="fd-title">
              Finding Title
            </label>
            <input
              id="fd-title"
              type="text"
              className="w-full p-[14px_16px] border border-[#e2e8f0] rounded-[8px] font-inherit text-[14.5px] text-[#1e293b] bg-[#f8fafc] transition-all duration-200 focus:outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] focus:bg-white aria-[invalid=true]:border-[#ef4444] aria-[invalid=true]:bg-[#fef2f2]"
              placeholder="e.g. Uncalibrated Pressure Gauge in Production Line A"
              value={title}
              maxLength={150}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={submitted && !!errors.title}
            />
            {submitted && errors.title && <p className="text-[#dc2626] text-[12.5px] m-[6px_0_0_0]">{errors.title}</p>}
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-[24px]">
            <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-5 sm:p-7 md:p-[32px] flex flex-col relative z-20">
              <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]" htmlFor="fd-category">
                Category
              </label>
              <div className="relative w-full" ref={categoryRef}>
                <button
                  id="fd-category"
                  type="button"
                  className={`w-full p-[14px_16px] border rounded-[8px] font-inherit text-[14.5px] bg-white transition-all duration-200 flex items-center justify-between text-left cursor-pointer focus:outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] ${
                    submitted && errors.category
                      ? 'border-[#ef4444] bg-[#fef2f2]'
                      : 'border-[#e2e8f0]'
                  }`}
                  onClick={() => {
                    setCategoryOpen(!categoryOpen);
                    setDeptOpen(false);
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={categoryOpen}
                >
                  <span
                    className={`truncate flex-1 mr-2 ${
                      category ? 'text-[#1e293b] font-medium' : 'text-[#94a3b8]'
                    }`}
                  >
                    {category || (categoriesFetch.loading ? 'Loading categories...' : 'Select Category...')}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-[#64748b] shrink-0 transition-transform duration-200 ${
                      categoryOpen ? 'rotate-180 text-[#0f2c52]' : ''
                    }`}
                  />
                </button>

                {categoryOpen && (
                  <div
                    className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0_12px_30px_rgba(15,44,82,0.12)] z-50 max-h-[260px] overflow-y-auto p-1.5"
                    role="listbox"
                  >
                    {activeCategories.length === 0 ? (
                      <div className="p-3 text-[13.5px] text-[#94a3b8] text-center">
                        No categories available
                      </div>
                    ) : (
                      activeCategories.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          className={`w-full text-left p-3 rounded-[6px] text-[14px] transition-all duration-150 flex items-start justify-between gap-2 cursor-pointer border-y-0 border-r-0 border-l-[3.5px] bg-white ${
                            categoryId === o.id
                              ? 'border-l-[#006AFF] text-[#006AFF] font-semibold'
                              : 'border-l-transparent text-[#334155] hover:border-l-[#006AFF] hover:text-[#006AFF]'
                          }`}
                          onClick={() => {
                            setCategoryId(o.id);
                            setCategory(o.name);
                            setCategoryOpen(false);
                          }}
                          role="option"
                          aria-selected={categoryId === o.id}
                        >
                          <span className="break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-normal flex-1">
                            {o.name}
                          </span>
                          {categoryId === o.id && (
                            <Check size={16} className="text-[#006AFF] shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {submitted && errors.category && <p className="text-[#dc2626] text-[12.5px] m-[6px_0_0_0]">{errors.category}</p>}
            </section>

            <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-5 sm:p-7 md:p-[32px] flex flex-col relative z-20">
              <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]" htmlFor="fd-department">
                Department
              </label>
              <div className="relative w-full" ref={deptRef}>
                <button
                  id="fd-department"
                  type="button"
                  className="w-full p-[14px_16px] border border-[#e2e8f0] rounded-[8px] font-inherit text-[14.5px] bg-white transition-all duration-200 flex items-center justify-between text-left cursor-pointer focus:outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)]"
                  onClick={() => {
                    setDeptOpen(!deptOpen);
                    setCategoryOpen(false);
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={deptOpen}
                >
                  <span
                    className={`truncate flex-1 mr-2 ${
                      department ? 'text-[#1e293b] font-medium' : 'text-[#94a3b8]'
                    }`}
                  >
                    {department || (departmentsFetch.loading ? 'Loading departments...' : 'Select Department...')}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-[#64748b] shrink-0 transition-transform duration-200 ${
                      deptOpen ? 'rotate-180 text-[#0f2c52]' : ''
                    }`}
                  />
                </button>

                {deptOpen && (
                  <div
                    className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0_12px_30px_rgba(15,44,82,0.12)] z-50 max-h-[260px] overflow-y-auto p-1.5"
                    role="listbox"
                  >
                    {deptOptions.length === 0 ? (
                      <div className="p-3 text-[13.5px] text-[#94a3b8] text-center">
                        No departments available
                      </div>
                    ) : (
                      deptOptions.map((d) => (
                        <button
                          key={d}
                          type="button"
                          className={`w-full text-left p-3 rounded-[6px] text-[14px] transition-all duration-150 flex items-start justify-between gap-2 cursor-pointer border-y-0 border-r-0 border-l-[3.5px] bg-white ${
                            department === d
                              ? 'border-l-[#006AFF] text-[#006AFF] font-semibold'
                              : 'border-l-transparent text-[#334155] hover:border-l-[#006AFF] hover:text-[#006AFF]'
                          }`}
                          onClick={() => {
                            setDepartment(d);
                            setDeptOpen(false);
                          }}
                          role="option"
                          aria-selected={department === d}
                        >
                          <span className="break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-normal flex-1">
                            {d}
                          </span>
                          {department === d && (
                            <Check size={16} className="text-[#006AFF] shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-5 sm:p-7 md:p-[32px] flex flex-col">
            <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]" htmlFor="fd-desc">
              Description / Evidence
            </label>
            <textarea
              id="fd-desc"
              rows={4}
              className="w-full p-[14px_16px] border border-[#e2e8f0] rounded-[8px] font-inherit text-[14.5px] text-[#1e293b] bg-[#f8fafc] transition-all duration-200 resize-y focus:outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] focus:bg-white aria-[invalid=true]:border-[#ef4444] aria-[invalid=true]:bg-[#fef2f2]"
              placeholder="Describe what was observed, including specific locations, equipment IDs, and conditions..."
              value={description}
              maxLength={1000}
              onChange={(e) => setDescription(e.target.value)}
              aria-invalid={submitted && !!errors.description}
            />
            {submitted && errors.description && <p className="text-[#dc2626] text-[12.5px] m-[6px_0_0_0]">{errors.description}</p>}
          </section>

          {/* Section Upload Photo */}
          <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-5 sm:p-7 md:p-[32px] flex flex-col">
            <div className="flex justify-between items-center mb-[16px]">
              <div>
                <span className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[2px]">
                  Photo Evidence ({photoCount})
                </span>
                <p className="text-[13px] text-[#64748b] m-0">Attach photos of the observation</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-[6px] bg-[#f1f5f9] text-[#0f2c52] border border-[#cbd5e1] p-[8px_14px] rounded-[6px] text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#e2e8f0]"
                onClick={() => setModalOpen(true)}
              >
                <ImagePlus size={16} /> Add Photo
              </button>
            </div>

            {photoCount === 0 ? (
              <div
                className="border-2 border-dashed border-[#cbd5e1] rounded-[8px] p-[28px] text-center cursor-pointer transition-all duration-200 hover:border-[#0f2c52] hover:bg-[#f8fafc]"
                onClick={() => setModalOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setModalOpen(true);
                  }
                }}
              >
                <ImagePlus size={36} className="text-[#94a3b8] mb-[8px] stroke-[1.5]" />
                <p className="text-[14px] font-semibold text-[#0f2c52] m-0 mb-[4px]">No photos attached yet</p>
                <span className="text-[12.5px] text-[#64748b]">Click here or the button above to upload photo evidence</span>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-[12px]">
                {/* Mode edit: foto yang sudah tersimpan di server */}
                {isEdit &&
                  (photos.data ?? []).map((p) => (
                    <FindingPhotoView
                      key={p.id}
                      url={p.url}
                      alt={p.fileName ?? 'Evidence photo'}
                    />
                  ))}

                {/* Mode create: file pending yang siap di-upload */}
                {!isEdit &&
                  previews.map(({ file, url }) => (
                    <div key={file.name + file.lastModified} className="relative rounded-[8px] overflow-hidden aspect-square border border-[#e2e8f0] bg-[#f8fafc] group">
                      <img
                        src={url}
                        alt={file.name}
                        className="w-full h-full object-cover cursor-pointer block"
                        onClick={() => setLightbox({ src: url, alt: file.name })}
                      />
                      <button
                        type="button"
                        className="absolute top-[6px] right-[6px] bg-[rgba(15,44,82,0.85)] text-white border-none rounded-full w-[26px] h-[26px] flex items-center justify-center cursor-pointer transition-opacity duration-200 hover:bg-[#ef4444]"
                        title="Remove photo"
                        aria-label={`Remove photo ${file.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPending((prev) => prev.filter((f) => f !== file));
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>

        {/* ---------- Kolom kanan (metadata & actions) ---------- */}
        <aside className="flex flex-col gap-6 sm:gap-[32px]">
          <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-5 sm:p-7 md:p-[32px] flex flex-col">
            <span className="block text-[14px] font-bold text-[#0f2c52] m-0 uppercase tracking-[0.5px] border-b border-[#e2e8f0] pb-[16px]">
              AUDIT METADATA
            </span>

            <div className="mt-[20px] flex flex-col gap-[6px]">
              <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px]">Reporter Name</label>
              <div className="flex items-center gap-[8px] bg-[#f1f5f9] p-[10px_14px] rounded-[6px] text-[#64748b] text-[13.5px] font-semibold border border-[#e2e8f0]">
                <Lock size={14} />
                <span>{reporterName || 'Unknown'}</span>
              </div>
              <span className="text-[11.5px] text-[#94a3b8] italic">Auto-filled from your profile</span>
            </div>
          </section>

          {!isEdit && activeCategories.length > 0 && (
            <section className="bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-[12px] p-[24px]">
              <h2 className="flex items-center gap-[8px] text-[14px] text-[#0f2c52] m-0 mb-[16px] uppercase tracking-[0.5px] font-bold">
                <Info size={22} /> Severity Guidelines
              </h2>
              {activeCategories.map((cat) => (
                <p key={cat.id} className="text-[13.5px] text-[#475569] leading-[1.5] m-0 mb-[12px] last:mb-0">
                  <strong className="text-[#1e293b] font-bold">{cat.name}:</strong>{' '}
                  {cat.description || '-'}
                </p>
              ))}
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
        <PhotoLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}

      {modalOpen && (
        <UploadPhotoModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onUpload={handleModalUpload}
        />
      )}
    </div>
  );
}
