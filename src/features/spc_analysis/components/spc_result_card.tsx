import { LineChart, Line, XAxis, YAxis, ReferenceLine, CartesianGrid, Tooltip } from 'recharts';

interface SpcResult {
  productName: string;
  mean: number;
  cp: number;
  cpk: number;
  status: string;
  ucl: number;
  cl: number;
  lcl: number;
  dataPoints: { sample: number; value: number }[];
}

// Data dummy — nanti diganti data asli dari API di langkah berikutnya
const dummyResult: SpcResult = {
  productName: 'Product Diameter',
  mean: 10.04,
  cp: 1.82,
  cpk: 1.64,
  status: 'CAPABLE',
  ucl: 10.35,
  cl: 10.04,
  lcl: 9.73,
  dataPoints: [
    { sample: 1, value: 10.10 },
    { sample: 2, value: 10.05 },
    { sample: 3, value: 9.95 },
    { sample: 4, value: 10.12 },
    { sample: 5, value: 10.08 },
    { sample: 6, value: 9.98 },
    { sample: 7, value: 10.03 },
    { sample: 8, value: 10.15 },
  ],
};

export default function SpcResultCard() {
  const result = dummyResult;

  return (
    <div className="spc-result">
      <div className="spc-summary">
        <h3>SPC Analysis</h3>
        <p className="spc-product-name">{result.productName}</p>

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
          <strong className="status-capable">{result.status} ✓</strong>
        </div>
      </div>

      <div className="spc-chart">
        <h4>Control Chart</h4>
        <LineChart width={500} height={300} data={result.dataPoints}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sample" label={{ value: 'Sample', position: 'insideBottom', offset: -5 }} />
          <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} />
          <Tooltip />

          <ReferenceLine y={result.ucl} stroke="#dc2626" strokeDasharray="4 4" label="UCL" />
          <ReferenceLine y={result.cl} stroke="#16a34a" label="CL" />
          <ReferenceLine y={result.lcl} stroke="#dc2626" strokeDasharray="4 4" label="LCL" />

          <Line type="monotone" dataKey="value" stroke="#0f2c52" dot={{ r: 4 }} />
        </LineChart>
      </div>
    </div>
  );
}