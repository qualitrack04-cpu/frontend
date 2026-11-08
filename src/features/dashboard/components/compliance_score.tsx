import { useMemo } from 'react';
import { useFetch } from '../../../shared/hooks/use_fetch';
import { useDepartmentColors } from '../../../shared/hooks/use_department_colors';
import { useDepartments } from '../../departments/hooks/use_departments';
import { getComplianceScore } from '../api/dashboard_api';

export default function ComplianceScore() {
  const { data, loading: scoreLoading, error: scoreError } = useFetch(getComplianceScore);
  const { departments: activeMasterDepts, loading: deptsLoading } = useDepartments();
  const colorFor = useDepartmentColors();

  const loading = scoreLoading || deptsLoading;
  const error = scoreError;

  // Filter kartu agar hanya menampilkan departemen yang masih terdaftar dan aktif di master data
  const departments = useMemo(() => {
    const rawList = data?.data ?? [];
    if (!activeMasterDepts.length && deptsLoading) return rawList;
    if (!activeMasterDepts.length && !deptsLoading) return [];

    return rawList.filter((item) => {
      const itemDeptName = (item.department || '').trim().toLowerCase();
      const match = activeMasterDepts.find(
        (d) =>
          (d.name || '').trim().toLowerCase() === itemDeptName ||
          (d.code || '').trim().toLowerCase() === itemDeptName
      );
      return match && match.isActive !== false;
    });
  }, [data?.data, activeMasterDepts, deptsLoading]);

  // Hitung ulang overall score berdasarkan departemen yang aktif saat ini
  const overallScore = useMemo(() => {
    if (!departments.length) return data?.overallScore;
    const totalResponses = departments.reduce((acc, curr) => acc + (curr.totalResponses || 0), 0);
    const conformResponses = departments.reduce((acc, curr) => acc + (curr.conformResponses || 0), 0);
    if (totalResponses > 0) {
      return (conformResponses / totalResponses) * 100;
    }
    return data?.overallScore;
  }, [departments, data?.overallScore]);

  return (
    <div className="mt-[8px]">
      <div className="flex justify-between items-center mb-[8px]">
        <p className="text-[11px] font-bold tracking-[0.8px] text-slate-500 uppercase m-0">COMPLIANCE SCORE</p>
        {typeof overallScore === 'number' && (
          <span className="text-[13px] text-slate-500">
            Overall: <strong className="text-[#0f2c52]">{overallScore.toFixed(1)}%</strong>
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
              {item.conformResponses}/{item.totalResponses} conform · {item.totalAudit} audit
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}