import { Link } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  Activity, 
  Users, 
  CheckSquare, 
  RefreshCw, 
  CheckCircle2, 
  PauseCircle, 
  Trash2, 
  Settings 
} from 'lucide-react';
import type { AdminRecentChange } from '../api/admin_api';
import { formatUpdatedDate as formatRelativeTime, parseUtcDate } from '../../../shared/utils/date_utils';

interface AdminRecentChangesProps {
  changes: AdminRecentChange[];
  loading?: boolean;
}

function getIconAndColor(change: AdminRecentChange) {
  const desc = (change.description || '').toLowerCase();
  const type = (change.entityType || '').toLowerCase();
  const action = (change.action || '').toLowerCase();

  // 1. Deactivated
  if (action === 'deactivate' || desc.includes('deactivated') || desc.includes('menonaktifkan')) {
    return { icon: PauseCircle, color: 'bg-[#F1F5F9] text-[#64748B]' };
  }
  // 2. Activated
  if (action === 'activate' || desc.includes('activated') || desc.includes('mengaktifkan')) {
    return { icon: CheckCircle2, color: 'bg-[#DCFCE7] text-[#16A34A]' };
  }
  // 3. Removed / Delete
  if (action === 'delete' || desc.includes('removed') || desc.includes('deleted') || desc.includes('menghapus')) {
    return { icon: Trash2, color: 'bg-[#FEE2E2] text-[#DC2626]' };
  }
  // 4. Role changed / Updated
  if (action === 'update' || desc.includes('role') || desc.includes('mengubah') || desc.includes('updated')) {
    return { icon: RefreshCw, color: 'bg-[#FEF3C7] text-[#D97706]' };
  }

  // 5. Create / Add (spesifik per modul)
  if (type.includes('department') || desc.includes('department') || desc.includes('departemen')) {
    return { icon: Building2, color: 'bg-[#E0F2FE] text-[#0284C7]' };
  }
  if (type.includes('iso') || desc.includes('iso')) {
    return { icon: ShieldCheck, color: 'bg-[#EEF2FF] text-[#4F46E5]' };
  }
  if (type.includes('spc') || desc.includes('spc')) {
    return { icon: Activity, color: 'bg-[#F0FDF4] text-[#16A34A]' };
  }
  if (type.includes('user') || desc.includes('user')) {
    return { icon: Users, color: 'bg-[#EFF6FF] text-[#2563EB]' };
  }
  if (type.includes('template') || type.includes('checklist') || desc.includes('checklist') || desc.includes('template')) {
    return { icon: CheckSquare, color: 'bg-[#FAF5FF] text-[#9333EA]' };
  }

  return { icon: Settings, color: 'bg-slate-100 text-slate-500' };
}


export default function AdminRecentChanges({ changes, loading = false }: AdminRecentChangesProps) {
  // Hanya tampilkan 5 perubahan paling terbaru
  const sortedChanges = [...(changes ?? [])]
    .sort((a, b) => {
      const timeA = parseUtcDate(a.timestamp)?.getTime() ?? new Date(a.timestamp).getTime();
      const timeB = parseUtcDate(b.timestamp)?.getTime() ?? new Date(b.timestamp).getTime();
      return timeB - timeA;
    })
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
        {loading && sortedChanges.length === 0 && (
          <div className="px-6 py-10 text-center text-[13px] text-slate-400">
            Loading changes...
          </div>
        )}

        {!loading && sortedChanges.length === 0 && (
          <div className="px-6 py-10 text-center text-[13px] text-slate-400">
            No recent changes found.
          </div>
        )}

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
