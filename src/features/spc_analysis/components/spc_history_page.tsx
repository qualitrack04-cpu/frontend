import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSpcHistory, type SpcHistoryItem } from '../api/spc_api';
import { getStatusColor } from '../utils/status_color';

const PERIOD_MAP: Record<string, string> = {
  'All Time': 'all',
  '3 Months': '3m',
  '6 Months': '6m',
  '1 Year': '1y',
};

const STATUS_MAP: Record<string, string> = {
  'All Status': '',
  'Process Capable': 'Process Capable',
  'Marginal': 'Marginal',
  'Not Capable': 'Not Capable',
  'Process Unstable': 'Process Unstable',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function SpcHistoryPage() {
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [periodFilter, setPeriodFilter] = useState('All Time');
  const [items, setItems] = useState<SpcHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const res = await getSpcHistory({
          period: PERIOD_MAP[periodFilter] ?? 'all',
          status: STATUS_MAP[statusFilter] || undefined,
        });
        setItems(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Gagal memuat riwayat analisis.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [statusFilter, periodFilter]);

  return (
    <div className="max-w-full m-0 text-left">
      <h1 className="text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6">Analyses History</h1>

      <div className="flex gap-[16px] mb-[24px]">
        <div className="flex-1 max-w-[250px] mb-0 flex flex-col gap-[8px]">
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Analysis Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-[10px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full">
            <option>All Status</option>
            <option>Process Capable</option>
            <option>Marginal</option>
            <option>Not Capable</option>
            <option>Process Unstable</option>
          </select>
        </div>

        <div className="flex-1 max-w-[250px] mb-0 flex flex-col gap-[8px]">
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Period</label>
          <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="p-[10px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full">
            <option>All Time</option>
            <option>3 Months</option>
            <option>6 Months</option>
            <option>1 Year</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-[#64748b]">Memuat riwayat analisis...</p>}
      {error && <p className="text-[#dc2626] bg-[#fef2f2] p-[12px_16px] rounded-[8px] border border-[#fecaca] text-[14px] mb-[20px]">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-[#64748b]">Belum ada analisis SPC yang tersimpan.</p>
      )}

      <div className="flex flex-col gap-[16px]">
        {items.map((item) => (
          <div
            key={item.id}
            className="group bg-white border border-[#e2e8f0] rounded-[10px] p-[20px] flex justify-between items-center cursor-pointer transition-all duration-200 hover:border-[#0f2c52] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-[2px]"
            onClick={() => navigate(`/spc-analysis/history/${item.id}`)}
          >
            <div>
              <h4 className="text-[16px] text-[#0f2c52] m-0 mb-[6px] font-bold">{item.productName}</h4>
              {item.description && <p className="text-[14px] text-[#475569] m-0 mb-[6px]">{item.description}</p>}
              <p className="text-[13px] text-[#64748b] m-0 mb-[12px]">{formatDate(item.analyzedAt)}</p>
              <div className="flex gap-[16px] mb-[12px]">
                <span className="text-[14px] font-semibold text-[#1e293b] bg-[#f1f5f9] p-[4px_10px] rounded-[6px]">Cp {item.cp}</span>
                <span className="text-[14px] font-semibold text-[#1e293b] bg-[#f1f5f9] p-[4px_10px] rounded-[6px]">Cpk {item.cpk}</span>
              </div>
              <span className={`inline-block p-[4px_10px] rounded-[12px] text-[12.5px] font-semibold ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
            <span className="text-[#94a3b8] text-[20px] transition-transform duration-200 group-hover:translate-x-[4px] group-hover:text-[#0f2c52]">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}