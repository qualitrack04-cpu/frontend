import { useState } from 'react';
import { Link } from 'react-router-dom';
import SpcAnalysisForm from './spc_analysis_form';
import SpcResultCard from './spc_result_card';
import type { SpcResult } from '../api/spc_api';

export default function SpcAnalysisPage() {
  const [result, setResult] = useState<SpcResult | null>(null);

  return (
    <div className="page-container">
      <h1>SPC Analysis</h1>
      <p className="page-subtitle">Monitor process stability &amp; capability</p>
      <Link to="/spc-analysis/history" className="history-link">View Analyses History →</Link>
      <div className="spc-layout">
        <SpcAnalysisForm onResult={setResult} />
        <SpcResultCard result={result} />
      </div>
    </div>
  );
}