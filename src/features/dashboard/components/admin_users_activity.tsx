import { Link, useNavigate } from 'react-router-dom';
import type { AdminActivity } from '../api/admin_api';
import { formatUpdatedDate as formatRelativeTime, parseUtcDate } from '../../../shared/utils/date_utils';

interface AdminUsersActivityProps {
  activities: AdminActivity[];
  loading?: boolean;
}

function getRoleBadge(roleOrType: string) {
  const r = (roleOrType || '').toLowerCase();
  if (r.includes('manager') || r.includes('verified')) return 'bg-[#F5F3FF] text-[#7C3AED]';
  if (r.includes('internal') || r.includes('finding')) return 'bg-[#EFF6FF] text-[#2563EB]';
  if (r.includes('admin')) return 'bg-[#FFF7ED] text-[#EA580C]';
  return 'bg-[#F0FDF4] text-[#16A34A]'; // Auditee / CapaAction
}

function formatRole(activityType: string) {
  if (activityType === 'CapaAction') return 'Auditee';
  if (activityType === 'CapaVerified') return 'Quality Manager';
  if (activityType === 'FindingReported') return 'Auditor Internal';
  return activityType || 'Auditee';
}

function extractUserName(item: AdminActivity): string {
  if (item.userName) return item.userName;
  const match = (item.description || '').match(/oleh\s+(.+)$/i);
  if (match && match[1]) return match[1].trim();
  return 'System User';
}

function getInitials(name: string) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function getAvatarBg(roleOrType: string) {
  const r = (roleOrType || '').toLowerCase();
  if (r.includes('manager') || r.includes('verified')) return 'bg-[#F5F3FF] text-[#7C3AED]';
  if (r.includes('internal') || r.includes('finding')) return 'bg-[#EFF6FF] text-[#2563EB]';
  return 'bg-[#F0FDF4] text-[#16A34A]';
}

export default function AdminUsersActivity({ activities, loading = false }: AdminUsersActivityProps) {
  const navigate = useNavigate();

  // Hanya tampilkan 5 aktivitas user paling terbaru
  const sortedActivities = [...(activities ?? [])]
    .sort((a, b) => {
      const timeA = parseUtcDate(a.timestamp)?.getTime() ?? new Date(a.timestamp).getTime();
      const timeB = parseUtcDate(b.timestamp)?.getTime() ?? new Date(b.timestamp).getTime();
      return timeB - timeA;
    })
    .slice(0, 5);

  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 overflow-hidden">
      <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
        <h3 className="text-[16px] font-bold text-[#0f2c52] m-0">Users' Activity</h3>
        <Link to="/users-activity" className="text-[13px] font-bold text-[#3b82f6] no-underline hover:underline">
          View All &rarr;
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider w-[250px]">
                USERNAME
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider w-[180px]">
                ROLE
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                ACTIVITY
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider w-[180px]">
                TIME
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && sortedActivities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-[13px] text-slate-400">
                  Loading activities...
                </td>
              </tr>
            )}

            {!loading && sortedActivities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-[13px] text-slate-400">
                  No users' activity found.
                </td>
              </tr>
            )}

            {sortedActivities.map((item, idx) => {
              const displayRole = formatRole(item.activityType);
              const badgeStyle = getRoleBadge(displayRole);
              const avatarStyle = getAvatarBg(displayRole);
              const displayName = extractUserName(item);

              const handleClickRow = () => {
                if (item.relatedId) {
                  if (item.activityType === 'FindingReported') {
                    navigate(`/findings/${item.relatedId}`);
                    return;
                  }
                  if (item.activityType === 'CapaAction' || item.activityType === 'CapaVerified') {
                    navigate(`/capa/${item.relatedId}`);
                    return;
                  }
                }
                navigate('/users-activity');
              };

              return (
                <tr
                  key={`${item.activityType}-${item.relatedId ?? ''}-${item.timestamp}-${idx}`}
                  onClick={handleClickRow}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ${avatarStyle}`}>
                        {getInitials(displayName)}
                      </div>
                      <span className="text-[14px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors max-w-[200px] break-words [overflow-wrap:anywhere] [word-break:break-word]">
                        {displayName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold ${badgeStyle}`}>
                      {displayRole}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-600 truncate max-w-[320px]" title={item.description}>
                    {item.description}
                  </td>
                  <td className="px-6 py-4 text-[12px] font-normal text-slate-400 whitespace-nowrap">
                    {formatRelativeTime(item.timestamp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}