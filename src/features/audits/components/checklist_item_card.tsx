import { useState, useEffect } from 'react';
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
  const [findingText, setFindingText] = useState(item.findingText ?? '');
  const [isOpenInput, setIsOpenInput] = useState<boolean | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  useEffect(() => {
    if (item.findingText !== undefined) {
      setFindingText(item.findingText);
    }
  }, [item.findingText]);

  useEffect(() => {
    if (item.status !== 'fail') {
      setIsOpenInput(null);
    }
  }, [item.status]);

  const showFindingInput =
    item.status === 'fail' &&
    (isOpenInput !== null
      ? isOpenInput
      : item.showFindingInput || !item.findingSubmitted);

  const handleMarkFail = () => {
    setIsOpenInput(true);
    onMark(item.id, 'fail');
  };

  const handleMarkPass = () => {
    setIsOpenInput(false);
    onMark(item.id, 'pass');
  };

  const handleToggleFinding = () => {
    setIsOpenInput((prev) => (prev !== null ? !prev : !showFindingInput));
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[24px] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,44,82,0.05)] overflow-hidden min-w-0 max-w-full">
      {item.clauseRef && <span className="inline-block bg-[#f1f5f9] text-[#475569] text-[12px] font-bold p-[4px_10px] rounded-[12px] mb-[12px] break-words [overflow-wrap:anywhere] [word-break:break-word]">{item.clauseRef}</span>}
      {/* ⚠️ field aslinya "question", bukan "title" — sesuai ChecklistController */}
      <h3 className="text-[16px] text-[#0f2c52] m-0 mb-[8px] leading-[1.4] break-words [overflow-wrap:anywhere] [word-break:break-word]">{item.question}</h3>
      {item.description && <p className="text-[14px] text-[#64748b] m-0 mb-[20px] leading-[1.5] break-words [overflow-wrap:anywhere] [word-break:break-word]">{item.description}</p>}

      <div className="flex justify-end gap-[12px]">
        {/* "Add Evidence" aktif kalau item sudah Pass dan sudah punya responseId */}
        {item.status === 'pass' && (
          <button
            type="button"
            className="bg-transparent text-[#0f2c52] border border-[#e2e8f0] p-[8px_16px] rounded-[6px] text-[13px] font-semibold cursor-pointer flex items-center gap-[6px] transition-all duration-200 mr-auto hover:bg-[#f8fafc] hover:border-[#cbd5e1] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!item.responseId}
            onClick={() => setShowEvidenceModal(true)}
          >
            <Pencil size={14} /> Add Evidence
          </button>
        )}
        {item.status === 'fail' && !showFindingInput && (
          <button
            type="button"
            className="bg-transparent text-[#0f2c52] border border-[#e2e8f0] p-[8px_16px] rounded-[6px] text-[13px] font-semibold cursor-pointer flex items-center gap-[6px] transition-all duration-200 mr-auto hover:bg-[#f8fafc] hover:border-[#cbd5e1]"
            onClick={handleToggleFinding}
          >
            <Pencil size={14} /> {item.findingSubmitted || item.findingText ? 'Edit Finding' : 'Add Findings'}
          </button>
        )}

        <button
          type="button"
          className={item.status === 'fail' ? 'bg-[#dc2626] text-white border border-[#dc2626] p-[8px_20px] rounded-[6px] text-[14px] font-semibold cursor-pointer flex items-center gap-[6px] transition-all duration-200' : 'bg-white border border-[#e2e8f0] p-[8px_20px] rounded-[6px] text-[14px] font-semibold cursor-pointer flex items-center gap-[6px] transition-all duration-200 text-[#dc2626] hover:bg-[#fef2f2] hover:border-[#fca5a5]'}
          onClick={handleMarkFail}
        >
          <X size={16} /> Fail
        </button>
        <button
          type="button"
          className={item.status === 'pass' ? 'bg-[#16a34a] text-white border border-[#16a34a] p-[8px_20px] rounded-[6px] text-[14px] font-semibold cursor-pointer flex items-center gap-[6px] transition-all duration-200' : 'bg-white border border-[#e2e8f0] p-[8px_20px] rounded-[6px] text-[14px] font-semibold cursor-pointer flex items-center gap-[6px] transition-all duration-200 text-[#16a34a] hover:bg-[#f0fdf4] hover:border-[#86efac]'}
          onClick={handleMarkPass}
        >
          <Check size={16} /> Pass
        </button>
      </div>

      {showFindingInput && (
        <div className="mt-[20px] pt-[20px] border-t border-[#e2e8f0] flex flex-col gap-[12px]">
          <textarea
            rows={3}
            placeholder="Explain finding for this failed item..."
            value={findingText}
            onChange={(e) => setFindingText(e.target.value)}
            className="w-full p-[12px] border border-[#e2e8f0] rounded-[8px] font-inherit text-[14px] resize-y outline-none transition-all duration-200 focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)]"
          />
          <div className="flex items-center justify-end gap-[8px] self-end">
            <button
              type="button"
              className="bg-white text-[#64748b] border border-[#e2e8f0] p-[8px_16px] rounded-[6px] text-[13px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#f8fafc]"
              onClick={() => setIsOpenInput(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-[#0f2c52] text-white border-none p-[8px_18px] rounded-[6px] text-[13px] font-semibold cursor-pointer transition-colors duration-200 hover:bg-[#0c2444] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!findingText.trim()}
              onClick={() => {
                if (findingText.trim()) {
                  onSubmitFinding(item.id, findingText.trim());
                  setIsOpenInput(false);
                }
              }}
            >
              Save Finding
            </button>
          </div>
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