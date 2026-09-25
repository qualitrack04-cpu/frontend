import AuditCard from './audit_card';
import { useAuditPlans } from '../hooks/use_audit_plans';
import { canManageAuditPlans } from '../../../shared/utils/role';

export default function AuditsPage() {
  const { audits, loading, error, tab, setTab, handleDelete } = useAuditPlans();

  return (
    <div className="page-container">
      <h1>Audit Plan</h1>
      <p className="page-subtitle">Manage and track upcoming compliance audits.</p>

      <div className="audit-tabs">
        <button
          className={tab === 'all' ? 'audit-tab audit-tab--active' : 'audit-tab'}
          onClick={() => setTab('all')}
        >
          All Audits
        </button>
        <button
          className={tab === 'priority' ? 'audit-tab audit-tab--active' : 'audit-tab'}
          onClick={() => setTab('priority')}
        >
          Priority
        </button>
      </div>

      {loading && <p className="text-muted">Memuat daftar audit...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && audits.length === 0 && (
        <p className="text-muted">
          Belum ada audit plan.{canManageAuditPlans() && ' Klik "+ New Audit" untuk membuat yang baru.'}
        </p>
      )}

      <div className="audit-plan-grid">
        {audits.map((audit) => (
          <AuditCard key={audit.id} audit={audit} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}