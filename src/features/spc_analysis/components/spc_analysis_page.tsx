import { useState } from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import SpcAnalysisForm from './spc_analysis_form';
import SpcResultCard from './spc_result_card';
import type { SpcResult } from '../api/spc_api';

export default function SpcAnalysisPage() {
  const [result, setResult] = useState<SpcResult | null>(null);

  return (
    <div className="max-w-full m-0 text-left">
      <div className="flex justify-between items-center mb-[24px]">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6">SPC Analysis</h1>
          <p className="text-slate-500 m-0 text-[13.5px]">Monitor process stability &amp; capability</p>
        </div>
        <div className="flex gap-3">
          {result && (
            <button 
              onClick={() => setResult(null)} 
              className="bg-[#0f2c52] text-white px-[16px] py-[10px] rounded-[8px] text-[13.5px] font-semibold border-none cursor-pointer hover:bg-[#0c2444] transition-colors shadow-sm"
            >
              + New Analysis
            </button>
          )}
          <Link to="/spc-analysis/history" className="bg-white text-[#0f2c52] px-[16px] py-[10px] rounded-[8px] text-[13.5px] font-semibold no-underline hover:bg-[#f8fafc] transition-colors border border-[#cbd5e1] shadow-sm flex items-center gap-[6px]">
            <History size={16} /> View History
          </Link>
        </div>
      </div>
      <div className={`grid grid-cols-1 gap-[32px] items-start ${!result ? 'md:grid-cols-[340px_1fr]' : ''}`}>
        {!result && <SpcAnalysisForm onResult={setResult} />}
        {result && (
          <div className="mx-auto w-full max-w-4xl">
            <SpcResultCard result={result} />
          </div>
        )}
      </div>
    </div>
  );
}