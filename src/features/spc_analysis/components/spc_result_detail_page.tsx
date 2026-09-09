import { useParams, useNavigate } from 'react-router-dom';
import { getStatusColor } from '../utils/status_color';

export default function SpcResultDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data dummy — nanti diganti hasil GET /api/Spc/{id}
  const result = {
    id,
    productName: 'Product Diameter',
    completedAt: 'Aug 25, 2026 · 09:30 AM',
    mean: 10.04,
    cp: 1.82,
    cpk: 1.64,
    status: 'Process Unstable',
    ucl: 11.50,
    cl: 10.04,
    lcl: 8.00,
  };

  return (
    <div className="page-container">
      <button className="back-btn" onClick={() => navigate('/spc-analysis/history')}>
        ← Back
      </button>
      <h1>Analysis Result</h1>

      <div className="spc-result">
        <p className="spc-product-name">{result.productName}</p>
        <p className="spc-date">Analysis completed on {result.completedAt}</p>

        <div className="spc-metric-row">
          <span>Mean</span>
          <strong>{result.mean} mm</strong>
        </div>
        <div className="spc-metric-row">
          <span>Cp</span>
          <strong>{result.cp}</strong>
        </div>
        <div className="spc-metric-row">
          <span>Cpk</span>
          <strong>{result.cpk}</strong>
        </div>
        <div className="spc-metric-row">
          <span>Status</span>
          <span className={`status-badge ${getStatusColor(result.status)}`}>
            {result.status}
          </span>
        </div>

        <div className="spc-chart">
          <h4>Control Chart</h4>
          <p>UCL {result.ucl} · CL {result.cl} · LCL {result.lcl}</p>
          {/* Chart lengkap bisa memakai komponen SpcResultCard yang sudah ada, disederhanakan dulu di sini */}
        </div>
      </div>
    </div>
  );
}