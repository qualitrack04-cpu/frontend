import { useState, useMemo, useRef, useEffect } from 'react';
import { useUsers } from '../hooks/use_users';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  RotateCcw, 
  Plus, 
  Pencil, 
  Trash2, 
  Check,
  AlertCircle
} from 'lucide-react';
import { fileUrl } from '../../../shared/utils/file_url';
import EditUserModal from './edit_user_modal';
import AddUserModal from './add_user_modal';
import DeleteUserModal from './delete_user_modal';
import TablePagination from '../../../shared/components/table_pagination';
import type { User } from '../api/users_api';

const ROLE_OPTIONS = [
  { value: '', label: 'Select Role' },
  { value: 'QualityManager', label: 'Quality Manager' },
  { value: 'AuditorInternal', label: 'Auditor Internal' },
  { value: 'Auditee', label: 'Auditee' },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Role dropdown open state
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state (Max 7 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data, loading, error, refetch } = useUsers(debouncedSearch, roleFilter, statusFilter);

  // In-memory search refinement for email and name
  const filteredUsers = useMemo(() => {
    if (!data?.data) return [];
    let list = [...data.data];

    // Admin should NOT be displayed in user management list
    list = list.filter((u) => u.role?.toLowerCase() !== 'admin');

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }

    if (roleFilter) {
      list = list.filter((u) => u.role === roleFilter);
    }

    if (statusFilter) {
      list = list.filter((u) => u.status === statusFilter);
    }

    return list;
  }, [data, searchTerm, roleFilter, statusFilter]);

  // Paginated slice
  const totalResults = filteredUsers.length;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Format updated date (e.g., "Today, 14:30" or "22 December 2026")
  const formatUpdatedDate = (dateStr: string) => {
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'QualityManager':
        return 'bg-[#FAF5FF] text-[#9333EA] border-[#F3E8FF]';
      case 'AuditorInternal':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]';
      case 'Auditee':
        return 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]';
      case 'Admin':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'QualityManager':
        return 'Quality Manager';
      case 'AuditorInternal':
        return 'Auditor Internal';
      case 'Auditee':
        return 'Auditee';
      case 'Admin':
        return 'Admin';
      default:
        return role;
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };



  return (
    <div className="max-w-full m-0 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F294A] tracking-tight m-0 mb-1.5">
            User Management
          </h1>
          <p className="text-slate-500 text-[14.5px] m-0">
            Manage users and their access to the QualiTrack system.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg text-[14px] transition-all shadow-sm active:scale-[0.98] cursor-pointer border-none"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add User</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-200/80 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3.5 flex-1 min-w-[300px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-[340px]">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search change"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3.5 py-2 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Role Dropdown */}
          <div className="relative" ref={roleDropdownRef}>
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-[14px] text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={16} className="text-slate-600" />
              <span className="font-normal text-slate-700">
                {roleFilter ? getRoleLabel(roleFilter) : 'Select Role'}
              </span>
              <ChevronDown size={15} className={`text-slate-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-[190px] bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-[fadeIn_0.15s_ease-out]">
                {ROLE_OPTIONS.map((opt) => {
                  const isSelected = roleFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setRoleFilter(opt.value);
                        setCurrentPage(1);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-[13.5px] text-left border-none bg-transparent cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={14} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status Segmented Pill */}
          <div className="flex items-center gap-1 border border-slate-200/90 rounded-full p-1 bg-white">
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

      {/* Data Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 overflow-hidden">
        {error && (
          <div className="p-4 mx-6 my-4 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[12px] font-bold text-slate-700 uppercase tracking-wider">
                  USERNAME
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-700 uppercase tracking-wider">
                  EMAIL
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-700 uppercase tracking-wider">
                  ROLE
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-700 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-slate-700 uppercase tracking-wider">
                  UPDATED
                </th>
                <th className="px-6 py-4 text-center text-[12px] font-bold text-slate-700 uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !data && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    Loading users...
                  </td>
                </tr>
              )}

              {!loading && paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No users found matching your filters.
                  </td>
                </tr>
              )}

              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100/80 hover:bg-slate-50/70 transition-colors"
                >
                  {/* USERNAME Column */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#eef2ff] border border-[#bfdbfe] text-[#2563eb] flex items-center justify-center shrink-0 overflow-hidden font-bold text-xs shadow-xs">
                        {user.profilePhotoUrl ? (
                          <img
                            src={fileUrl(user.profilePhotoUrl)}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-5 h-5 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        )}
                      </div>
                      <span className="font-semibold text-slate-800 text-[14px] max-w-[240px] break-words [overflow-wrap:anywhere] [word-break:break-word]">
                        {user.fullName}
                      </span>
                    </div>
                  </td>

                  {/* EMAIL Column */}
                  <td className="px-6 py-3.5 text-[13.5px] text-slate-600 font-normal max-w-[240px] break-words [overflow-wrap:anywhere] [word-break:break-word]">
                    {user.email}
                  </td>

                  {/* ROLE Column */}
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-block px-3 py-1 rounded-md text-[12px] font-semibold border ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>

                  {/* STATUS Column */}
                  <td className="px-6 py-3.5">
                    {user.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    ) : user.status === 'Inactive' ? (
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-rose-600">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        Inactive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-amber-600">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        {user.status}
                      </span>
                    )}
                  </td>

                  {/* UPDATED Column */}
                  <td className="px-6 py-3.5 text-[13px] text-slate-500 font-normal">
                    {formatUpdatedDate(user.createdAt)}
                  </td>

                  {/* ACTION Column */}
                  <td className="px-6 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingUser(user)}
                        title="Edit User"
                        className="w-8 h-8 rounded-lg bg-blue-50/90 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer border-none"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingUser(user)}
                        title="Deactivate User"
                        className="w-8 h-8 rounded-lg bg-red-50/90 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors cursor-pointer border-none"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            refetch();
          }}
        />
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
        />
      )}

      {/* Delete / Deactivate User Modal */}
      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onSuccess={() => {
            setDeletingUser(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
