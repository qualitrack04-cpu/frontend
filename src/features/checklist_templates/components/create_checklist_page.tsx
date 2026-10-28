import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronDown, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { createChecklistTemplate } from '../api/checklist_templates_api';
import type { 
  ChecklistTemplateItem, 
  DepartmentOption, 
  IsoOption 
} from '../api/checklist_templates_api';

interface CreateChecklistPageProps {
  departments: DepartmentOption[];
  isoStandards: IsoOption[];
  existingTemplates: ChecklistTemplateItem[];
  onCancel: () => void;
  onSuccess: () => void;
}

interface TaskItem {
  id: string;
  question: string;
}

export default function CreateChecklistPage({
  departments,
  isoStandards,
  existingTemplates,
  onCancel,
  onSuccess,
}: CreateChecklistPageProps) {
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedIsoId, setSelectedIsoId] = useState('');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [currentTaskInput, setCurrentTaskInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to match template with department
  const templateMatchesDept = (t: ChecklistTemplateItem, deptId: string, deptName?: string) => {
    if (t.departmentId && t.departmentId === deptId) return true;
    if (deptName && t.departmentName && t.departmentName.trim().toLowerCase() === deptName.trim().toLowerCase()) return true;
    return false;
  };

  // Helper to match template with ISO standard
  const templateMatchesIso = (t: ChecklistTemplateItem, isoId: string, isoCode?: string, isoName?: string) => {
    if (t.isoStandardId && t.isoStandardId === isoId) return true;
    const tIsoName = (t.isoStandardName || '').trim().toLowerCase();
    if (isoCode && tIsoName.includes(isoCode.trim().toLowerCase())) return true;
    if (isoName && tIsoName.includes(isoName.trim().toLowerCase())) return true;
    return false;
  };

  // Filter active standards and active departments only
  const activeDepartments = useMemo(() => {
    return departments.filter((dept) => (dept as any).isActive !== false);
  }, [departments]);

  const activeIsoStandards = useMemo(() => {
    return isoStandards.filter((iso: any) => {
      if (!iso) return false;
      if (iso.isActive === false || iso.is_active === false) return false;
      if (typeof iso.isActive === 'string' && (iso.isActive === 'false' || iso.isActive === 'Inactive')) return false;
      if (iso.status === 'Inactive' || iso.status === 'inactive') return false;
      return true;
    });
  }, [isoStandards]);

  // 1. Available Departments:
  // Must be active AND:
  // If ISO is selected, only show active departments that don't have a checklist for this ISO yet.
  // If no ISO is selected, show active departments that still have at least 1 active ISO standard unassigned.
  const availableDepartments = useMemo(() => {
    if (!selectedIsoId) {
      if (activeIsoStandards.length === 0) return activeDepartments;
      return activeDepartments.filter((dept) => {
        // Count how many active ISO standards already have checklists for this department
        const assignedIsoCount = activeIsoStandards.filter((iso) =>
          existingTemplates.some(
            (t) => templateMatchesDept(t, dept.id, dept.name) && templateMatchesIso(t, iso.id, iso.code, iso.name)
          )
        ).length;
        return assignedIsoCount < activeIsoStandards.length;
      });
    }

    const selectedIso = activeIsoStandards.find((i) => i.id === selectedIsoId);
    return activeDepartments.filter((dept) => {
      const alreadyHasTemplate = existingTemplates.some(
        (t) => templateMatchesDept(t, dept.id, dept.name) && templateMatchesIso(t, selectedIsoId, selectedIso?.code, selectedIso?.name)
      );
      return !alreadyHasTemplate;
    });
  }, [selectedIsoId, activeDepartments, activeIsoStandards, existingTemplates]);

  // 2. Available ISO Standards:
  // Must be active AND:
  // If Department is selected, only show active ISO standards that don't have a checklist for this department yet.
  // If no Department is selected, show active ISO standards that still have at least 1 active department unassigned.
  const availableIsoStandards = useMemo(() => {
    if (!selectedDeptId) {
      if (activeDepartments.length === 0) return activeIsoStandards;
      return activeIsoStandards.filter((iso) => {
        const assignedDeptCount = activeDepartments.filter((dept) =>
          existingTemplates.some(
            (t) => templateMatchesDept(t, dept.id, dept.name) && templateMatchesIso(t, iso.id, iso.code, iso.name)
          )
        ).length;
        return assignedDeptCount < activeDepartments.length;
      });
    }

    const selectedDept = activeDepartments.find((d) => d.id === selectedDeptId);
    return activeIsoStandards.filter((iso) => {
      const alreadyHasTemplate = existingTemplates.some(
        (t) => templateMatchesDept(t, selectedDeptId, selectedDept?.name) && templateMatchesIso(t, iso.id, iso.code, iso.name)
      );
      return !alreadyHasTemplate;
    });
  }, [selectedDeptId, activeIsoStandards, activeDepartments, existingTemplates]);

  // Handle adding task
  const handleAddTask = () => {
    const trimmed = currentTaskInput.trim();
    if (!trimmed) return;

    setTasks((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}-${Math.random()}`,
        question: trimmed,
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

    if (!selectedDeptId) {
      setError('Please select a Department.');
      return;
    }

    if (!selectedIsoId) {
      setError('Please select an ISO Standard.');
      return;
    }

    if (tasks.length === 0) {
      setError('Please add at least one audit task.');
      return;
    }

    setLoading(true);

    try {
      const deptObj = departments.find((d) => d.id === selectedDeptId);
      const isoObj = isoStandards.find((i) => i.id === selectedIsoId);
      const title = `${isoObj?.code || isoObj?.name || 'ISO'} - ${deptObj?.name || 'Department'}`;

      await createChecklistTemplate({
        title,
        isoStandardId: selectedIsoId,
        departmentId: selectedDeptId,
        items: tasks.map((t, idx) => ({
          question: t.question,
          clauseRef: 'General',
          orderIndex: idx + 1,
        })),
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create audit checklist template.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full m-0 text-left">
      {/* Breadcrumb Navigation */}
      <div className="mb-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-[13.5px] font-normal transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          <ChevronLeft size={16} />
          <span>Checklist Template Management</span>
          <span className="text-slate-300 mx-0.5">/</span>
          <span className="font-semibold text-slate-800">Create Audit Checklist</span>
        </button>
      </div>

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F294A] tracking-tight m-0 mb-1.5">
          Create Audit Checklist
        </h1>
        <p className="text-slate-500 text-[14px] m-0">
          Create a checklist and define the tasks that need to be completed during the audit.
        </p>
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
                    {availableDepartments.map((dept) => (
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
                    {availableIsoStandards.map((iso) => (
                      <option key={iso.id} value={iso.id}>
                        {iso.code || iso.name}
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
              Add the tasks that must be completed during the audit.
            </p>

            {/* Task Input Field */}
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-slate-700 mb-2">
                Task
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Enter audit task..."
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

            {/* Tasks List */}
            {tasks.length > 0 && (
              <div className="flex flex-col gap-2.5">
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
            )}
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
              <span>{loading ? 'Saving...' : 'Save Checklist'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

