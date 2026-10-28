import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { categoryBadgeLabel, type Finding } from '../api/findings_api';

export default function FindingCard({ finding }: { finding: Finding }) {
  const cat = String(finding.category || '').toLowerCase();
  const borderColor = cat.includes('minor') ? 'border-t-[#f59e0b]' : cat.includes('major') ? 'border-t-[#f97316]' : cat.includes('critical') ? 'border-t-[#dc2626]' : 'border-t-[#3b82f6]';
  const dotColor = cat.includes('minor') ? 'bg-[#f59e0b]' : cat.includes('major') ? 'bg-[#f97316]' : cat.includes('critical') ? 'bg-[#dc2626]' : 'bg-[#3b82f6]';

  return (
    <article className={`bg-white border border-[#e2e8f0] border-t-[4px] rounded-[12px] p-[24px] flex flex-col transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,44,82,0.05)] hover:border-[#cbd5e1] ${borderColor}`}>
      <div className="flex justify-between items-start gap-[16px] mb-[8px]">
        <h2 className="text-[16px] text-[#0f2c52] m-0 leading-[1.4] font-bold">{finding.title}</h2>
        <span className="inline-flex items-center gap-[6px] bg-[#f8fafc] border border-[#e2e8f0] p-[4px_10px] rounded-[20px] text-[11px] font-bold text-[#475569] uppercase shrink-0">
          <span className={`w-[6px] h-[6px] rounded-full ${dotColor}`} />
          {categoryBadgeLabel[finding.category] ?? finding.category}
        </span>
      </div>

      {finding.clauseRef ? (
        <p className="text-[13px] text-[#64748b] font-semibold m-0 mb-[16px]">{finding.clauseRef}</p>
      ) : (
        <p className="text-[13px] text-[#94a3b8] italic font-normal m-0 mb-[16px]">No clause reference</p>
      )}
      <p className="text-[14px] text-[#475569] leading-[1.5] m-0 mb-[24px] flex-1">{finding.description}</p>

      <div className="flex justify-between items-center border-t border-[#f1f5f9] pt-[16px]">
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
