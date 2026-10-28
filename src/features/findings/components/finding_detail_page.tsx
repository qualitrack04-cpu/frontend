import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, User } from 'lucide-react';
import { useFetch } from '../../../shared/hooks/use_fetch';
import { getFinding, getFindingPhotos } from '../api/findings_api';
import FindingPhotoView from './finding_photo';

function formatDate(iso?: string | null) {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  // Desain memakai format "27 Aug 2026"
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function FindingDetailPage() {
  const { id = '' } = useParams();
  const finding = useFetch(() => getFinding(id), [id]);
  const photos = useFetch(() => getFindingPhotos(id), [id]);

  const data = finding.data;
  const photoList = photos.data ?? [];

  return (
    <div className="max-w-full m-0 text-left">
      <Link to="/findings" className="inline-flex items-center gap-[8px] text-[#64748b] text-[14px] font-semibold no-underline mb-[24px] transition-colors duration-200 hover:text-[#0f2c52]">
        <ArrowLeft size={18} /> Back to Findings
      </Link>
      <h1 className="text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6">Findings Detail</h1>

      {finding.loading && <p className="text-slate-500">Loading finding...</p>}
      {finding.error && <p className="text-red-600">{finding.error}</p>}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-[32px] items-start">
          <div className="flex flex-col gap-[24px]">
            <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px]">
              <h2 className="text-[24px] text-[#0f2c52] m-0 mb-[24px] leading-[1.3] font-bold">{data.title}</h2>
              <span className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]">Description</span>
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-[20px] text-[14.5px] text-[#1e293b] leading-[1.6]">{data.description || '-'}</div>
            </section>

            <section className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px]">
              <div className="flex justify-between items-center mb-[24px]">
                <h2 className="text-[14px] font-bold text-[#0f2c52] m-0 uppercase tracking-[0.5px]">EVIDENCE PHOTOS</h2>
                <span className="bg-[#f1f5f9] text-[#475569] p-[4px_12px] rounded-[16px] text-[13px] font-semibold">
                  {photoList.length} {photoList.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>
              {photos.error && <p className="text-[#dc2626] text-[13px] mt-[4px]">{photos.error}</p>}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[16px]">
                {photoList.map((photo) => (
                  <FindingPhotoView
                    key={photo.id}
                    url={photo.url}
                    alt={photo.fileName ?? 'Evidence photo'}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px] flex flex-col gap-[24px]">
            <h2 className="text-[14px] font-bold text-[#0f2c52] m-0 uppercase tracking-[0.5px] border-b border-[#e2e8f0] pb-[16px]">AUDIT METADATA</h2>
            <div className="flex items-start gap-[16px]">
              <span className="bg-[#f8fafc] text-[#64748b] w-[40px] h-[40px] rounded-[10px] flex items-center justify-center shrink-0">
                <User size={18} />
              </span>
              <div>
                <span className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]">Reporter</span>
                <p className="m-0 text-[15px] text-[#0f2c52] font-semibold">{data.reporterName || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-[16px]">
              <span className="bg-[#f8fafc] text-[#64748b] w-[40px] h-[40px] rounded-[10px] flex items-center justify-center shrink-0">
                <Building2 size={18} />
              </span>
              <div>
                <span className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]">Dept</span>
                <p className="m-0 text-[15px] text-[#0f2c52] font-semibold">{data.department || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-[16px]">
              <span className="bg-[#f8fafc] text-[#64748b] w-[40px] h-[40px] rounded-[10px] flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </span>
              <div>
                <span className="block text-[12px] font-bold text-[#64748b] uppercase tracking-[0.5px] mb-[8px]">Date</span>
                <p className="m-0 text-[15px] text-[#0f2c52] font-semibold">{formatDate(data.foundAt ?? data.createdAt)}</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}