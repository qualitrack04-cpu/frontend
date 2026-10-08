import {
  LineChart, Line, XAxis, YAxis,
  ReferenceLine, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { SpcResult } from '../api/spc_api';
import { getStatusColor } from '../utils/status_color';

interface Props {
  result: SpcResult | null;
}

export default function SpcResultCard({ result }: Props) {
  if (!result) {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px] flex flex-col gap-[32px] items-center justify-center min-h-[400px] !bg-[#f8fafc] border-dashed text-center text-[#64748b]">
        <p className="m-0 text-[15px]">Isi formulir dan klik <strong className="font-bold">Analyze</strong> untuk melihat hasil analisis SPC.</p>
      </div>
    );
  }

  const chartData = result.data.map((value, i) => ({ sample: i + 1, value }));

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px] flex flex-col gap-[32px]">
      <div>
        <h3 className="text-[20px] text-[#0f2c52] m-0 mb-[8px] leading-[1.3] font-bold">SPC Analysis Result</h3>
        <p className="text-[14px] font-bold text-[#475569] uppercase tracking-[0.5px] m-0 mb-[4px]">{result.parameterName}</p>
        {result.description && <p className="text-[13.5px] text-[#64748b] m-0 mb-[24px]">{result.description}</p>}

        <div className="flex justify-between items-center py-[12px] border-b border-[#f1f5f9] last:border-b-0 mt-[24px]">
          <span className="text-[#64748b] text-[14px]">Mean</span>
          <strong className="text-[#0f2c52] text-[15px] font-bold">{result.mean}</strong>
        </div>
        <div className="flex justify-between items-center py-[12px] border-b border-[#f1f5f9] last:border-b-0">
          <span className="text-[#64748b] text-[14px]">Std Dev</span>
          <strong className="text-[#0f2c52] text-[15px] font-bold">{result.standardDeviation}</strong>
        </div>
        <div className="flex justify-between items-center py-[12px] border-b border-[#f1f5f9] last:border-b-0">
          <span className="text-[#64748b] text-[14px]">UCL</span>
          <strong className="text-[#0f2c52] text-[15px] font-bold">{result.ucl}</strong>
        </div>
        <div className="flex justify-between items-center py-[12px] border-b border-[#f1f5f9] last:border-b-0">
          <span className="text-[#64748b] text-[14px]">LCL</span>
          <strong className="text-[#0f2c52] text-[15px] font-bold">{result.lcl}</strong>
        </div>
        <div className="flex justify-between items-center py-[12px] border-b border-[#f1f5f9] last:border-b-0">
          <span className="text-[#64748b] text-[14px]">Cp</span>
          <strong className="text-[#0f2c52] text-[15px] font-bold">{result.cp}</strong>
        </div>
        <div className="flex justify-between items-center py-[12px] border-b border-[#f1f5f9] last:border-b-0">
          <span className="text-[#64748b] text-[14px]">Cpk</span>
          <strong className="text-[#0f2c52] text-[15px] font-bold">{result.cpk}</strong>
        </div>
        <div className="flex justify-between items-center py-[12px] border-b border-[#f1f5f9] last:border-b-0">
          <span className="text-[#64748b] text-[14px]">Data Points</span>
          <strong className="text-[#0f2c52] text-[15px] font-bold">{result.dataCount}</strong>
        </div>
        <div className="flex justify-between items-center py-[12px] border-b border-[#f1f5f9] last:border-b-0">
          <span className="text-[#64748b] text-[14px]">Status</span>
          <span className={`inline-block p-[4px_10px] rounded-[12px] text-[12.5px] font-semibold ${getStatusColor(result.status)}`}>
            {result.status}
          </span>
        </div>
      </div>

      <div>
        <h4 className="text-[16px] text-[#0f2c52] m-0 mb-[20px] font-bold">Control Chart</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sample" label={{ value: 'Sample', position: 'insideBottom', offset: -15 }} />
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
  );
}