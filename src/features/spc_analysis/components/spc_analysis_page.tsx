import { Link } from 'react-router-dom';
import SpcAnalysisForm from './spc_analysis_form';
import SpcResultCard from './spc_result_card';

export default function SpcAnalysisPage() {
  return (
    <div className="page-container">
      <h1>SPC Analysis</h1>
      <p className="page-subtitle">Monitor process stability & capability</p>
      <Link to="/spc-analysis/history" className="history-link">View Analyses History →</Link>
      <SpcAnalysisForm />
      <SpcResultCard />
    </div>
  );
}