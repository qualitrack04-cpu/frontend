import { useState } from 'react';
import { useIsoStandards } from '../hooks/use_iso_standards';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ShieldCheck, 
  Leaf, 
  HardHat, 
  Lock, 
  Layers, 
  ClipboardList, 
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AddIsoModal from './add_iso_modal';
import EditIsoModal from './edit_iso_modal';
import DeleteIsoModal from './delete_iso_modal';
import TablePagination from '../../../shared/components/table_pagination';
import type { IsoStandard } from '../api/iso_standards_api';

interface IconConfig {
  icon: LucideIcon;
  bg: string;
  text: string;
}

export default function IsoStandardsPage() {
  const { data, loading, error, refetch } = useIsoStandards();

  // Pagination state (Max 7 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const [editingIso, setEditingIso] = useState<IsoStandard | null>(null);
  const [deletingIso, setDeletingIso] = useState<IsoStandard | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Helper to pick exact matching icon and color palette from reference image
  const getIsoIconConfig = (code: string): IconConfig => {
    const c = code.toLowerCase();
    if (c.includes('9001')) {
      return { icon: ShieldCheck, bg: 'bg-[#e0f2fe]', text: 'text-[#0284c7]' };
    }
    if (c.includes('14001')) {
      return { icon: Leaf, bg: 'bg-[#dcfce7]', text: 'text-[#16a34a]' };
    }
    if (c.includes('45001')) {
      return { icon: HardHat, bg: 'bg-[#fef3c7]', text: 'text-[#d97706]' };
    }
    if (c.includes('27001')) {
      return { icon: Lock, bg: 'bg-[#ede9fe]', text: 'text-[#6366f1]' };
    }
    if (c.includes('22000')) {
      return { icon: Layers, bg: 'bg-[#ffe4e6]', text: 'text-[#f43f5e]' };
    }
    if (c.includes('19011')) {
      return { icon: ClipboardList, bg: 'bg-[#f3e8ff]', text: 'text-[#9333ea]' };
    }
    if (c.includes('50001')) {
      return { icon: AlertTriangle, bg: 'bg-[#fef9c3]', text: 'text-[#ca8a04]' };
    }
    return { icon: ShieldCheck, bg: 'bg-[#e0f2fe]', text: 'text-[#2563eb]' };
  };

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

  const standards = data?.data || [];
  const totalResults = standards.length;
  const paginatedStandards = standards.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-full m-0 text-left">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F294A] tracking-tight m-0 mb-1.5">
            ISO Standarts Management
          </h1>
          <p className="text-slate-500 text-[14.5px] m-0">
            Manage ISO standards used in the QualiTrack audit process.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg text-[14px] transition-all shadow-sm active:scale-[0.98] cursor-pointer border-none"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Standart</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 overflow-hidden">
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
                <th className="px-6 py-4 text-[12px] font-bold text-slate-700 uppercase tracking-wider">
                  STANDART CODE & NAME
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
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                    Loading ISO standards...
                  </td>
                </tr>
              )}

              {!loading && standards.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                    No ISO standards found.
                  </td>
                </tr>
              )}

              {paginatedStandards.map((item) => {
                const iconConfig = getIsoIconConfig(item.code);
                const IconComponent = iconConfig.icon;

                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100/80 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* STANDART CODE & NAME Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl ${iconConfig.bg} ${iconConfig.text} flex items-center justify-center shrink-0 shadow-xs`}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-[14.5px]">
                            {item.code}
                          </div>
                          <div className="text-slate-400 text-[13px] font-normal">
                            ({item.name})
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* STATUS Column */}
                    <td className="px-6 py-4">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-rose-600">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* UPDATED Column */}
                    <td className="px-6 py-4 text-[13px] text-slate-500 font-normal">
                      {formatUpdatedDate(item.createdAt)}
                    </td>

                    {/* ACTION Column */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingIso(item)}
                          title="Edit ISO Standard"
                          className="w-8 h-8 rounded-lg bg-blue-50/90 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer border-none"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingIso(item)}
                          title="Deactivate ISO Standard"
                          className="w-8 h-8 rounded-lg bg-red-50/90 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors cursor-pointer border-none"
                        >
                          <Trash2 size={15} />
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

      {/* Add Modal */}
      {showAddModal && (
        <AddIsoModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingIso && (
        <EditIsoModal
          iso={editingIso}
          onClose={() => setEditingIso(null)}
          onSuccess={() => {
            setEditingIso(null);
            refetch();
          }}
        />
      )}

      {/* Deactivate Modal */}
      {deletingIso && (
        <DeleteIsoModal
          iso={deletingIso}
          onClose={() => setDeletingIso(null)}
          onSuccess={() => {
            setDeletingIso(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
