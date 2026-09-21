import { useState } from 'react';
import { Save } from 'lucide-react';
import { submitSessionSummary } from '../api/audit_session_api';

interface AuditSummaryModalProps {
  sessionId: string;
  onSaved: () => void;
}

const MAX_CHARS = 1000;

export default function AuditSummaryModal({ sessionId, onSaved }: AuditSummaryModalProps) {
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await submitSessionSummary(sessionId, summary);
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Gagal menyimpan ringkasan audit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="summary-modal-box">
        <p className="summary-modal-label">Audit Summary</p>
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