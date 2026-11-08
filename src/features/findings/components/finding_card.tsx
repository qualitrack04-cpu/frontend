import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { categoryBadgeLabel, type Finding } from '../api/findings_api';
import { getCategoryColor } from '../../system_configuration/utils/color_storage';

interface FindingCardProps {
  finding: Finding;
  categoryColors?: Record<string, string>;
}

export default function FindingCard({ finding, categoryColors }: FindingCardProps) {
  const catName = String(finding.category || (finding as any).categoryName || '').trim();
  const catKey = catName.toLowerCase().replace(/[\s_-]/g, '');

  let color = categoryColors?.[catKey] || categoryColors?.[catName.toLowerCase()];
  if (!color && finding.categoryId) {
    color = categoryColors?.[finding.categoryId];
  }
  if (!color) {
    color = getCategoryColor(finding.categoryId || '', catName);
  }
  if (!color) {
    if (catKey.includes('major')) color = '#EF4444';
    else if (catKey.includes('minor')) color = '#4D80FF';
    else color = '#3B82F6';
  }

  return (
    <article
      className="bg-white border border-[#e2e8f0] border-t-[4px] rounded-[12px] p-[24px] flex flex-col justify-between transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,44,82,0.05)] hover:border-[#cbd5e1] overflow-hidden min-w-0 max-w-full h-full min-h-[220px]"
      style={{ borderTopColor: color }}
    >
      <div>
        <div className="flex justify-between items-start gap-[16px] mb-[6px] min-w-0">
          <h2 className="text-[16px] text-[#0f2c52] m-0 leading-[1.4] font-bold break-words [overflow-wrap:anywhere] [word-break:break-word] flex-1 min-w-0 line-clamp-1" title={finding.title}>
            {finding.title}
          </h2>
          <span className="inline-flex items-center gap-[6px] bg-[#f8fafc] border border-[#e2e8f0] p-[4px_10px] rounded-[20px] text-[11px] font-bold text-[#475569] uppercase shrink-0">
            <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: color }} />
            {categoryBadgeLabel[finding.category] ?? finding.category}
          </span>
        </div>

        {finding.clauseRef ? (
          <p className="text-[13px] text-[#64748b] font-semibold m-0 mb-[12px] break-words [overflow-wrap:anywhere] [word-break:break-word] line-clamp-1" title={finding.clauseRef}>
            {finding.clauseRef}
          </p>
        ) : (
          <p className="text-[13px] text-[#94a3b8] italic font-normal m-0 mb-[12px]">No clause reference</p>
        )}

        <p className="text-[14px] text-[#475569] leading-[1.5] m-0 mb-[20px] break-words [overflow-wrap:anywhere] [word-break:break-word] line-clamp-2">
          {finding.description}
        </p>
      </div>

      <div className="flex justify-between items-center border-t border-[#f1f5f9] pt-[16px] mt-auto">
        <Link to={`/findings/${finding.id}/edit`} className="inline-block bg-white text-[#0f2c52] border border-[#e2e8f0] p-[6px_16px] rounded-[6px] text-[13px] font-semibold no-underline transition-all duration-200 hover:bg-[#f8fafc] hover:border-[#cbd5e1]">
          Edit
        </Link>
        <Link to={`/findings/${finding.id}`} className="inline-flex items-center gap-[4px] text-[#0f2c52] text-[14px] font-bold no-underline transition-opacity duration-200 hover:opacity-80">
          Details <ChevronRight size={16} />
        </Link>
      </div>
    </article>
  );
}
