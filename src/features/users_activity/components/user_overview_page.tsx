import { fileUrl } from '../../../shared/utils/file_url';
import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import TablePagination from '../../../shared/components/table_pagination';
import { useUserOverview } from '../hooks/use_users_activity';

export default function UserOverviewPage() {
  const { userId } = useParams<{ userId: string }>();
  const { overview, loading } = useUserOverview(userId);

  // Pagination state (Max 7 items per page to match User Management)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const activities = overview?.recentActivities || [];
  const totalResults = activities.length;

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
            {(user.photoUrl || (user as any).profilePhotoUrl) ? (
              <img
                src={fileUrl(user.photoUrl || (user as any).profilePhotoUrl)}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-10 h-10 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
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

        {/* Pagination Bar */}
        <TablePagination
          currentPage={currentPage}
          totalResults={totalResults}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
