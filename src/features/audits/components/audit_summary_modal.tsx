import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { submitSessionSummary } from '../api/audit_session_api';

interface AuditSummaryModalProps {
  sessionId: string;
  onSaved: () => void;
  onClose: () => void;
}

const MAX_CHARS = 1000;

export default function AuditSummaryModal({ sessionId, onSaved, onClose }: AuditSummaryModalProps) {
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!summary.trim()) {
      setError('Ringkasan audit tidak boleh kosong');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await submitSessionSummary(sessionId, summary);
      onSaved();
    } catch (err: any) {
      // Summary sudah pernah disimpan (mis. dari kunjungan sebelumnya) — langsung ke report
      if (err.response?.data?.message === 'Summary already exists for this session') {
        onSaved();
        return;
      }
      setError(err.response?.data?.message ?? 'Gagal menyimpan ringkasan audit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="summary-modal-box">
        <div className="photo-modal-header">
          <p className="summary-modal-label">Audit Summary</p>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <hr className="form-section-divider" />

        <textarea
          className="summary-textarea"
          rows={6}
          maxLength={MAX_CHARS}
          placeholder="Enter detailed audit summary and observations here..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <p className="summary-char-count">{summary.length}/{MAX_CHARS} characters</p>

        {error && <p className="error-text">{error}</p>}

        <button className="btn-save-progress" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Progress'}
        </button>
      </div>
    </div>
  );
}