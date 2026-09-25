import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis,
  ReferenceLine, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getSpcById, type SpcResult } from '../api/spc_api';
import { getStatusColor } from '../utils/status_color';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function SpcResultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<SpcResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const data = await getSpcById(id!);
        setResult(data);
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Gagal memuat detail analisis.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  if (loading) return <div className="page-container"><p className="text-muted">Memuat detail analisis...</p></div>;
  if (error)   return <div className="page-container"><p className="spc-error">{error}</p></div>;
  if (!result) return null;

  const chartData = result.data.map((value, i) => ({ sample: i + 1, value }));

  return (
    <div className="page-container">
      <button className="back-btn" onClick={() => navigate('/spc-analysis/history')}>
        ← Back
      </button>
      <h1>Analysis Result</h1>

      <div className="spc-result">
        <div className="spc-summary">
          <p className="spc-product-name">{result.parameterName}</p>
          {result.description && <p className="spc-description">{result.description}</p>}
          <p className="spc-date">Analysis completed on {formatDate(result.analyzedAt)}</p>

          <div className="spc-metric-row">
            <span>Mean</span>
            <strong>{result.mean}</strong>
          </div>
          <div className="spc-metric-row">
            <span>Std Dev</span>
            <strong>{result.standardDeviation}</strong>
          </div>
          <div className="spc-metric-row">
            <span>UCL</span>
            <strong>{result.ucl}</strong>
          </div>
          <div className="spc-metric-row">
            <span>LCL</span>
            <strong>{result.lcl}</strong>
          </div>
          <div className="spc-metric-row">
            <span>LSL</span>
            <strong>{result.lsl}</strong>
          </div>
          <div className="spc-metric-row">
            <span>USL</span>
            <strong>{result.usl}</strong>
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
            <span>Data Points</span>
            <strong>{result.dataCount}</strong>
          </div>
          <div className="spc-metric-row">
            <span>Status</span>
            <span className={`status-badge ${getStatusColor(result.status)}`}>
              {result.status}
            </span>
          </div>
        </div>

        <div className="spc-chart">
          <h4>Control Chart</h4>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sample" label={{ value: 'Sample', position: 'insideBottom', offset: -5 }} />
              <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} />
              <Tooltip />
              <ReferenceLine y={result.ucl} stroke="#dc2626" strokeDasharray="4 4" label="UCL" />
              <ReferenceLine y={result.mean} stroke="#16a34a" label="CL" />
              <ReferenceLine y={result.lcl} stroke="#dc2626" strokeDasharray="4 4" label="LCL" />
              <ReferenceLine y={result.usl} stroke="#f97316" strokeDasharray="2 4" label="USL" />
              <ReferenceLine y={result.lsl} stroke="#f97316" strokeDasharray="2 4" label="LSL" />
              <Line type="monotone" dataKey="value" stroke="#0f2c52" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}