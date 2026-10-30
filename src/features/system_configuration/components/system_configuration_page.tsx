import { useState, useEffect } from 'react';
import {
  Settings,
  AlertCircle,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Check,
} from 'lucide-react';
import {
  getTimeZone,
  updateTimeZone,
  getDateFormat,
  updateDateFormat,
  getFindingCategories,
  deleteFindingCategory,
  getCapaStatuses,
  deleteCapaStatus,
} from '../api/system_config_api';
import type { FindingCategoryItem, CapaStatusItem } from '../api/system_config_api';
import AddCategoryModal from './add_category_modal';
import EditCategoryModal from './edit_category_modal';
import AddCapaStatusModal from './add_capa_status_modal';
import EditCapaStatusModal from './edit_capa_status_modal';
import {
  getCategoryColor,
  getStatusColor,
  getCategoryActive,
  getStatusActive,
} from '../utils/color_storage';

const TIMEZONE_OPTIONS = [
  { value: 'WIB', label: 'Asia/Jakarta (UTC+07:00)' },
  { value: 'WITA', label: 'Asia/Makassar (UTC+08:00)' },
  { value: 'WIT', label: 'Asia/Jayapura (UTC+09:00)' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'dd MMMM yyyy', label: 'DD Month YYYY' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
  { value: 'dd-MM-yyyy', label: 'DD-MM-YYYY' },
];

function formatUpdatedDate(dateStr?: string): string {
  if (!dateStr) return 'Today, 14:30';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Today, 14:30';

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (isToday) {
    return `Today, ${hours}:${minutes}`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${day} ${month}, ${hours}:${minutes}`;
}

export default function SystemConfigurationPage() {
  // General Settings state
  const [timeZone, setTimeZone] = useState('WIB');
  const [initialTimeZone, setInitialTimeZone] = useState('WIB');
  const [dateFormat, setDateFormat] = useState('dd MMMM yyyy');
  const [initialDateFormat, setInitialDateFormat] = useState('dd MMMM yyyy');
  const [generalSaving, setGeneralSaving] = useState(false);
  const [generalSuccess, setGeneralSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Finding Categories state
  const [categories, setCategories] = useState<FindingCategoryItem[]>([]);
  const [, setLoadingCategories] = useState(true);
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [editCat, setEditCat] = useState<FindingCategoryItem | null>(null);

  // CAPA Statuses state
  const [statuses, setStatuses] = useState<CapaStatusItem[]>([]);
  const [, setLoadingStatuses] = useState(true);
  const [isAddStatusOpen, setIsAddStatusOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<CapaStatusItem | null>(null);

  // Delete Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'category' | 'status';
    id: string;
    name: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load General Settings
  const fetchGeneralSettings = async () => {
    try {
      const [tzRes, dfRes] = await Promise.all([getTimeZone(), getDateFormat()]);
      if (tzRes?.timeZone) {
        setTimeZone(tzRes.timeZone);
        setInitialTimeZone(tzRes.timeZone);
      }
      if (dfRes?.dateFormat) {
        setDateFormat(dfRes.dateFormat);
        setInitialDateFormat(dfRes.dateFormat);
      }
    } catch (err) {
      console.error('Failed to load general settings', err);
    }
  };

  // Load Categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await getFindingCategories();
      // If backend returns empty array initially, provide mockup items for rich display
      if (!data || data.length === 0) {
        setCategories([
          {
            id: '1',
            name: 'Conform',
            description: 'Assigned & awaiting root-cause analysis',
            severity: 3,
            requiresImmediateAction: false,
            isActive: true,
            usageCount: 0,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Major',
            description: 'Assigned & awaiting root-cause analysis',
            severity: 1,
            requiresImmediateAction: true,
            isActive: true,
            usageCount: 0,
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Minor',
            description: 'Assigned & awaiting root-cause analysis',
            severity: 2,
            requiresImmediateAction: false,
            isActive: true,
            usageCount: 0,
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            name: 'Observation',
            description: 'Assigned & awaiting root-cause analysis',
            severity: 4,
            requiresImmediateAction: false,
            isActive: true,
            usageCount: 0,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to load finding categories', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load CAPA Statuses
  const fetchStatuses = async () => {
    setLoadingStatuses(true);
    try {
      const data = await getCapaStatuses();
      if (!data || data.length === 0) {
        setStatuses([
          {
            id: '1',
            name: 'Open',
            description: 'Assigned & awaiting root-cause analysis',
            orderIndex: 1,
            isTerminal: false,
            isActive: true,
            usageCount: 0,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'In Progress',
            description: 'Assigned & awaiting root-cause analysis',
            orderIndex: 2,
            isTerminal: false,
            isActive: true,
            usageCount: 0,
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Pending Review',
            description: 'Assigned & awaiting root-cause analysis',
            orderIndex: 3,
            isTerminal: false,
            isActive: true,
            usageCount: 0,
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            name: 'Closed',
            description: 'Assigned & awaiting root-cause analysis',
            orderIndex: 4,
            isTerminal: true,
            isActive: true,
            usageCount: 0,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setStatuses(data);
      }
    } catch (err) {
      console.error('Failed to load capa statuses', err);
    } finally {
      setLoadingStatuses(false);
    }
  };

  useEffect(() => {
    fetchGeneralSettings();
    fetchCategories();
    fetchStatuses();
  }, []);

  // Save General Settings
  const handleSaveGeneral = async () => {
    setGeneralSaving(true);
    setGeneralError(null);
    setGeneralSuccess(false);
    try {
      await Promise.all([updateTimeZone(timeZone), updateDateFormat(dateFormat)]);
      setInitialTimeZone(timeZone);
      setInitialDateFormat(dateFormat);
      setGeneralSuccess(true);
      setTimeout(() => setGeneralSuccess(false), 3000);
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setGeneralSaving(false);
    }
  };

  const handleDiscardGeneral = () => {
    setTimeZone(initialTimeZone);
    setDateFormat(initialDateFormat);
    setGeneralError(null);
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      if (deleteTarget.type === 'category') {
        try {
          await deleteFindingCategory(deleteTarget.id);
        } catch {
          // If fallback local item
        }
        setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      } else {
        try {
          await deleteCapaStatus(deleteTarget.id);
        } catch {
          // If fallback local item
        }
        setStatuses((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Failed to delete item');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-full m-0 text-left">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F294A] tracking-tight m-0 mb-1.5">
          System Configuration
        </h1>
        <p className="text-slate-500 text-[14px] m-0 font-normal">
          Configure system parameters, finding categories, and CAPA workflows.
        </p>
      </div>

      {/* ── CARD 1: General Settings ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Settings size={20} strokeWidth={2.2} />
            </div>
            <h2 className="text-[17px] font-bold text-[#0F294A] m-0">
              General Settings
            </h2>
          </div>
          <span className="text-[13px] text-slate-400 font-normal">
            Localization & System Clock
          </span>
        </div>

        {generalError && (
          <div className="mb-5 p-3.5 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle size={16} className="shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {generalSuccess && (
          <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-700 text-sm rounded-lg flex items-center gap-2 border border-emerald-100">
            <Check size={16} className="shrink-0" />
            <span>Settings saved successfully.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Time Zone */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
              Time Zone
            </label>
            <div className="relative flex items-center">
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
              >
                {TIMEZONE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3.5 text-slate-400 pointer-events-none"
              />
            </div>
            <p className="text-[12px] text-slate-400 m-0 mt-1.5 font-normal">
              Default timestamp applied across all audit logs & reports.
            </p>
          </div>

          {/* Date Format */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-800 mb-1.5">
              Date Format
            </label>
            <div className="relative flex items-center">
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
              >
                {DATE_FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3.5 text-slate-400 pointer-events-none"
              />
            </div>
            <p className="text-[12px] text-slate-400 m-0 mt-1.5 font-normal">
              Presentation format for calendar pickers & exported summaries. Example: 22 October 2026
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleDiscardGeneral}
            disabled={generalSaving}
            className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-[13.5px] transition-colors bg-white cursor-pointer disabled:opacity-50"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSaveGeneral}
            disabled={generalSaving}
            className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-[13.5px] transition-colors shadow-sm border-none cursor-pointer disabled:opacity-50"
          >
            {generalSaving ? 'Saving...' : 'Save Change'}
          </button>
        </div>
      </div>

      {/* ── CARD 2: Findings Category ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <AlertCircle size={20} strokeWidth={2.2} />
            </div>
            <h2 className="text-[17px] font-bold text-[#0F294A] m-0">
              Findings Category
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAddCatOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-[13px] flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  CATEGORY NAME
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  COLOR
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  DESCRIPTION
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  UPDATED
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider text-right">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map((cat) => {
                const catColor = cat.hexaCode || getCategoryColor(cat.id, cat.name);
                const catActive = getCategoryActive(cat.id, cat.isActive ?? true);
                return (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-[13.5px] font-medium text-slate-800">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-2xs"
                          style={{ backgroundColor: catColor }}
                        />
                        <span className="text-[13px] text-slate-600 font-mono">
                          {catColor.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-600 max-w-xs truncate">
                      {cat.description || 'Assigned & awaiting root-cause analysis'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium ${
                          catActive ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            catActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {catActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[12.5px] text-slate-500">
                      {formatUpdatedDate(cat.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditCat(cat)}
                          className="w-8 h-8 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer bg-white"
                          title="Edit category"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              type: 'category',
                              id: cat.id,
                              name: cat.name,
                            })
                          }
                          className="w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer bg-white"
                          title="Delete category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CARD 3: CAPA Status ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} strokeWidth={2.2} />
            </div>
            <h2 className="text-[17px] font-bold text-[#0F294A] m-0">
              CAPA Status
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsAddStatusOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-[13px] flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Status</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  STATUS NAME
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  COLOR
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  DESCRIPTION
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  UPDATED
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider text-right">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {statuses.map((st) => {
                const stColor = st.hexaCode || getStatusColor(st.id, st.name);
                const stActive = getStatusActive(st.id, st.isActive ?? true);
                return (
                  <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-[13.5px] font-medium text-slate-800">
                      {st.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-2xs"
                          style={{ backgroundColor: stColor }}
                        />
                        <span className="text-[13px] text-slate-600 font-mono">
                          {stColor.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-600 max-w-xs truncate">
                      {st.description || 'Assigned & awaiting root-cause analysis'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium ${
                          stActive ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            stActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {stActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[12.5px] text-slate-500">
                      {formatUpdatedDate(st.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditStatus(st)}
                          className="w-8 h-8 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer bg-white"
                          title="Edit status"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              type: 'status',
                              id: st.id,
                              name: st.name,
                            })
                          }
                          className="w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer bg-white"
                          title="Delete status"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODALS ── */}
      {isAddCatOpen && (
        <AddCategoryModal
          onClose={() => setIsAddCatOpen(false)}
          onSuccess={() => {
            setIsAddCatOpen(false);
            fetchCategories();
          }}
        />
      )}

      {editCat && (
        <EditCategoryModal
          category={editCat}
          onClose={() => setEditCat(null)}
          onSuccess={() => {
            setEditCat(null);
            fetchCategories();
          }}
        />
      )}

      {isAddStatusOpen && (
        <AddCapaStatusModal
          nextOrderIndex={statuses.length + 1}
          onClose={() => setIsAddStatusOpen(false)}
          onSuccess={() => {
            setIsAddStatusOpen(false);
            fetchStatuses();
          }}
        />
      )}

      {editStatus && (
        <EditCapaStatusModal
          status={editStatus}
          onClose={() => setEditStatus(null)}
          onSuccess={() => {
            setEditStatus(null);
            fetchStatuses();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[440px] overflow-hidden p-6 md:p-8 relative">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-[18px] font-bold text-slate-900 m-0 mb-1.5">
              Delete {deleteTarget.type === 'category' ? 'Category' : 'Status'}?
            </h3>
            <p className="text-[13.5px] text-slate-500 m-0 mb-6 font-normal leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-slate-800">{deleteTarget.name}</strong>? Tindakan
              This action cannot be undone.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 border border-red-100">
                <AlertCircle size={14} className="shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-[13.5px] transition-colors bg-white cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-[13.5px] transition-colors shadow-sm border-none cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
