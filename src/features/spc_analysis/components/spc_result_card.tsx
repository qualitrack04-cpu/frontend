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
      <div className="spc-result spc-result--empty">
        <p>Isi formulir dan klik <strong>Analyze</strong> untuk melihat hasil analisis SPC.</p>
      </div>
    );
  }

  const chartData = result.data.map((value, i) => ({ sample: i + 1, value }));

  return (
    <div className="spc-result">
      <div className="spc-summary">
        <h3>SPC Analysis Result</h3>
        <p className="spc-product-name">{result.parameterName}</p>
        {result.description && <p className="spc-description">{result.description}</p>}

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
        <ResponsiveContainer width="100%" height={300}>
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
  );
}