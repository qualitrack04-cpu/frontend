import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CircleAlert, Save } from 'lucide-react';
import { useCreateAuditPlan, DEPARTMENTS } from '../hooks/use_create_audit_plan';
import DatePicker from '../../../shared/components/date_picker';

function toLocalisoDate(date: Date){
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const todayIso = toLocalisoDate(new Date());
const maxDateIso = `${new Date().getFullYear() + 5}-12-31`;


export default function CreateAuditPlanPage() {
  const navigate = useNavigate();
  const {
    title, setTitle,
    leadAuditorId, setLeadAuditorId,
    department, setDepartment,
    scheduledDate, setScheduledDate,
    scopeDescription, setScopeDescription,
    checklistId, setChecklistId,
    highPriority, setHighPriority,
    auditors,
    checklists,
    loadingOptions,
    titleError,
    submitError,
    submitting,
    handleSubmit,
    isEdit,
  } = useCreateAuditPlan();

  return (
    <div className="page-container">
      <button className="back-btn" onClick={() => navigate('/audits')}>← Back to Audits</button>
      <h1>{isEdit ? 'Edit Audit Plan' : 'Create Audit Plan'}</h1>

      <form onSubmit={handleSubmit} className="create-audit-form">
        <div className="form-section-title">Audit Details</div>
        <hr className="form-section-divider" />

        <div className="form-group">
          <label>Audit Title *</label>
          <input
            type="text"
            placeholder="e.g., Q3 Manufacturing Facility Audit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={titleError ? 'input-error' : ''}
          />
          {titleError && (
            <p className="error-text">
              <CircleAlert size={14} /> {titleError}
            </p>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Lead Auditor</label>
            <select value={leadAuditorId} onChange={(e) => setLeadAuditorId(e.target.value)}>
              <option value="">Select Auditor</option>
              {auditors.map((a) => (
                <option key={a.id} value={a.id}>{a.fullName}</option>
              ))}
            </select>
            {!loadingOptions && auditors.length === 0 && (
              <p className="text-muted small">Belum ada auditor tersedia.</p>
            )}
          </div>
          <div className="form-group">
            <label>Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">Select Department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Scheduled Date</label>
          <div className="input-with-icon">
            <DatePicker
              min={todayIso}
              max={maxDateIso}
              value={scheduledDate}
              onChange={setScheduledDate}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Scope &amp; Description</label>
          <textarea
            rows={4}
            placeholder="Enter detailed scope and objectives for this audit..."
            value={scopeDescription}
            onChange={(e) => setScopeDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="iso-template-label">ISO TEMPLATE</label>

          {loadingOptions && <p className="text-muted">Memuat template...</p>}
          {!loadingOptions && checklists.length === 0 && (
            <p className="text-muted small">Belum ada checklist/template tersedia.</p>
          )}

          <div className="iso-template-list">
            {checklists.map((c) => (
              <label
                key={c.id}
                className={checklistId === c.id ? 'iso-template-option iso-template-option--active' : 'iso-template-option'}
              >
                <input
                  type="radio"
                  name="isoTemplate"
                  value={c.id}
                  checked={checklistId === c.id}
                  onChange={() => setChecklistId(c.id)}
                />
                <div className="iso-template-text">
                  <strong>{c.title}</strong>
                  <span>{c.standard}</span>
                </div>
                {checklistId === c.id && <ShieldCheck size={22} className="iso-template-check" />}
              </label>
            ))}
          </div>
        </div>

        <div className="toggle-row">
          <div className="toggle-row-text">
            <strong>High Priority</strong>
            <span>Flag this audit for immediate review.</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={highPriority}
              onChange={(e) => setHighPriority(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {submitError && <p className="error-text">{submitError}</p>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={submitting}>
            <Save size={16} /> {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}