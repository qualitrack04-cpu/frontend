import { Link } from 'react-router-dom';
import { CreditCard, RefreshCw, CheckCircle2, PauseCircle, Trash2, Settings } from 'lucide-react';
import type { AdminRecentChange } from '../api/admin_api';

interface AdminRecentChangesProps {
  changes: AdminRecentChange[];
}

const DEFAULT_CHANGES: AdminRecentChange[] = [
  {
    action: 'CREATE',
    entityType: 'Department Management',
    entityName: 'QC',
    description: 'QC Department added',
    timestamp: '2026-10-19T15:30:00Z',
  },
  {
    action: 'UPDATE',
    entityType: 'User Management',
    entityName: 'Budi',
    description: 'Role of Budi changed to Auditor',
    timestamp: '2026-10-19T14:30:00Z',
  },
  {
    action: 'ACTIVATE',
    entityType: 'SPC Unit Management',
    entityName: 'Celsius',
    description: 'SPC Unit Celsius activated',
    timestamp: '2026-06-22T10:15:00Z',
  },
  {
    action: 'DEACTIVATE',
    entityType: 'ISO Standard Management',
    entityName: 'ISO 22000',
    description: 'ISO 22000 Standard deactivated',
    timestamp: '2026-04-29T11:20:00Z',
  },
  {
    action: 'DELETE',
    entityType: 'Checklist Template Management',
    entityName: 'GMP checklist',
    description: 'GMP checklist item removed',
    timestamp: '2026-03-29T09:15:00Z',
  },
];

function getIconAndColor(change: AdminRecentChange) {
  const desc = (change.description || '').toLowerCase();
  const type = (change.entityType || '').toLowerCase();
  const action = (change.action || '').toLowerCase();

  if (type.includes('department') || desc.includes('department')) {
    return { icon: CreditCard, color: 'bg-[#E0F2FE] text-[#0284C7]' };
  }
  if (type.includes('user') || desc.includes('role') || action === 'update') {
    return { icon: RefreshCw, color: 'bg-[#FEF3C7] text-[#D97706]' };
  }
  if (action === 'deactivate' || desc.includes('deactivated')) {
    return { icon: PauseCircle, color: 'bg-[#F1F5F9] text-[#64748B]' };
  }
  if (action === 'activate' || desc.includes('activated')) {
    return { icon: CheckCircle2, color: 'bg-[#DCFCE7] text-[#16A34A]' };
  }
  if (action === 'delete' || desc.includes('removed') || desc.includes('deleted')) {
    return { icon: Trash2, color: 'bg-[#FEE2E2] text-[#DC2626]' };
  }
  return { icon: Settings, color: 'bg-slate-100 text-slate-500' };
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

export default function AdminRecentChanges({ changes }: AdminRecentChangesProps) {
  const effectiveChanges = changes && changes.length > 0 ? changes : DEFAULT_CHANGES;

  // Hanya tampilkan 5 perubahan paling terbaru
  const sortedChanges = [...effectiveChanges]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100">
      <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
        <h3 className="text-[16px] font-bold text-[#0f2c52] m-0">Recent Changes</h3>
        <Link to="/recent-changes" className="text-[13px] font-bold text-[#3b82f6] no-underline hover:underline">
          View All &rarr;
        </Link>
      </div>
      
      <div className="flex flex-col divide-y divide-slate-100">
        {sortedChanges.map((change, idx) => {
          const { icon: Icon, color } = getIconAndColor(change);
          return (
            <div key={idx} className="flex items-center px-6 py-4 hover:bg-slate-50/70 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mr-4 ${color}`}>
                <Icon size={19} strokeWidth={2} />
              </div>
              
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-[14px] font-bold text-slate-800 m-0 mb-1 truncate" title={change.description}>
                  {change.description}
                </h4>
                <p className="text-[12.5px] font-normal text-slate-400 m-0 truncate">
                  {change.entityType}
                </p>
              </div>
              
              <div className="text-[12.5px] font-normal text-slate-400 shrink-0">
                {formatRelativeTime(change.timestamp)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
