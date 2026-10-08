import AuditCard from './audit_card';
import { useAuditPlans } from '../hooks/use_audit_plans';
import { canManageAuditPlans } from '../../../shared/utils/role';

export default function AuditsPage() {
  const { audits, loading, error, tab, setTab, handleDelete } = useAuditPlans();

  return (
    <div className="max-w-full m-0 text-left">
      <h1 className="text-[3rem] font-bold text-[#0f2c52] m-0 mb-[20px] tracking-[-0.5px] leading-[1.25]">Audit Plan</h1>
      <p className="text-slate-500 mt-[-6px] mb-[16px] text-[13px]">Manage and track upcoming compliance audits.</p>

      <div className="inline-flex bg-[#f1f5f9] rounded-[10px] p-[4px] gap-[4px] mb-[24px]">
        <button
          className={`border-none px-[18px] py-[8px] rounded-[8px] text-[14px] font-semibold cursor-pointer ${tab === 'all' ? 'bg-white text-[#0f2c52] shadow-sm' : 'bg-transparent text-[#64748b]'}`}
          onClick={() => setTab('all')}
        >
          All Audits
        </button>
        <button
          className={`border-none px-[18px] py-[8px] rounded-[8px] text-[14px] font-semibold cursor-pointer ${tab === 'priority' ? 'bg-white text-[#0f2c52] shadow-sm' : 'bg-transparent text-[#64748b]'}`}
          onClick={() => setTab('priority')}
        >
          Priority
        </button>
      </div>

      {loading && <p className="text-slate-500">Memuat daftar audit...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && audits.length === 0 && (
        <p className="text-slate-500">
          Belum ada audit plan.{canManageAuditPlans() && ' Klik "+ New Audit" untuk membuat yang baru.'}
        </p>
      )}

      <div className="grid grid-cols-2 gap-[20px] max-[900px]:grid-cols-1">
        {audits.map((audit) => (
          <AuditCard key={audit.id} audit={audit} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}