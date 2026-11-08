import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useFetch } from '../../../shared/hooks/use_fetch';
import { getFindings } from '../api/findings_api';
import { getFindingCategories } from '../../system_configuration/api/system_config_api';
import FindingCard from './finding_card';

export default function FindingsPage() {
  const { data, loading, error } = useFetch(async () => {
    const [findings, categories] = await Promise.all([
      getFindings(),
      getFindingCategories().catch(() => []),
    ]);

    const colorMap: Record<string, string> = {};
    if (Array.isArray(categories)) {
      for (const cat of categories) {
        if (cat.name && cat.hexaCode) {
          const key = cat.name.toLowerCase().replace(/[\s_-]/g, '');
          colorMap[key] = cat.hexaCode;
          colorMap[cat.name.toLowerCase()] = cat.hexaCode;
          if (cat.id) {
            colorMap[cat.id] = cat.hexaCode;
          }
        }
      }
    }

    return { findings: findings || [], colorMap };
  });

  const findingsList = data?.findings || [];
  const colorMap = data?.colorMap || {};

  return (
    <div className="max-w-full m-0 text-left">
      <div className="flex justify-between items-center mb-[20px] flex-wrap gap-[12px]">
        <h1 className="text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6">Findings</h1>
        <Link to="/findings/new" className="flex items-center gap-[8px] bg-[#0f2c52] text-white px-[16px] py-[10px] rounded-[8px] no-underline text-[14px] font-semibold hover:bg-[#0c2444]">
          <Plus size={18} /> New Findings
        </Link>
      </div>

      {loading && <p className="text-slate-500">Loading findings...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && findingsList.length === 0 && (
        <p className="text-slate-500">No findings yet. Add one via New FINDINGS button.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] min-w-0 max-w-full items-stretch">
        {findingsList.map((finding) => (
          <FindingCard key={finding.id} finding={finding} categoryColors={colorMap} />
        ))}
      </div>
    </div>
  );
}