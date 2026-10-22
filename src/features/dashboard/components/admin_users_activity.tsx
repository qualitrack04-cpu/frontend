import { Link, useNavigate } from 'react-router-dom';
import type { AdminActivity } from '../api/admin_api';

interface AdminUsersActivityProps {
  activities: AdminActivity[];
}

const DEFAULT_ACTIVITIES: AdminActivity[] = [
  {
    activityType: 'Quality Manager',
    description: 'Flagged major non-conformity in Packaging Area',
    userName: 'Quali Track',
    timestamp: '2026-10-19T15:30:00Z',
  },
  {
    activityType: 'Auditor Internal',
    description: 'Logged Minor NC: Spec sheet rev.3 missing signature',
    userName: 'Black Cuking',
    timestamp: '2026-10-19T14:30:00Z',
  },
  {
    activityType: 'Auditee',
    description: 'Submitted CAPA response for finding #F-2026-031',
    userName: 'Amir Oakwood',
    timestamp: '2026-07-22T10:00:00Z',
  },
  {
    activityType: 'Auditor Internal',
    description: 'Uploaded evidence for expired calibration in QC Lab',
    userName: 'Amara Jensen',
    timestamp: '2026-06-22T11:20:00Z',
  },
  {
    activityType: 'Auditee',
    description: 'Requested deadline extension for CAPA #F-028',
    userName: 'Marcus Kane',
    timestamp: '2026-04-29T09:15:00Z',
  },
];

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

function formatRelativeTime(dateString: string) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
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
    return dateString;
  }
}

export default function AdminUsersActivity({ activities }: AdminUsersActivityProps) {
  const navigate = useNavigate();

  // Gunakan data fallback jika data dari backend kosong
  const effectiveActivities = activities && activities.length > 0 ? activities : DEFAULT_ACTIVITIES;

  // Hanya tampilkan 5 aktivitas user paling terbaru
  const sortedActivities = [...effectiveActivities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
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
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedActivities.map((item, idx) => {
              const displayRole = formatRole(item.activityType);
              const badgeStyle = getRoleBadge(displayRole);
              const avatarStyle = getAvatarBg(displayRole);

              return (
                <tr 
                  key={idx} 
                  onClick={() => navigate('/user-overview')}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ${avatarStyle}`}>
                        {getInitials(item.userName)}
                      </div>
                      <span className="text-[14px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors max-w-[200px] break-words [overflow-wrap:anywhere] [word-break:break-word]">
                        {item.userName}
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
                  <td className="px-6 py-4 text-right text-[12px] font-normal text-slate-400 whitespace-nowrap">
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
