import { useState } from 'react';
import { X, Check, Pencil } from 'lucide-react';
import type { ChecklistItemState } from '../hooks/use_audit_checklist';
import EvidenceUploadModal from './evidence_upload_modal';

interface ChecklistItemCardProps {
  item: ChecklistItemState;
  onMark: (itemId: string, status: 'pass' | 'fail') => void;
  onSubmitFinding: (itemId: string, description: string) => void;
  onEvidenceUploaded: () => void;
}

export default function ChecklistItemCard({
  item,
  onMark,
  onSubmitFinding,
  onEvidenceUploaded,
}: ChecklistItemCardProps) {
  const [findingText, setFindingText] = useState('');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[24px] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,44,82,0.05)]">
      {item.clauseRef && <span className="inline-block bg-[#f1f5f9] text-[#475569] text-[12px] font-bold p-[4px_10px] rounded-[12px] mb-[12px]">{item.clauseRef}</span>}
      {/* ⚠️ field aslinya "question", bukan "title" — sesuai ChecklistController */}
      <h3 className="text-[16px] text-[#0f2c52] m-0 mb-[8px] leading-[1.4]">{item.question}</h3>
      {item.description && <p className="text-[14px] text-[#64748b] m-0 mb-[20px] leading-[1.5]">{item.description}</p>}

      <div className="flex justify-end gap-[12px]">
        {/* "Add Evidence" aktif kalau item sudah Pass dan sudah punya responseId */}
        {item.status === 'pass' && (
          <button
            className="bg-transparent text-[#0f2c52] border border-[#e2e8f0] p-[8px_16px] rounded-[6px] text-[13px] font-semibold cursor-pointer flex items-center gap-[6px] transition-all duration-200 mr-auto hover:bg-[#f8fafc] hover:border-[#cbd5e1] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!item.responseId}
            onClick={() => setShowEvidenceModal(true)}
          >
            <Pencil size={14} /> Add Evidence
          </button>
        )}
        {item.status === 'fail' && !item.showFindingInput && (
          <button className="bg-transparent text-[#0f2c52] border border-[#e2e8f0] p-[8px_16px] rounded-[6px] text-[13px] font-semibold cursor-pointer flex items-center gap-[6px] transition-all duration-200 mr-auto hover:bg-[#f8fafc] hover:border-[#cbd5e1] disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => onMark(item.id, 'fail')}>
            <Pencil size={14} /> Add Findings
          </button>
        )}

        <button
          className={item.status === 'fail' ? 'bg-[#dc2626] text-white border border-[#dc2626] p-[8px_20px] rounded-[6px] text-[14px] font-semibold cursor-pointer flex items-center gap-[6px] transition-all duration-200' : 'bg-white border border-[#e2e8f0] p-[8px_20px] rounded-[6px] text-[14px] font-semibold cursor-pointer flex items-center gap-[6px] transition-all duration-200 text-[#dc2626] hover:bg-[#fef2f2] hover:border-[#fca5a5]'}
          onClick={() => onMark(item.id, 'fail')}
        >
          <X size={16} /> Fail
        </button>
        <button
          className={item.status === 'pass' ? 'bg-[#16a34a] text-white border border-[#16a34a] p-[8px_20px] rounded-[6px] text-[14px] font-semibold cursor-pointer flex items-center gap-[6px] transition-all duration-200' : 'bg-white border border-[#e2e8f0] p-[8px_20px] rounded-[6px] text-[14px] font-semibold cursor-pointer flex items-center gap-[6px] transition-all duration-200 text-[#16a34a] hover:bg-[#f0fdf4] hover:border-[#86efac]'}
          onClick={() => onMark(item.id, 'pass')}
        >
          <Check size={16} /> Pass
        </button>
      </div>

      {item.showFindingInput && (
        <div className="mt-[20px] pt-[20px] border-t border-dashed border-[#cbd5e1] flex flex-col gap-[12px]">
          <textarea
            rows={3}
            placeholder="Explain finding for this failed item..."
            value={findingText}
            onChange={(e) => setFindingText(e.target.value)}
            className="w-full p-[12px] border border-[#e2e8f0] rounded-[8px] font-inherit text-[14px] resize-y outline-none transition-all duration-200 focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)]"
          />
          <button
            className="bg-[#f1f5f9] text-[#475569] border-none p-[12px_24px] rounded-[8px] text-[14px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#e2e8f0] self-end w-fit"
            onClick={() => {
              if (findingText.trim()) onSubmitFinding(item.id, findingText);
            }}
          >
            Save Finding
          </button>
        </div>
      )}

      {showEvidenceModal && item.responseId && (
        <EvidenceUploadModal
          responseId={item.responseId}
          onClose={() => setShowEvidenceModal(false)}
          onSuccess={() => {
            setShowEvidenceModal(false);
            onEvidenceUploaded();
          }}
        />
      )}
    </div>
  );
}