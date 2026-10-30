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
        setError(err.response?.data?.message ?? 'Failed to load analysis detail.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  if (loading) return <div className="max-w-full m-0 text-left"><p className="text-slate-500">Loading analysis detail...</p></div>;
  if (error)   return <div className="max-w-full m-0 text-left"><p className="text-red-600">{error}</p></div>;
  if (!result) return null;

  const chartData = result.data.map((value, i) => ({ sample: i + 1, value }));

  return (
    <div className="max-w-full m-0 text-left">
      <button className="inline-flex items-center gap-[8px] bg-transparent border-none text-[#64748b] text-[14px] font-semibold cursor-pointer p-0 mb-[16px] hover:text-[#1e293b]" onClick={() => navigate('/spc-analysis/history')}>
        ← Back
      </button>
      <h1 className="text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6">Analysis Result</h1>

      <div className="flex flex-col lg:flex-row gap-[24px] bg-white rounded-[12px] border border-[#e2e8f0] p-[24px]">
        <div className="flex-[0_0_auto] lg:flex-[0_0_320px] w-full lg:w-auto box-border bg-[#f8fafc] p-[20px] rounded-[8px] border border-[#e2e8f0]">
          <p className="text-[18px] font-bold text-[#0f2c52] m-0 mb-[4px]">{result.parameterName}</p>
          {result.description && <p className="text-[14px] text-[#475569] m-0 mb-[6px]">{result.description}</p>}
          <p className="text-[13px] text-[#64748b] m-0 mb-[20px]">Analysis completed on {formatDate(result.analyzedAt)}</p>

          <div className="flex justify-between items-center py-[8px] border-b border-[#e2e8f0] text-[14px] last:border-b-0">
            <span className="text-[#475569]">Mean</span>
            <strong className="text-[#0f2c52]">{result.mean}</strong>
          </div>
          <div className="flex justify-between items-center py-[8px] border-b border-[#e2e8f0] text-[14px] last:border-b-0">
            <span className="text-[#475569]">Std Dev</span>
            <strong className="text-[#0f2c52]">{result.standardDeviation}</strong>
          </div>
          <div className="flex justify-between items-center py-[8px] border-b border-[#e2e8f0] text-[14px] last:border-b-0">
            <span className="text-[#475569]">UCL</span>
            <strong className="text-[#0f2c52]">{result.ucl}</strong>
          </div>
          <div className="flex justify-between items-center py-[8px] border-b border-[#e2e8f0] text-[14px] last:border-b-0">
            <span className="text-[#475569]">LCL</span>
            <strong className="text-[#0f2c52]">{result.lcl}</strong>
          </div>
          <div className="flex justify-between items-center py-[8px] border-b border-[#e2e8f0] text-[14px] last:border-b-0">
            <span className="text-[#475569]">LSL</span>
            <strong className="text-[#0f2c52]">{result.lsl}</strong>
          </div>
          <div className="flex justify-between items-center py-[8px] border-b border-[#e2e8f0] text-[14px] last:border-b-0">
            <span className="text-[#475569]">USL</span>
            <strong className="text-[#0f2c52]">{result.usl}</strong>
          </div>
          <div className="flex justify-between items-center py-[8px] border-b border-[#e2e8f0] text-[14px] last:border-b-0">
            <span className="text-[#475569]">Cp</span>
            <strong className="text-[#0f2c52]">{result.cp}</strong>
          </div>
          <div className="flex justify-between items-center py-[8px] border-b border-[#e2e8f0] text-[14px] last:border-b-0">
            <span className="text-[#475569]">Cpk</span>
            <strong className="text-[#0f2c52]">{result.cpk}</strong>
          </div>
          <div className="flex justify-between items-center py-[8px] border-b border-[#e2e8f0] text-[14px] last:border-b-0">
            <span className="text-[#475569]">Data Points</span>
            <strong className="text-[#0f2c52]">{result.dataCount}</strong>
          </div>
          <div className="flex justify-between items-center py-[8px] border-b border-[#e2e8f0] text-[14px] last:border-b-0">
            <span className="text-[#475569]">Status</span>
            <span className={`inline-block p-[4px_10px] rounded-[12px] text-[12.5px] font-semibold ${getStatusColor(result.status)}`}>
              {result.status}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <h4 className="text-[16px] text-[#0f2c52] m-0 mb-[16px]">Control Chart</h4>
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