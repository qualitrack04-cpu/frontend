import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RefreshCw, TriangleAlert } from 'lucide-react';
import { useCreateCapa } from '../hooks/use_create_capa';

export default function CreateCapaPage() {
  const {
    title, setTitle,
    findingId, setFindingId,
    description, setDescription,
    actionPlan, setActionPlan,
    picId, setPicId,
    deadline, setDeadline,
    findings,
    pics,
    loadingOptions,
    findingsError,
    refreshFindings,
    titleError,
    descriptionError,
    actionPlanError,
    submitError,
    submitting,
    handleSubmit,
  } = useCreateCapa();

  return (
    <div className="page-container capa-page">
      <Link to="/capa" className="capa-back">
        <ArrowLeft size={18} /> Back to CAPA List
      </Link>
      <h1 className="capa-title">Create CAPA</h1>

      <form onSubmit={handleSubmit} className="capa-form-grid">
        <div className="capa-panel capa-form-main">
          <div className="form-group">
            <label>TITLE</label>
            <input
              type="text"
              placeholder="Enter CAPA title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={titleError ? 'input-error' : ''}
            />
            {titleError && <p className="error-text">{titleError}</p>}
          </div>

          <div className="form-group">
            <label>LINKED FINDING</label>
            {loadingOptions && <p className="text-muted">Memuat finding...</p>}
            {!loadingOptions && findingsError && (
              <div className="capa-finding-warning">
                <span>
                  <TriangleAlert size={16} /> {findingsError}
                </span>
                <button type="button" className="capa-refresh-btn" onClick={refreshFindings}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
            )}
            {!loadingOptions && findings.length > 0 && (
              <select value={findingId} onChange={(e) => setFindingId(e.target.value)}>
                <option value="">Select Finding</option>
                {findings.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.clauseRef ? `${f.clauseRef} - ${f.title}` : f.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>DESCRIPTION</label>
            <textarea
              rows={5}
              placeholder="Detail the corrective action..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={descriptionError ? 'input-error' : ''}
            />
            {descriptionError && <p className="error-text">{descriptionError}</p>}
          </div>

          <div className="form-group">
            <label>ACTION PLAN</label>
            <textarea
              rows={5}
              placeholder="Step-by-step action plan..."
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              className={actionPlanError ? 'input-error' : ''}
            />
            {actionPlanError && <p className="error-text">{actionPlanError}</p>}
          </div>
        </div>

        <div className="capa-form-side">
          <div className="capa-panel">
            <div className="form-group">
              <label>PERSON IN CHARGE</label>
              <select value={picId} onChange={(e) => setPicId(e.target.value)}>
                <option value="">Select Assignee</option>
                {pics.map((p) => (
                  <option key={p.id} value={p.id}>{p.fullName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>TARGET DATE</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="capa-guidelines-box">
            <h3>Submission Guidelines</h3>
            <p>
              Ensure all required fields are filled completely before submitting. Incomplete
              CAPAs may be rejected by the Quality Assurance team.
            </p>
          </div>

          {submitError && <p className="error-text">{submitError}</p>}

          <button type="submit" className="capa-btn-submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit CAPA'} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
