import { useFetch } from '../../../shared/hooks/use_fetch';
import { getSummary } from '../api/dashboard_api';

export default function SummaryCards() {
  const { data, loading, error } = useFetch(getSummary);

  const items = data
    ? [
        { label: 'Active Audit', value: data.activeAudit, color: '#3b82f6' },
        { label: 'Total CAPA', value: data.totalCapa, color: '#a855f7' },
        { label: 'CAPA Open', value: data.capaOpen, color: '#22c55e' },
        { label: 'CAPA Overdue', value: data.capaOverdue, color: '#ef4444' },
      ]
    : [];

  return (
    <div className="flex flex-col">
      <p className="text-[11px] font-bold tracking-[0.8px] text-slate-500 mb-[4px] uppercase m-0">SUMMARY CARD</p>
      <div className="grid grid-cols-[1fr_1fr] gap-[12px]">
        {loading && <p className="text-slate-500 col-span-2">Loading summary...</p>}
        {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded-[8px] p-[10px_14px] my-[8px] text-[14px] col-span-2">{error}</p>}

        {items.map((item) => (
          <div key={item.label} className="bg-white border border-slate-200 border-t-[3px] rounded-[8px] p-[16px] text-center aspect-[3/4] flex flex-col items-center justify-center" style={{ borderTopColor: item.color }}>
            <span className="block text-[32px] font-bold text-[#0f2c52] my-[12px]">{item.value}</span>
            <span className="text-[14px] text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}