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
        <p className="m-0 text-[15px]">Fill in the form and click <strong className="font-bold">Analyze</strong> to view the SPC analysis result.</p>
      </div>
    );
  }

  const rawData = result.data || [];
  const chartData = rawData.map((value, i) => ({ sample: i + 1, value }));
  const hasOutOfControl = rawData.some((v) => v > result.ucl || v < result.lcl);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[32px] flex flex-col gap-[32px] overflow-hidden min-w-0 max-w-full">
      <div className="min-w-0 max-w-full">
        <h3 className="text-[20px] text-[#0f2c52] m-0 mb-[8px] leading-[1.3] font-bold break-words [overflow-wrap:anywhere] [word-break:break-word]">SPC Analysis Result</h3>
        <p className="text-[14px] font-bold text-[#475569] uppercase tracking-[0.5px] m-0 mb-[4px] break-words [overflow-wrap:anywhere] [word-break:break-word]">{result.parameterName}</p>
        {result.description && <p className="text-[13.5px] text-[#64748b] m-0 mb-[24px] break-words [overflow-wrap:anywhere] [word-break:break-word]">{result.description}</p>}

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
        <div className="flex items-center justify-between mb-[20px] flex-wrap gap-2">
          <h4 className="text-[16px] text-[#0f2c52] m-0 font-bold">Control Chart</h4>
          {hasOutOfControl && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#dc2626] bg-[#fee2e2] px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
              Out of Control Points Detected
            </span>
          )}
        </div>

        {chartData.length === 0 ? (
          <div className="p-8 text-center bg-[#f8fafc] rounded-lg border border-dashed border-[#cbd5e1] text-[#64748b] text-sm">
            No chart data points available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sample" label={{ value: 'Sample', position: 'insideBottom', offset: -20 }} />
              <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} />
              <Tooltip />

              <ReferenceLine y={result.ucl} stroke="#dc2626" strokeDasharray="4 4" label="UCL" />
              <ReferenceLine y={result.mean} stroke="#16a34a" label="CL" />
              <ReferenceLine y={result.lcl} stroke="#dc2626" strokeDasharray="4 4" label="LCL" />
              <ReferenceLine y={result.usl} stroke="#f97316" strokeDasharray="2 4" label="USL" />
              <ReferenceLine y={result.lsl} stroke="#f97316" strokeDasharray="2 4" label="LSL" />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#0f2c52"
                strokeWidth={2}
                dot={(dotProps: any) => {
                  const { cx, cy, payload } = dotProps;
                  if (cx === undefined || cy === undefined || !payload) return null;
                  const isOut = payload.value > result.ucl || payload.value < result.lcl;
                  return (
                    <circle
                      key={`dot-${payload.sample}`}
                      cx={cx}
                      cy={cy}
                      r={isOut ? 5.5 : 4}
                      fill={isOut ? '#dc2626' : '#0f2c52'}
                      stroke={isOut ? '#ffffff' : '#0f2c52'}
                      strokeWidth={isOut ? 1.5 : 1}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}