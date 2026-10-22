import AdminSummaryCards from './admin_summary_cards';
import AdminUsersActivity from './admin_users_activity';
import AdminRecentChanges from './admin_recent_changes';
import { useAdminDashboard } from '../hooks/use_admin_dashboard';

export default function AdminDashboard() {
  const fullName = localStorage.getItem('fullName') || 'Admin';
  const { data, loading, error } = useAdminDashboard();

  // Dynamic proportion of greeting text to prevent overlapping and overflow
  const nameLength = fullName.trim().length;
  const headingSizeClass =
    nameLength > 30
      ? 'text-[20px] sm:text-[22px]'
      : nameLength > 20
      ? 'text-[24px] sm:text-[26px]'
      : 'text-[28px]';

  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-full m-0 text-left">
      <h1 className={`${headingSizeClass} font-bold text-[#0f2c52] !m-0 !mb-2 leading-[1.35] max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word]`}>
        Hello, {fullName}! <span className="inline-block">👋</span>
      </h1>
      <p className="text-slate-500 m-0 mb-[32px] text-[15px]">Welcome back to your dashboard</p>

      <AdminSummaryCards summary={data!} />

      <div className="mt-8 flex flex-col gap-8">
        <AdminUsersActivity activities={data?.recentActivities || []} />
        <AdminRecentChanges changes={data?.recentChanges || []} />
      </div>
    </div>
  );
}
