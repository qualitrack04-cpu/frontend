import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check } from 'lucide-react';
import { getSpcHistory, type SpcHistoryItem } from '../api/spc_api';
import { getStatusColor } from '../utils/status_color';
import { parseUtcDate } from '../../../shared/utils/date_utils';

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
  const d = parseUtcDate(iso) ?? new Date(iso);
  return d.toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function SpcHistoryPage() {
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [periodFilter, setPeriodFilter] = useState('All Time');
  const [items, setItems] = useState<SpcHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const [openPeriodDropdown, setOpenPeriodDropdown] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setOpenStatusDropdown(false);
      }
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setOpenPeriodDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        setError(err.response?.data?.message ?? 'Failed to load analysis history.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [statusFilter, periodFilter]);

  return (
    <div className="max-w-full m-0 text-left">
      <h1 className="text-[28px] font-bold text-[#0f2c52] !m-0 !mb-6">Analyses History</h1>

      <div className="flex flex-col sm:flex-row gap-[16px] mb-[24px]">
        {/* Analysis Status Dropdown */}
        <div className="flex-1 max-w-[280px] mb-0 flex flex-col gap-[8px]" ref={statusRef}>
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Analysis Status</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setOpenStatusDropdown((prev) => !prev);
                setOpenPeriodDropdown(false);
              }}
              className="p-[10px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full flex items-center justify-between cursor-pointer text-left"
            >
              <span className="truncate">{statusFilter}</span>
              <ChevronDown
                size={16}
                className={`text-[#64748b] transition-transform duration-200 shrink-0 ml-2 ${
                  openStatusDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openStatusDropdown && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 animate-[fadeIn_0.1s_ease-out]">
                {Object.keys(STATUS_MAP).map((status) => {
                  const isSelected = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setStatusFilter(status);
                        setOpenStatusDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 border-l-[3.5px] ${
                        isSelected
                          ? 'border-[#006AFF] bg-white font-semibold text-[#006AFF]'
                          : 'border-transparent bg-white text-slate-700 hover:border-[#006AFF] hover:text-[#006AFF] hover:bg-slate-50/50'
                      }`}
                    >
                      <span className="break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-normal flex-1">
                        {status}
                      </span>
                      {isSelected && <Check size={16} className="text-[#006AFF] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Period Dropdown */}
        <div className="flex-1 max-w-[280px] mb-0 flex flex-col gap-[8px]" ref={periodRef}>
          <label className="text-[13px] font-bold text-[#0f2c52] uppercase tracking-[0.5px]">Period</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setOpenPeriodDropdown((prev) => !prev);
                setOpenStatusDropdown(false);
              }}
              className="p-[10px_14px] border-[1.5px] border-[#e2e8f0] rounded-[8px] text-[14.5px] text-[#1e293b] bg-white outline-none focus:border-[#0f2c52] focus:ring-[3px] focus:ring-[rgba(15,44,82,0.1)] w-full flex items-center justify-between cursor-pointer text-left"
            >
              <span className="truncate">{periodFilter}</span>
              <ChevronDown
                size={16}
                className={`text-[#64748b] transition-transform duration-200 shrink-0 ml-2 ${
                  openPeriodDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openPeriodDropdown && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 animate-[fadeIn_0.1s_ease-out]">
                {Object.keys(PERIOD_MAP).map((period) => {
                  const isSelected = periodFilter === period;
                  return (
                    <button
                      key={period}
                      type="button"
                      onClick={() => {
                        setPeriodFilter(period);
                        setOpenPeriodDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 border-l-[3.5px] ${
                        isSelected
                          ? 'border-[#006AFF] bg-white font-semibold text-[#006AFF]'
                          : 'border-transparent bg-white text-slate-700 hover:border-[#006AFF] hover:text-[#006AFF] hover:bg-slate-50/50'
                      }`}
                    >
                      <span className="break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-normal flex-1">
                        {period}
                      </span>
                      {isSelected && <Check size={16} className="text-[#006AFF] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && <p className="text-[#64748b]">Loading analysis history...</p>}
      {error && <p className="text-[#dc2626] bg-[#fef2f2] p-[12px_16px] rounded-[8px] border border-[#fecaca] text-[14px] mb-[20px]">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-[#64748b]">No SPC analysis records saved yet.</p>
      )}

      <div className="flex flex-col gap-[16px]">
        {items.map((item) => (
          <div
            key={item.id}
            className="group bg-white border border-[#e2e8f0] rounded-[10px] p-[20px] flex justify-between items-center cursor-pointer transition-all duration-200 hover:border-[#0f2c52] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-[2px] overflow-hidden min-w-0 max-w-full"
            onClick={() => navigate(`/spc-analysis/history/${item.id}`)}
          >
            <div className="min-w-0 flex-1 pr-4">
              <h4 className="text-[16px] text-[#0f2c52] m-0 mb-[6px] font-bold break-words [overflow-wrap:anywhere] [word-break:break-word]">{item.productName}</h4>
              {item.description && <p className="text-[14px] text-[#475569] m-0 mb-[6px] break-words [overflow-wrap:anywhere] [word-break:break-word]">{item.description}</p>}
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