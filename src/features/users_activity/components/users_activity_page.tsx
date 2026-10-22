import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  ChevronDown, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Check
} from 'lucide-react';
import { useUsersActivity } from '../hooks/use_users_activity';

const ROLE_OPTIONS = [
  'All Roles',
  'Quality Manager',
  'Auditor Internal',
  'Auditee',
  'Admin',
];

export default function UsersActivityPage() {
  const navigate = useNavigate();
  const { activities, loading } = useUsersActivity();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Dropdown state
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter in memory
  const filteredActivities = useMemo(() => {
    let list = [...activities];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          a.userName.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term) ||
          a.activityName.toLowerCase().includes(term) ||
          a.role.toLowerCase().includes(term)
      );
    }

    if (selectedRole && selectedRole !== 'All Roles') {
      const roleFilter = selectedRole.toLowerCase();
      list = list.filter((a) => a.role.toLowerCase() === roleFilter);
    }

    return list;
  }, [activities, searchTerm, selectedRole]);

  // Paginated slice
  const totalResults = filteredActivities.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredActivities.slice(start, start + pageSize);
  }, [filteredActivities, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setCurrentPage(1);
  };

  const getRoleBadgeStyle = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('manager')) return 'bg-[#F5F3FF] text-[#7C3AED]';
    if (r.includes('internal')) return 'bg-[#EFF6FF] text-[#2563EB]';
    if (r.includes('admin')) return 'bg-[#FFF7ED] text-[#EA580C]';
    return 'bg-[#F0FDF4] text-[#16A34A]'; // Auditee default
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarBg = (name: string, role: string) => {
    const r = role.toLowerCase();
    if (r.includes('manager')) return 'bg-[#F5F3FF] text-[#7C3AED]';
    if (r.includes('internal')) return 'bg-[#EFF6FF] text-[#2563EB]';
    return 'bg-[#F0FDF4] text-[#16A34A]';
  };

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

  return (
    <div className="max-w-full m-0 text-left">
      {/* Back to Dashboard Link */}
      <div className="mb-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-[13.5px] font-medium no-underline transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F294A] tracking-tight m-0 mb-1.5">
          Users’ Activity
        </h1>
        <p className="text-slate-500 text-[14px] m-0">
          Track user actions and activity history
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-200/80 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3.5 flex-1 min-w-[300px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-[340px]">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name or activity"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3.5 py-2 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Select Role Dropdown */}
          <div className="relative" ref={roleDropdownRef}>
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-[14px] text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
            >
              {/* Custom 3-bar list filter icon */}
              <svg className="w-4 h-4 text-slate-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="4" x2="4" y2="20" />
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="15" y2="12" />
                <line x1="4" y1="17" x2="10" y2="17" />
              </svg>
              <span className="font-normal text-slate-700">
                {selectedRole || 'Select Role'}
              </span>
              <ChevronDown size={15} className={`text-slate-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-[200px] bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-[fadeIn_0.15s_ease-out]">
                {ROLE_OPTIONS.map((role) => {
                  const isSelected = (selectedRole === '' && role === 'All Roles') || selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role === 'All Roles' ? '' : role);
                        setCurrentPage(1);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-[13.5px] text-left border-none bg-transparent cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{role}</span>
                      {isSelected && <Check size={14} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={handleResetFilters}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-[14px] font-normal bg-transparent border-none cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <RotateCcw size={15} />
          <span>Reset</span>
        </button>
      </div>

      {/* Users Activity Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 overflow-hidden">
        {loading && (
          <div className="py-12 text-center text-slate-400 text-sm">
            Loading users' activity...
          </div>
        )}

        {!loading && paginatedActivities.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            No users' activity found matching your filters.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider w-[260px]">
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
              {paginatedActivities.map((item) => {
                const badgeStyle = getRoleBadgeStyle(item.role);
                const avatarStyle = getAvatarBg(item.userName, item.role);

                return (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/user-overview/${item.userId}`)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Username with Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ${avatarStyle}`}>
                          {getInitials(item.userName)}
                        </div>
                        <span className="font-semibold text-slate-900 text-[13.5px] group-hover:text-blue-600 transition-colors max-w-[200px] break-words [overflow-wrap:anywhere] [word-break:break-word]">
                          {item.userName}
                        </span>
                      </div>
                    </td>

                    {/* Role Pill */}
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold ${badgeStyle}`}>
                        {item.role}
                      </span>
                    </td>

                    {/* Activity Description */}
                    <td className="px-6 py-4 text-[13px] text-slate-600 font-normal truncate max-w-[360px]" title={item.description}>
                      {item.description}
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-4 text-right text-[12.5px] text-slate-400 font-normal whitespace-nowrap">
                      {formatChangeDate(item.timestamp)}
                    </td>
                  </tr>
                );
              })}
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
