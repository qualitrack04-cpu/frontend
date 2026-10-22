import { useState } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ClipboardCheck, 
  Factory, 
  Package, 
  Warehouse, 
  Building2,
  AlertCircle
} from 'lucide-react';
import { useDepartments } from '../hooks/use_departments';
import { createDepartment, type DepartmentItem } from '../api/departments_api';
import EditDepartmentModal from './edit_department_modal';
import DeleteDepartmentModal from './delete_department_modal';
import TablePagination from '../../../shared/components/table_pagination';

export default function DepartmentsPage() {
  const { departments, loading, error, refetch } = useDepartments();

  // Pagination state (Max 7 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Form state for Add New Department
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptActive, setNewDeptActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modals state
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [deletingDept, setDeletingDept] = useState<DepartmentItem | null>(null);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) {
      setFormError('Nama departemen tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await createDepartment({
        name: newDeptName.trim(),
        isActive: newDeptActive,
      });
      setNewDeptName('');
      setNewDeptActive(true);
      refetch();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Gagal menambahkan departemen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDepartmentIconAndColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('control') || n.includes('quality') || n.includes('qc') || n.includes('assurance')) {
      return {
        icon: ClipboardCheck,
        bgColor: 'bg-[#E0F2FE]',
        iconColor: 'text-[#0284C7]',
      };
    }
    if (n.includes('production') || n.includes('factory')) {
      return {
        icon: Factory,
        bgColor: 'bg-[#FCE7F3]',
        iconColor: 'text-[#DB2777]',
      };
    }
    if (n.includes('pack') || n.includes('packaging')) {
      return {
        icon: Package,
        bgColor: 'bg-[#F3E8FF]',
        iconColor: 'text-[#9333EA]',
      };
    }
    if (n.includes('warehouse') || n.includes('storage')) {
      return {
        icon: Warehouse,
        bgColor: 'bg-[#D1FAE5]',
        iconColor: 'text-[#059669]',
      };
    }
    return {
      icon: Building2,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    };
  };

  const formatUpdatedDate = (dateStr?: string | null) => {
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

  const preferredOrder = [
    'quality control & assurance',
    'production',
    'packaging',
    'warehouse'
  ];

  const sortedDepartments = [...departments].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    const indexA = preferredOrder.findIndex((p) => nameA.includes(p) || p.includes(nameA));
    const indexB = preferredOrder.findIndex((p) => nameB.includes(p) || p.includes(nameB));

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const totalResults = sortedDepartments.length;
  const paginatedDepartments = sortedDepartments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-full m-0 text-left">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F294A] tracking-tight m-0 mb-1.5">
          Department Management
        </h1>
        <p className="text-slate-500 text-[14px] m-0">
          Manage ISO standards used in the QualiTrack audit process.
        </p>
      </div>

      {/* Department List Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 overflow-hidden mb-6">
        {error && (
          <div className="p-4 mx-6 my-4 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  DEPARTMENT CODE & NAME
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider w-[180px]">
                  STATUS
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider w-[180px]">
                  UPDATED
                </th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-700 uppercase tracking-wider w-[140px]">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && !departments.length && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                    Loading departments...
                  </td>
                </tr>
              )}

              {!loading && departments.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                    No departments found.
                  </td>
                </tr>
              )}

              {paginatedDepartments.map((dept) => {
                const { icon: Icon, bgColor, iconColor } = getDepartmentIconAndColor(dept.name);

                return (
                  <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* DEPARTMENT CODE & NAME */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgColor} ${iconColor}`}>
                          <Icon size={20} strokeWidth={2} />
                        </div>
                        <span className="font-bold text-slate-800 text-[14px]">
                          {dept.name}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-[13px] font-medium">
                        <span className={`w-2 h-2 rounded-full ${dept.isActive ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></span>
                        <span className={dept.isActive ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                          {dept.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </span>
                    </td>

                    {/* UPDATED */}
                    <td className="px-6 py-4 text-[12.5px] text-slate-400 font-normal">
                      {formatUpdatedDate(dept.updatedAt || dept.createdAt)}
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingDept(dept)}
                          title="Edit Department"
                          className="w-8 h-8 rounded-lg bg-[#EFF6FF] hover:bg-blue-100 text-[#3B82F6] flex items-center justify-center transition-colors cursor-pointer border-none"
                        >
                          <Pencil size={15} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingDept(dept)}
                          title="Delete Department"
                          className="w-8 h-8 rounded-lg bg-[#FEF2F2] hover:bg-red-100 text-[#EF4444] flex items-center justify-center transition-colors cursor-pointer border-none"
                        >
                          <Trash2 size={15} strokeWidth={2} />
                        </button>
                      </div>
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

      {/* Add New Department Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 p-6">
        <h2 className="text-[18px] font-bold text-[#0F294A] m-0 mb-1">
          Add New Department
        </h2>
        <p className="text-slate-400 text-[13px] m-0 mb-6 font-normal">
          Create a new department in the organization.
        </p>

        {formError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleAddDepartment} className="flex flex-wrap items-end gap-6">
          {/* Department Name Input */}
          <div className="flex-1 min-w-[280px]">
            <label className="block text-[13px] font-semibold text-slate-700 mb-2">
              Department Name
            </label>
            <input
              type="text"
              placeholder="Enter department name"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50"
            />
          </div>

          {/* Status Toggle */}
          <div className="shrink-0">
            <label className="block text-[13px] font-semibold text-slate-700 mb-2">
              Status
            </label>
            <div className="flex items-center gap-3 h-[42px]">
              <button
                type="button"
                onClick={() => setNewDeptActive(!newDeptActive)}
                disabled={isSubmitting}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border-none p-0.5 ${
                  newDeptActive ? 'bg-[#10B981]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    newDeptActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-[13.5px] font-semibold ${newDeptActive ? 'text-[#10B981]' : 'text-slate-500'}`}>
                {newDeptActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Add Department Button */}
          <div className="shrink-0">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-medium px-5 h-[42px] rounded-lg text-[14px] transition-all shadow-sm active:scale-[0.98] cursor-pointer border-none disabled:opacity-50"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>{isSubmitting ? 'Adding...' : 'Add Department'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Edit Department Modal */}
      {editingDept && (
        <EditDepartmentModal
          department={editingDept}
          onClose={() => setEditingDept(null)}
          onSuccess={() => {
            setEditingDept(null);
            refetch();
          }}
        />
      )}

      {/* Delete Department Modal */}
      {deletingDept && (
        <DeleteDepartmentModal
          department={deletingDept}
          onClose={() => setDeletingDept(null)}
          onSuccess={() => {
            setDeletingDept(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
