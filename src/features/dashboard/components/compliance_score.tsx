import { useFetch } from '../../../shared/hooks/use_fetch';
import { getComplianceScore } from '../api/dashboard_api';

const departmentColors: Record<string, string> = {
  Production: '#a855f7',
  Packaging: '#3b82f6',
  Warehouse: '#ec4899',
  QC: '#22c55e',
};

const colorFor = (dept: string) => departmentColors[dept] ?? '#64748b';

export default function ComplianceScore() {
  const { data, loading, error } = useFetch(getComplianceScore);

  console.log('compliance-score response', data);

  const departments = data?.data ?? [];

  return (
    <div className="mt-[8px]">
      <div className="flex justify-between items-center mb-[8px]">
        <p className="text-[11px] font-bold tracking-[0.8px] text-slate-500 uppercase m-0">COMPLIANCE SCORE</p>
        {typeof data?.overallScore === 'number' && (
          <span className="text-[13px] text-slate-500">
            Overall: <strong className="text-[#0f2c52]">{data.overallScore.toFixed(1)}%</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-[16px] max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
        {loading && <p className="text-slate-500">Loading compliance score...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && departments.length === 0 && (
          <p className="text-slate-500">No compliance data available.</p>
        )}

        {departments.map((item) => (
          <div
            key={item.department}
            className="bg-white border border-[#e2e8f0] border-l-[4px] rounded-[8px] p-[16px]"
            style={{ borderLeftColor: colorFor(item.department) }}
          >
            <div className="flex justify-between mb-[10px]">
              <strong className="text-[#0f2c52] text-[15px]">{item.department}</strong>
              <span style={{ color: colorFor(item.department) }}>{(item.score ?? 0).toFixed(1)}%</span>
            </div>
            <div className="bg-[#f1f5f9] h-[8px] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${item.score ?? 0}%`, backgroundColor: colorFor(item.department) }}
              />
            </div>
            <p className="text-slate-500 text-[13px] m-0 mt-[6px]">
              {item.conformResponses}/{item.totalResponses} sesuai · {item.totalAudit} audit
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}