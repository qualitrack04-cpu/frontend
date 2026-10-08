import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useFetch } from '../../../shared/hooks/use_fetch';
import { getFindings } from '../api/findings_api';
import FindingCard from './finding_card';

export default function FindingsPage() {
  const { data, loading, error } = useFetch(() => getFindings());

  return (
    <div className="max-w-full m-0 text-left">
      <div className="flex justify-between items-center mb-[20px] flex-wrap gap-[12px]">
        <h1 className="text-[3rem] font-bold text-[#0f2c52] m-0 tracking-[-0.5px] leading-[1.25]">Findings</h1>
        <Link to="/findings/new" className="flex items-center gap-[8px] bg-[#0f2c52] text-white px-[16px] py-[10px] rounded-[8px] no-underline text-[14px] font-semibold hover:bg-[#0c2444]">
          <Plus size={18} /> New Findings
        </Link>
      </div>

      {loading && <p className="text-slate-500">Memuat temuan...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && data?.length === 0 && (
        <p className="text-slate-500">Belum ada temuan. Tambahkan lewat tombol New FINDINGS.</p>
      )}

      <div className="grid grid-cols-2 gap-[20px] max-[900px]:grid-cols-1">
        {data?.map((finding) => (
          <FindingCard key={finding.id} finding={finding} />
        ))}
      </div>
    </div>
  );
}