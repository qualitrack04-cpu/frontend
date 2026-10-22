import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { useSpcUnits } from '../hooks/use_spc_units';
import { type SpcUnit } from '../api/spc_units_api';
import AddSpcUnitModal from './add_spc_unit_modal';
import EditSpcUnitModal from './edit_spc_unit_modal';
import DeleteSpcUnitModal from './delete_spc_unit_modal';
import TablePagination from '../../../shared/components/table_pagination';

export default function SpcUnitsPage() {
  const { units, loading, error, refetch } = useSpcUnits();

  // Pagination state (Max 7 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<SpcUnit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<SpcUnit | null>(null);

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

  const sortedUnits = [...units].sort((a, b) => {
    if (a.symbol.toLowerCase() === 'ppm') return -1;
    if (b.symbol.toLowerCase() === 'ppm') return 1;
    return a.name.localeCompare(b.name);
  });

  const totalResults = sortedUnits.length;
  const paginatedUnits = sortedUnits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-full m-0 text-left">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F294A] tracking-tight m-0 mb-1.5">
            SPC Unit Management
          </h1>
          <p className="text-slate-500 text-[14px] m-0">
            Manage ISO standards used in the QualiTrack audit process.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-[14px] transition-all shadow-sm active:scale-[0.98] cursor-pointer border-none self-start sm:self-auto shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add SPC Unit</span>
        </button>
      </div>

      {/* SPC Units Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 overflow-hidden mb-6">
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
                <th className="px-6 py-4.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  UNIT NAME
                </th>
                <th className="px-6 py-4.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider w-[120px]">
                  SYMBOL
                </th>
                <th className="px-6 py-4.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  DESCRIPTION
                </th>
                <th className="px-6 py-4.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider w-[120px]">
                  STATUS
                </th>
                <th className="px-6 py-4.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider w-[140px]">
                  UPDATED
                </th>
                <th className="px-6 py-4.5 text-center text-[11px] font-bold text-slate-700 uppercase tracking-wider w-[120px]">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && !units.length && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    Loading SPC units...
                  </td>
                </tr>
              )}

              {!loading && units.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No SPC units found.
                  </td>
                </tr>
              )}

              {paginatedUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* UNIT NAME */}
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-800 text-[14px]">
                      {unit.name}
                    </span>
                  </td>

                  {/* SYMBOL */}
                  <td className="px-6 py-4">
                    <span className="text-slate-600 text-[14px]">
                      {unit.symbol}
                    </span>
                  </td>

                  {/* DESCRIPTION */}
                  <td className="px-6 py-4">
                    <span className="text-slate-500 text-[13.5px] font-normal line-clamp-2">
                      {unit.description || '-'}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-[13px] font-medium">
                      <span className={`w-2 h-2 rounded-full ${unit.isActive ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></span>
                      <span className={unit.isActive ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                        {unit.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </span>
                  </td>

                  {/* UPDATED */}
                  <td className="px-6 py-4 text-[12.5px] text-slate-400 font-normal">
                    {formatUpdatedDate(unit.updatedAt || unit.createdAt)}
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingUnit(unit)}
                        title="Edit SPC Unit"
                        className="w-8 h-8 rounded-lg bg-[#EFF6FF] hover:bg-blue-100 text-[#3B82F6] flex items-center justify-center transition-colors cursor-pointer border-none"
                      >
                        <Pencil size={15} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingUnit(unit)}
                        title="Delete SPC Unit"
                        className="w-8 h-8 rounded-lg bg-[#FEF2F2] hover:bg-red-100 text-[#EF4444] flex items-center justify-center transition-colors cursor-pointer border-none"
                      >
                        <Trash2 size={15} strokeWidth={2} />
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

      {/* Add SPC Unit Modal */}
      {showAddModal && (
        <AddSpcUnitModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
        />
      )}

      {/* Edit SPC Unit Modal */}
      {editingUnit && (
        <EditSpcUnitModal
          unit={editingUnit}
          onClose={() => setEditingUnit(null)}
          onSuccess={() => {
            setEditingUnit(null);
            refetch();
          }}
        />
      )}

      {/* Delete SPC Unit Modal */}
      {deletingUnit && (
        <DeleteSpcUnitModal
          unit={deletingUnit}
          onClose={() => setDeletingUnit(null)}
          onSuccess={() => {
            setDeletingUnit(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
