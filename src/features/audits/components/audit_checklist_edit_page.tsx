import { useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, CircleAlert, Plus, Save, Trash2 } from 'lucide-react';
import { useEditChecklist, STANDARDS } from '../hooks/use_edit_checklist';
import { DEPARTMENTS } from '../hooks/use_create_audit_plan';

export default function AuditChecklistEditPage() {
  const { checklistId } = useParams<{ checklistId: string }>();
  const {
    title, setTitle,
    standard, setStandard,
    department, setDepartment,
    items,
    updateItem, addItem, removeItem, moveItem,
    loading, loadError,
    titleError, isQuestionMissing,
    submitError, submitting,
    handleSubmit,
    navigate,
  } = useEditChecklist(checklistId!);

  // Kalau data lama pakai nilai di luar daftar, tetap tampilkan sebagai opsi
  const standardOptions = STANDARDS.some((s) => s.value === standard) || !standard
    ? STANDARDS
    : [...STANDARDS, { value: standard, label: standard }];
  const departmentOptions = DEPARTMENTS.includes(department) || !department
    ? DEPARTMENTS
    : [...DEPARTMENTS, department];

  if (loading) return <div className="page-container"><p className="text-muted">Memuat checklist...</p></div>;
  if (loadError) {
    return (
      <div className="page-container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <p className="error-text">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <h1>Edit Audit Checklist</h1>

      <form onSubmit={handleSubmit} className="create-audit-form">
        <div className="form-section-title">Checklist Details</div>
        <hr className="form-section-divider" />

        <div className="form-group">
          <label>Checklist Title *</label>
          <input
            type="text"
            placeholder="e.g., ISO 9001 - Warehouse"
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
            <label>Standard</label>
            <select value={standard} onChange={(e) => setStandard(e.target.value)}>
              <option value="">Select Standard</option>
              {standardOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">Select Department</option>
              {departmentOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section-title checklist-edit-section">
          Checklist Items <span className="checklist-edit-count">{items.length}</span>
        </div>
        <hr className="form-section-divider" />

        {items.length === 0 && (
          <p className="text-muted small">Belum ada item. Klik "Add Item" untuk menambahkan.</p>
        )}

        <div className="checklist-edit-list">
          {items.map((item, index) => {
            const questionMissing = isQuestionMissing(item);
            return (
              <div className="checklist-edit-item" key={item.key}>
                <div className="checklist-edit-item-header">
                  <span className="checklist-edit-number">{index + 1}</span>
                  <div className="checklist-edit-item-actions">
                    <button
                      type="button"
                      className="audit-icon-btn"
                      onClick={() => moveItem(item.key, -1)}
                      disabled={index === 0}
                      aria-label="Naikkan item"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      className="audit-icon-btn"
                      onClick={() => moveItem(item.key, 1)}
                      disabled={index === items.length - 1}
                      aria-label="Turunkan item"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      className="audit-icon-btn audit-icon-btn--danger"
                      onClick={() => removeItem(item.key)}
                      aria-label="Hapus item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group checklist-edit-question">
                    <label>Question *</label>
                    <input
                      type="text"
                      placeholder="e.g., Warehouse area is clean and tidy"
                      value={item.question}
                      onChange={(e) => updateItem(item.key, 'question', e.target.value)}
                      className={questionMissing ? 'input-error' : ''}
                    />
                    {questionMissing && (
                      <p className="error-text">
                        <CircleAlert size={14} /> Pertanyaan wajib diisi
                      </p>
                    )}
                  </div>
                  <div className="form-group checklist-edit-clause">
                    <label>Clause Ref</label>
                    <input
                      type="text"
                      placeholder="e.g., 7.1.4"
                      value={item.clauseRef}
                      onChange={(e) => updateItem(item.key, 'clauseRef', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    placeholder="Explain what the auditor should check for this item..."
                    value={item.description}
                    onChange={(e) => updateItem(item.key, 'description', e.target.value)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" className="btn-add-checklist-item" onClick={addItem}>
          <Plus size={16} /> Add Item
        </button>

        {submitError && <p className="error-text">{submitError}</p>}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            <Save size={16} /> {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
