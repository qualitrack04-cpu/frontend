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
    <div className="fixed inset-0 bg-[rgba(15,44,82,0.4)] backdrop-blur-[2px] flex items-end sm:items-center justify-center z-[1000] animate-[fadein_0.2s_ease-out]">
      <div className="bg-white w-full max-w-[600px] rounded-t-[20px] sm:rounded-[16px] p-[32px] flex flex-col animate-[slideup_0.2s_ease-out]">
        <div className="flex justify-between items-center">
          <p className="text-[14px] font-bold text-[#0f2c52] uppercase tracking-[0.5px] m-0">Audit Summary</p>
          <button type="button" className="bg-transparent border-none text-[#94a3b8] cursor-pointer p-[4px] flex items-center justify-center transition-colors duration-200 hover:text-[#0f2c52]" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <hr className="border-t border-[#e2e8f0] my-[16px] mb-[24px]" />

        <textarea
          className="w-full p-[16px] border border-[#e2e8f0] rounded-[8px] font-inherit text-[14px] text-[#1e293b] resize-y bg-[#f8fafc] outline-none transition-all duration-200 focus:bg-white focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] box-border"
          rows={6}
          maxLength={MAX_CHARS}
          placeholder="Enter detailed audit summary and observations here..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <p className="text-[12px] text-[#94a3b8] text-right m-[8px_0_24px_0]">{summary.length}/{MAX_CHARS} characters</p>

        {error && <p className="text-[#dc2626] text-[13px] mt-[4px]">{error}</p>}

        <button className="bg-white text-[#0f2c52] border-[2px] border-[#0f2c52] p-[14px] rounded-[8px] text-[15px] font-bold w-full cursor-pointer transition-all duration-200 flex items-center justify-center gap-[8px] hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Progress'}
        </button>
      </div>
    </div>
  );
}