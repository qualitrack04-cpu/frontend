import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  SlidersHorizontal,
  ChevronDown, 
  RotateCcw, 
  Check
} from 'lucide-react';
import TablePagination from '../../../shared/components/table_pagination';
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
  const [statusFilter, setStatusFilter] = useState('');

  // Dropdown state
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state (Max 7 items per page to match User Management)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

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

    if (statusFilter) {
      list = list.filter((a) => (a.status || 'Active') === statusFilter);
    }

    return list;
  }, [activities, searchTerm, selectedRole, statusFilter]);

  // Paginated slice
  const totalResults = filteredActivities.length;
    const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredActivities.slice(start, start + pageSize);
  }, [filteredActivities, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setStatusFilter('');
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

  const getAvatarBg = (_name: string, role: string) => {
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
        <div className="flex flex-wrap items-center gap-3.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-[260px] md:w-[300px] shrink-0">
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
          <div className="relative shrink-0" ref={roleDropdownRef}>
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-[14px] text-slate-700 hover:border-slate-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal size={16} className="text-slate-600" />
              <span className="font-normal text-slate-700">
                {selectedRole || 'Select Role'}
              </span>
              <ChevronDown size={15} className={`text-slate-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-[190px] bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-[fadeIn_0.15s_ease-out]">
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

          {/* Status Segmented Pill */}
          <div className="flex items-center gap-1 border border-slate-200/90 rounded-full p-1 bg-white shrink-0">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1 text-[13px] font-medium rounded-full transition-all border cursor-pointer ${
                statusFilter === ''
                  ? 'bg-white border-blue-500 text-blue-600 shadow-xs'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('Active');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1 text-[13px] font-medium rounded-full transition-all border cursor-pointer ${
                statusFilter === 'Active'
                  ? 'bg-white border-blue-500 text-blue-600 shadow-xs'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('Inactive');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1 text-[13px] font-medium rounded-full transition-all border cursor-pointer ${
                statusFilter === 'Inactive'
                  ? 'bg-white border-blue-500 text-blue-600 shadow-xs'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={handleResetFilters}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-[14px] font-normal bg-transparent border-none cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
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
