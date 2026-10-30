import { useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft, ChevronDown, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { updateChecklistTemplate } from '../api/checklist_templates_api';
import { getChecklistById } from '../../audits/api/checklist_api';
import type { 
  ChecklistTemplateItem, 
  DepartmentOption, 
  IsoOption 
} from '../api/checklist_templates_api';

interface EditChecklistPageProps {
  template: ChecklistTemplateItem;
  departments: DepartmentOption[];
  isoStandards: IsoOption[];
  onCancel: () => void;
  onSuccess: () => void;
}

interface TaskItem {
  id?: string;
  question: string;
  clauseRef?: string;
  description?: string;
}

export default function EditChecklistPage({
  template,
  departments,
  isoStandards,
  onCancel,
  onSuccess,
}: EditChecklistPageProps) {
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedIsoId, setSelectedIsoId] = useState('');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [currentTaskInput, setCurrentTaskInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize data and load existing items
  useEffect(() => {
    // Find initial department ID
    const initialDept = departments.find(
      (d) => d.id === template.departmentId || d.name.toLowerCase() === (template.departmentName || '').toLowerCase()
    );
    if (initialDept) setSelectedDeptId(initialDept.id);
    else if (template.departmentId) setSelectedDeptId(template.departmentId);

    // Find initial ISO standard ID
    const initialIso = isoStandards.find(
      (i) => i.id === template.isoStandardId || 
             i.code.toLowerCase() === (template.isoStandardName || '').toLowerCase() ||
             i.name.toLowerCase() === (template.isoStandardName || '').toLowerCase()
    );
    if (initialIso) setSelectedIsoId(initialIso.id);
    else if (template.isoStandardId) setSelectedIsoId(template.isoStandardId);

    // Fetch existing tasks
    getChecklistById(template.id)
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setTasks(
            res.items.map((item) => ({
              id: item.id,
              question: item.question,
              clauseRef: item.clauseRef || 'General',
              description: item.description || undefined,
            }))
          );
        } else {
          setTasks([
            {
              id: `init-${Date.now()}`,
              question: 'Verify that quality management procedures are properly documented.',
              clauseRef: 'General',
            },
          ]);
        }
      })
      .catch(() => {
        setTasks([
          {
            id: `init-${Date.now()}`,
            question: 'Verify that quality management procedures are properly documented.',
            clauseRef: 'General',
          },
        ]);
      })
      .finally(() => {
        setInitialLoading(false);
      });
  }, [template, departments, isoStandards]);

  // Handle adding new task
  const handleAddTask = () => {
    const trimmed = currentTaskInput.trim();
    if (!trimmed) return;

    setTasks((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}-${Math.random()}`,
        question: trimmed,
        clauseRef: 'General',
      },
    ]);
    setCurrentTaskInput('');
    setError(null);
  };

  // Handle removing task
  const handleRemoveTask = (indexToRemove: number) => {
    setTasks((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (tasks.length === 0) {
      setError('Please add at least one audit task.');
      return;
    }

    setLoading(true);

    try {
      const deptObj = departments.find((d) => d.id === selectedDeptId);
      const isoObj = isoStandards.find((i) => i.id === selectedIsoId);
      const departmentName = deptObj ? deptObj.name : template.departmentName;
      const standardName = isoObj ? isoObj.code : template.isoStandardName;
      const title = `${standardName} - ${departmentName}`;

      const itemsPayload = tasks.map((t) => ({
        id: t.id && !t.id.startsWith('temp-') && !t.id.startsWith('init-') ? t.id : undefined,
        question: t.question.trim(),
        clauseRef: t.clauseRef || 'General',
        description: t.description,
      }));

      await updateChecklistTemplate(template.id, {
        title,
        standard: standardName,
        department: departmentName,
        items: itemsPayload,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save audit checklist changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full m-0 text-left">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-slate-500 text-[13.5px] font-normal mb-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          Checklist Template Management
        </button>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="font-semibold text-slate-800">Edit Audit Checklist</span>
      </div>

      {/* Header Section with Circular Back Button */}
      <div className="flex items-center gap-3.5 mb-6">
        <button
          type="button"
          onClick={onCancel}
          title="Back to list"
          className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F294A] tracking-tight m-0 mb-1">
            Edit Audit Checklist
          </h1>
          <p className="text-slate-500 text-[14px] m-0">
            Update checklist information and manage existing audit tasks.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 text-[14px] rounded-xl flex items-center gap-2 border border-red-100">
          <AlertCircle size={17} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-6 sm:p-8 mb-8">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Checklist Information */}
          <div className="mb-8">
            <h2 className="text-[17px] font-bold text-slate-900 m-0 mb-1">
              Checklist Information
            </h2>
            <p className="text-slate-400 text-[13.5px] m-0 mb-5">
              Assign relevant standard and governing department.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Department Dropdown */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedDeptId}
                    onChange={(e) => {
                      setSelectedDeptId(e.target.value);
                      setError(null);
                    }}
                    required
                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-[14px] text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer font-normal"
                  >
                    <option value="">Select Department</option>
                    {departments
                      .filter((dept) => (dept as any).isActive !== false || dept.id === selectedDeptId)
                      .map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* ISO Standard Dropdown */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                  ISO Standard <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedIsoId}
                    onChange={(e) => {
                      setSelectedIsoId(e.target.value);
                      setError(null);
                    }}
                    required
                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-[14px] text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer font-normal"
                  >
                    <option value="">Select ISO Standard</option>
                    {isoStandards
                      .filter((iso: any) => {
                        if (!iso) return false;
                        if (iso.id === selectedIsoId) return true;
                        if (iso.isActive === false || iso.is_active === false) return false;
                        if (typeof iso.isActive === 'string' && (iso.isActive === 'false' || iso.isActive === 'Inactive')) return false;
                        if (iso.status === 'Inactive' || iso.status === 'inactive') return false;
                        return true;
                      })
                      .map((iso) => (
                        <option key={iso.id} value={iso.id}>
                          {iso.code || iso.name} {iso.isActive === false ? '(Inactive)' : ''}
                        </option>
                      ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Checklist Tasks */}
          <div className="mb-8">
            <h2 className="text-[17px] font-bold text-slate-900 m-0 mb-1">
              Checklist Tasks
            </h2>
            <p className="text-slate-400 text-[13.5px] m-0 mb-4">
              Edit, remove, or add tasks to this audit checklist.
            </p>

            {/* Existing Tasks List */}
            {initialLoading ? (
              <div className="py-6 text-center text-slate-400 text-sm">
                Loading checklist tasks...
              </div>
            ) : tasks.length > 0 ? (
              <div className="flex flex-col gap-2.5 mb-5">
                {tasks.map((task, idx) => (
                  <div
                    key={task.id || idx}
                    className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-3">
                      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700 text-[14px] font-normal break-words leading-relaxed">
                        {task.question}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      title="Remove task"
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-slate-400 text-sm mb-4">
                No tasks in this checklist. Add one below.
              </div>
            )}

            {/* ADD NEW TASK Section */}
            <div className="mt-5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                ADD NEW TASK
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Enter new audit task..."
                  value={currentTaskInput}
                  onChange={(e) => setCurrentTaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTask();
                    }
                  }}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="inline-flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-[14px] transition-colors shadow-sm cursor-pointer border-none shrink-0"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-[14px] font-medium transition-colors bg-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-[14px] transition-all shadow-sm active:scale-[0.98] cursor-pointer border-none disabled:opacity-60"
            >
              <Check size={16} strokeWidth={2.5} />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

