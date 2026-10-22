import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useUserOverview } from '../hooks/use_users_activity';

export default function UserOverviewPage() {
  const { userId } = useParams<{ userId: string }>();
  const { overview, loading } = useUserOverview(userId);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const activities = overview?.recentActivities || [];
  const totalResults = activities.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return activities.slice(start, start + pageSize);
  }, [activities, currentPage, pageSize]);

  const formatChangeDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `Today, ${hours}:${minutes}`;
      }

      const day = d.getDate();
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      if (currentPage <= 3) {
        buttons.push(1, 2, 3, '..', totalPages);
      } else if (currentPage >= totalPages - 2) {
        buttons.push(1, '..', totalPages - 2, totalPages - 1, totalPages);
      } else {
        buttons.push(1, '..', currentPage, '..', totalPages);
      }
    }

    return buttons.map((btn, index) => {
      if (btn === '..') {
        return (
          <span key={`ellipsis-${index}`} className="w-7 h-7 flex items-center justify-center text-slate-400 text-sm select-none">
            ..
          </span>
        );
      }
      const pageNum = btn as number;
      const isActive = currentPage === pageNum;
      return (
        <button
          key={pageNum}
          type="button"
          onClick={() => setCurrentPage(pageNum)}
          className={`w-7 h-7 rounded-[6px] flex items-center justify-center font-medium text-xs transition-all border-none cursor-pointer ${
            isActive
              ? 'bg-[#0F172A] text-white shadow-xs font-semibold'
              : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {pageNum}
        </button>
      );
    });
  };

  const startRecord = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalResults);

  if (loading && !overview) {
    return <div className="p-8 text-center text-slate-400">Loading user overview...</div>;
  }

  const user = overview?.user || {
    fullName: 'Amir Lesley Oakwood',
    email: 'amiroakwood@gmail.com',
    role: 'Auditor Internal',
  };

  const successRate = overview?.successRate || { percentage: 90, achieved: 18, total: 20, target: 90 };
  const qualityScore = overview?.qualityScore || { score: 90, auditStatusText: 'No Audits Yet', onTimeAuditsText: '0/0 On-Time Audits' };

  // Donut SVG circumference calculation (r = 42, circumference ~ 264)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * qualityScore.score) / 100;

  return (
    <div className="max-w-full m-0 text-left">
      {/* Back to Users' Activity Link */}
      <div className="mb-4">
        <Link
          to="/users-activity"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-[13.5px] font-medium no-underline transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </Link>
      </div>

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F294A] tracking-tight m-0 mb-1.5">
          User Overview
        </h1>
        <p className="text-slate-500 text-[14px] m-0">
          Performance summary and recent activity
        </p>
      </div>

      {/* Top 3 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">
        {/* Card 1: User Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 flex flex-col items-center justify-center text-center overflow-hidden min-w-0">
          <div className="w-20 h-20 rounded-full bg-[#E0E7FF] border-2 border-slate-100 flex items-center justify-center overflow-hidden mb-3.5 shadow-sm shrink-0">
            {/* Custom SVG stylized penguin/avatar to match reference perfectly */}
            <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="46" fill="#64748B" />
              <ellipse cx="50" cy="62" rx="34" ry="28" fill="#FFFFFF" />
              <circle cx="40" cy="50" r="4.5" fill="#0F172A" />
              <circle cx="60" cy="50" r="4.5" fill="#0F172A" />
              <circle cx="41.5" cy="48.5" r="1.5" fill="#FFFFFF" />
              <circle cx="61.5" cy="48.5" r="1.5" fill="#FFFFFF" />
              <polygon points="50,53 44,61 56,61" fill="#F59E0B" />
            </svg>
          </div>

          <h2 className="font-bold text-[#0F294A] text-[18px] m-0 mb-1 w-full max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {user.fullName}
          </h2>
          <p className="text-slate-400 text-[13px] m-0 mb-3.5 w-full max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {user.email}
          </p>
          <span className="inline-block bg-[#EFF6FF] text-[#2563EB] px-3.5 py-1 rounded-full text-[12px] font-semibold">
            {user.role}
          </span>
        </div>

        {/* Card 2: Success Rate Card */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-slate-800 text-[15px] m-0">
              Success Rate
            </h3>
          </div>

          <div className="my-3">
            <div className="flex items-baseline">
              <span className="text-[44px] font-bold text-[#0F294A] leading-none tracking-tight">
                {successRate.percentage}
              </span>
              <span className="text-[28px] font-bold text-[#0F294A] ml-0.5">%</span>
            </div>

            <div className="mt-4">
              <div className="text-right text-[12px] font-bold text-[#16A34A] mb-1.5">
                {successRate.achieved}/{successRate.total}
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-[#16A34A] transition-all duration-500" 
                  style={{ width: `${(successRate.achieved / successRate.total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-[12px] text-slate-400 font-medium">
            Target: {successRate.target}%
          </div>
        </div>

        {/* Card 3: Quality Score Card */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <ShieldCheck size={18} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-slate-800 text-[15px] m-0">
              Quality Score
            </h3>
          </div>

          <div className="my-2 flex items-center justify-around gap-4">
            {/* Donut Ring Chart */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="8"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#2563EB"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[20px] font-bold text-[#0F294A]">
                  {qualityScore.score}%
                </span>
              </div>
            </div>

            {/* Right Status Badges */}
            <div className="flex flex-col items-start gap-1">
              <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full text-[12px] font-medium">
                {qualityScore.auditStatusText}
              </span>
              <span className="text-slate-500 text-[13px] font-medium">
                {qualityScore.onTimeAuditsText}
              </span>
            </div>
          </div>

          <div className="h-4"></div>
        </div>
      </div>

      {/* Bottom Card: Recent Activity Table */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-[16px] font-bold text-[#0F294A] m-0">
            Recent Activity
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider w-[240px]">
                  ACTIVITY NAME
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  DESCRIPTION
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-700 uppercase tracking-wider w-[150px]">
                  TIME
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedActivities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 text-[13.5px]">
                    {act.activityName}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-600 font-normal">
                    {act.description}
                  </td>
                  <td className="px-6 py-4 text-right text-[12.5px] text-slate-400 font-normal whitespace-nowrap">
                    {formatChangeDate(act.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4 text-[13.5px] text-slate-500 font-normal">
          <div>
            Showing <strong className="font-semibold text-slate-800">{startRecord}-{endRecord}</strong> of{' '}
            <strong className="font-semibold text-slate-800">{totalResults}</strong> results
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[13px]">Rows per page:</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[13px] text-slate-700 outline-none focus:border-blue-500 cursor-pointer font-medium appearance-none pr-6"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              >
                <ChevronLeft size={16} />
              </button>

              {renderPaginationButtons()}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
