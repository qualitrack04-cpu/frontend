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
    <div className="checklist-item-card">
      {item.clauseRef && <span className="tag-badge">{item.clauseRef}</span>}
      {/* ⚠️ field aslinya "question", bukan "title" — sesuai ChecklistController */}
      <h3>{item.question}</h3>
      {item.description && <p>{item.description}</p>}

      <div className="checklist-item-actions">
        {/* "Add Evidence" aktif kalau item sudah Pass dan sudah punya responseId */}
        {item.status === 'pass' && (
          <button
            className="btn-add-evidence"
            disabled={!item.responseId}
            onClick={() => setShowEvidenceModal(true)}
          >
            <Pencil size={14} /> Add Evidence
          </button>
        )}
        {item.status === 'fail' && !item.showFindingInput && (
          <button className="btn-add-findings" onClick={() => onMark(item.id, 'fail')}>
            <Pencil size={14} /> Add Findings
          </button>
        )}

        <button
          className={item.status === 'fail' ? 'btn-fail btn-fail--active' : 'btn-fail'}
          onClick={() => onMark(item.id, 'fail')}
        >
          <X size={16} /> Fail
        </button>
        <button
          className={item.status === 'pass' ? 'btn-pass btn-pass--active' : 'btn-pass'}
          onClick={() => onMark(item.id, 'pass')}
        >
          <Check size={16} /> Pass
        </button>
      </div>

      {item.showFindingInput && (
        <div className="finding-input-box">
          <textarea
            rows={3}
            placeholder="Jelaskan temuan (finding) untuk item yang gagal ini..."
            value={findingText}
            onChange={(e) => setFindingText(e.target.value)}
          />
          <button
            className="btn-secondary"
            onClick={() => {
              if (findingText.trim()) onSubmitFinding(item.id, findingText);
            }}
          >
            Simpan Finding
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