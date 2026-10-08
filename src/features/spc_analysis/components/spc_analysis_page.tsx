import { useState } from 'react';
import { Link } from 'react-router-dom';
import SpcAnalysisForm from './spc_analysis_form';
import SpcResultCard from './spc_result_card';
import type { SpcResult } from '../api/spc_api';

export default function SpcAnalysisPage() {
  const [result, setResult] = useState<SpcResult | null>(null);

  return (
    <div className="max-w-full m-0 text-left">
      <div className="flex justify-between items-center mb-[24px]">
        <div>
          <h1 className="text-[3rem] font-bold text-[#0f2c52] m-0 mb-[8px] tracking-[-0.5px] leading-[1.25]">SPC Analysis</h1>
          <p className="text-slate-500 m-0 text-[13.5px]">Monitor process stability &amp; capability</p>
        </div>
        <Link to="/spc-analysis/history" className="bg-[#f1f5f9] text-[#0f2c52] px-[16px] py-[10px] rounded-[8px] text-[13.5px] font-semibold no-underline hover:bg-[#e2e8f0] transition-colors border border-[#cbd5e1] shadow-sm flex items-center gap-[6px]">
          View History →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-[32px] items-start">
        <SpcAnalysisForm onResult={setResult} />
        <SpcResultCard result={result} />
      </div>
    </div>
  );
}