import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChecklistTemplates } from '../hooks/use_checklist_templates';
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
import CreateChecklistPage from './create_checklist_page';
import EditChecklistPage from './edit_checklist_page';
import DeleteTemplateModal from './delete_template_modal';
import TablePagination from '../../../shared/components/table_pagination';
import type { ChecklistTemplateItem } from '../api/checklist_templates_api';

export default function ChecklistTemplatesPage() {
  const { templates, departments, isoStandards, loading, error, refetch } = useChecklistTemplates();

  const [searchParams, setSearchParams] = useSearchParams();
  const actionParam = searchParams.get('action');
  const editIdParam = searchParams.get('id');

  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplateItem | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<ChecklistTemplateItem | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('');

  // Sync with URL query parameter
  useEffect(() => {
    if (actionParam === 'create') {
      setViewMode('create');
    } else if (actionParam === 'edit' && editIdParam) {
      const match = templates.find((t) => t.id === editIdParam);
      if (match) {
        setEditingTemplate(match);
        setViewMode('edit');
      }
    } else if (!actionParam) {
      setViewMode('list');
      setEditingTemplate(null);
    }
  }, [actionParam, editIdParam, templates]);

  const handleOpenCreate = () => {
    setViewMode('create');
    setSearchParams({ action: 'create' });
  };

  const handleOpenEdit = (tmpl: ChecklistTemplateItem) => {
    setEditingTemplate(tmpl);
    setViewMode('edit');
    setSearchParams({ action: 'edit', id: tmpl.id });
  };

  const handleBackToList = () => {
    setViewMode('list');
    setEditingTemplate(null);
    setSearchParams({});
  };

  // ISO Dropdown state
  const [isIsoDropdownOpen, setIsIsoDropdownOpen] = useState(false);
  const isoDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state (Max 7 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isoDropdownRef.current && !isoDropdownRef.current.contains(event.target as Node)) {
        setIsIsoDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Unified standard options for the filter dropdown (active standards only)
  const standardOptions = useMemo(() => {
    const list: { id: string; code: string; name: string }[] = [];
    const seenCodes = new Set<string>();

    // Collect inactive ISO identifiers from isoStandards to ensure they don't leak into options
    const inactiveCodes = new Set<string>();
    const inactiveNums = new Set<string>();
    if (Array.isArray(isoStandards)) {
      for (const iso of isoStandards) {
        if (iso.isActive === false) {
          if (iso.code) {
            inactiveCodes.add(iso.code.trim().toLowerCase());
            const num = iso.code.match(/\d{4,5}/)?.[0];
            if (num) inactiveNums.add(num);
          }
          if (iso.name) {
            inactiveCodes.add(iso.name.trim().toLowerCase());
          }
        }
      }
    }

    if (Array.isArray(isoStandards)) {
      for (const iso of isoStandards) {
        if (iso && iso.code && iso.isActive !== false && !seenCodes.has(iso.code.toLowerCase())) {
          seenCodes.add(iso.code.toLowerCase());
          list.push({ id: iso.id, code: iso.code, name: iso.name || '' });
        }
      }
    }

    const defaults = [
      { id: 'def-9001', code: 'ISO 9001:2015', name: 'Quality Management' },
      { id: 'def-14001', code: 'ISO 14001:2015', name: 'Environmental Management' },
      { id: 'def-45001', code: 'ISO 45001:2018', name: 'Occupational Health and Safety' },
      { id: 'def-27001', code: 'ISO/IEC 27001:2022', name: 'Information Security' },
      { id: 'def-22000', code: 'ISO 22000:2018', name: 'Food Safety' },
      { id: 'def-19011', code: 'ISO 19011:2018', name: 'Auditing Management' },
      { id: 'def-50001', code: 'ISO 50001:2018', name: 'Energy Management' },
    ];

    for (const def of defaults) {
      const defCodeLower = def.code.toLowerCase();
      const defNum = def.code.match(/\d{4,5}/)?.[0];

      // If this default standard is inactive in the database, SKIP IT!
      if (inactiveCodes.has(defCodeLower) || (defNum && inactiveNums.has(defNum))) {
        continue;
      }

      const exists = list.some(
        (i) =>
          i.code.toLowerCase() === defCodeLower ||
          (defNum && i.code.includes(defNum))
      );
      if (!exists && !seenCodes.has(defCodeLower)) {
        seenCodes.add(defCodeLower);
        list.push(def);
      }
    }

    return list;
  }, [isoStandards]);

  // Helper to resolve ISO code for display (e.g. ISO 9001:2015 instead of raw name)
  const getIsoDisplayCode = (isoNameOrCode?: string | null, isoStandardId?: string | null) => {
    if (isoStandardId && Array.isArray(isoStandards)) {
      const matchById = isoStandards.find((i) => i.id === isoStandardId);
      if (matchById?.code) return matchById.code;
    }

    if (!isoNameOrCode) return '-';
    const clean = String(isoNameOrCode).trim();
    if (!clean || clean === '-') return '-';

    const cleanLower = clean.toLowerCase();

    // Check in standardOptions
    const match = standardOptions.find((i) => {
      const iCode = (i.code || '').toLowerCase();
      const iName = (i.name || '').toLowerCase();
      return (
        (iCode && (iCode === cleanLower || cleanLower.includes(iCode))) ||
        (iName && (iName === cleanLower || cleanLower.includes(iName)))
      );
    });

    if (match && match.code) return match.code;

    if (cleanLower.includes('9001')) return 'ISO 9001:2015';
    if (cleanLower.includes('14001')) return 'ISO 14001:2015';
    if (cleanLower.includes('27001')) return 'ISO/IEC 27001:2022';
    if (cleanLower.includes('45001')) return 'ISO 45001:2018';
    if (cleanLower.includes('19011')) return 'ISO 19011:2018';
    if (cleanLower.includes('22000')) return 'ISO 22000:2018';
    if (cleanLower.includes('50001')) return 'ISO 50001:2018';
    return clean;
  };

  // Helper to determine if a checklist template is using an inactive ISO standard
  const isTemplateIsoInactive = (t: ChecklistTemplateItem) => {
    if (!Array.isArray(isoStandards) || isoStandards.length === 0) return false;

    // 1. Direct match by isoStandardId
    if (t.isoStandardId) {
      const match = isoStandards.find((i) => i.id === t.isoStandardId);
      if (match) {
        if (match.isActive === false || (match as any).status === 'Inactive' || (match as any).is_active === false) {
          return true;
        }
      }
    }

    // 2. Match by code, name, or standard number among inactive standards
    const tIsoName = (t.isoStandardName || '').trim().toLowerCase();
    const tDisplayCode = getIsoDisplayCode(t.isoStandardName, t.isoStandardId).trim().toLowerCase();
    const tTitle = (t.title || '').trim().toLowerCase();

    for (const iso of isoStandards) {
      const isInactive = iso.isActive === false || (iso as any).status === 'Inactive' || (iso as any).is_active === false;
      if (isInactive) {
        const isoCode = (iso.code || '').trim().toLowerCase();
        const isoName = (iso.name || '').trim().toLowerCase();
        const isoNum = isoCode.match(/\d{4,5}/)?.[0];

        if (isoCode && (tIsoName === isoCode || tDisplayCode === isoCode || tTitle.includes(isoCode))) {
          return true;
        }

        if (isoName && (tIsoName === isoName || tTitle.includes(isoName))) {
          return true;
        }

        if (isoNum) {
          const tNum = tIsoName.match(/\d{4,5}/)?.[0] || tDisplayCode.match(/\d{4,5}/)?.[0] || tTitle.match(/\d{4,5}/)?.[0];
          if (tNum && tNum === isoNum) {
            return true;
          }
        }
      }
    }

    // 3. Fallback: If template is tagged with an ISO standard, but that standard is NOT found among active standards
    if (tIsoName || t.isoStandardId) {
      const hasActiveMatch = isoStandards.some((iso) => {
        if (iso.isActive === false || (iso as any).status === 'Inactive' || (iso as any).is_active === false) return false;
        if (t.isoStandardId && iso.id === t.isoStandardId) return true;
        const isoCode = (iso.code || '').trim().toLowerCase();
        const isoName = (iso.name || '').trim().toLowerCase();
        const isoNum = isoCode.match(/\d{4,5}/)?.[0];
        const tNum = tIsoName.match(/\d{4,5}/)?.[0] || tDisplayCode.match(/\d{4,5}/)?.[0];
        if (isoCode && (tIsoName === isoCode || tDisplayCode === isoCode)) return true;
        if (isoName && tIsoName === isoName) return true;
        if (isoNum && tNum && isoNum === tNum) return true;
        return false;
      });

      if (!hasActiveMatch && (tIsoName.toLowerCase().includes('iso') || tIsoName.match(/\d{4,5}/) || t.isoStandardId)) {
        return true;
      }
    }

    return false;
  };

  // Helper to determine if a checklist template is using an inactive Department
  const isTemplateDeptInactive = (t: ChecklistTemplateItem) => {
    if (!Array.isArray(departments) || departments.length === 0) return false;
    if (t.departmentId) {
      const match = departments.find((d) => d.id === t.departmentId);
      if (match && match.isActive === false) return true;
    }
    const tDeptName = (t.departmentName || '').trim().toLowerCase();
    if (tDeptName) {
      for (const dept of departments) {
        if (dept.isActive === false) {
          const deptName = (dept.name || '').trim().toLowerCase();
          const deptCode = (dept.code || '').trim().toLowerCase();
          if ((deptName && tDeptName === deptName) || (deptCode && tDeptName === deptCode)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Dot color matching the reference image for each ISO Standard
  const getIsoDotColor = (nameOrCode?: string | null) => {
    if (!nameOrCode) return 'bg-[#3b82f6]';
    const s = String(nameOrCode).toLowerCase();
    if (s.includes('9001') || s.includes('quality')) return 'bg-[#8b5cf6]'; // purple
    if (s.includes('14001') || s.includes('environmental')) return 'bg-[#f59e0b]'; // orange / amber
    if (s.includes('27001') || s.includes('security')) return 'bg-[#10b981]'; // emerald / green
    if (s.includes('45001') || s.includes('safety') || s.includes('occupational')) return 'bg-[#ef4444]'; // red
    if (s.includes('19011') || s.includes('auditing')) return 'bg-[#8b5cf6]'; // purple
    if (s.includes('22000') || s.includes('food')) return 'bg-[#f43f5e]'; // rose
    if (s.includes('50001') || s.includes('energy')) return 'bg-[#eab308]'; // yellow
    return 'bg-[#3b82f6]'; // default blue
  };

  // Filter in memory for instantaneous search & filtering
  const filteredTemplates = useMemo(() => {
    let list = Array.isArray(templates) ? [...templates] : [];

    // Filter out templates where the associated ISO standard is inactive (or department is inactive)
    list = list.filter((t) => !isTemplateIsoInactive(t) && !isTemplateDeptInactive(t));

    // Sort by createdAt descending so newest items (matching reference) are on top
    list.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((t) => {
        const titleText = (t.title || '').toLowerCase();
        const stdText = (t.isoStandardName || '').toLowerCase();
        const deptText = (t.departmentName || '').toLowerCase();
        const displayText = getIsoDisplayCode(t.isoStandardName, t.isoStandardId).toLowerCase();
        return (
          titleText.includes(term) ||
          stdText.includes(term) ||
          deptText.includes(term) ||
          displayText.includes(term)
        );
      });
    }

    if (selectedStandard) {
      const selectedIso = standardOptions.find(
        (i) => i.code === selectedStandard || i.id === selectedStandard
      );
      const selectedCodeLower = (selectedIso?.code || selectedStandard).toLowerCase();
      const selectedNameLower = (selectedIso?.name || '').toLowerCase();

      // Extract numeric identifier if any (e.g. "9001", "14001", "27001", "45001", "19011", "22000", "50001")
      const numMatch = selectedStandard.match(/\d{4,5}/);
      const standardNum = numMatch ? numMatch[0] : '';

      list = list.filter((t) => {
        // 1. Direct ID match
        if (selectedIso && t.isoStandardId && t.isoStandardId === selectedIso.id) {
          return true;
        }

        const templateName = (t.isoStandardName || '').toLowerCase();
        const templateTitle = (t.title || '').toLowerCase();
        const displayCode = getIsoDisplayCode(t.isoStandardName, t.isoStandardId).toLowerCase();

        // 2. Exact or substring match with selected code
        if (
          (templateName && (templateName.includes(selectedCodeLower) || selectedCodeLower.includes(templateName))) ||
          (displayCode && (displayCode.includes(selectedCodeLower) || selectedCodeLower.includes(displayCode)))
        ) {
          return true;
        }

        // 3. Match with ISO standard description/name (e.g. "Quality Management")
        if (
          selectedNameLower &&
          ((templateName && templateName.includes(selectedNameLower)) ||
            (templateTitle && templateTitle.includes(selectedNameLower)))
        ) {
          return true;
        }

        // 4. Match with ISO standard number (e.g. "9001" in "ISO9001", "ISO 9001 - Warehouse", etc.)
        if (standardNum) {
          if (
            templateName.includes(standardNum) ||
            templateTitle.includes(standardNum) ||
            displayCode.includes(standardNum)
          ) {
            return true;
          }
        }

        return false;
      });
    }

    return list;
  }, [templates, searchTerm, selectedStandard, standardOptions, isoStandards, departments]);

  // Paginated slice
  const totalResults = filteredTemplates.length;
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTemplates.slice(start, start + pageSize);
  }, [filteredTemplates, currentPage, pageSize]);

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

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStandard('');
    setCurrentPage(1);
  };

  // Render Create View
  if (viewMode === 'create') {
    return (
      <CreateChecklistPage
        departments={departments}
        isoStandards={isoStandards}
        existingTemplates={templates}
        onCancel={handleBackToList}
        onSuccess={() => {
          handleBackToList();
          refetch();
        }}
      />
    );
  }

  // Render Edit View
  if (viewMode === 'edit' && editingTemplate) {
    return (
      <EditChecklistPage
        template={editingTemplate}
        departments={departments}
        isoStandards={isoStandards}
        onCancel={handleBackToList}
        onSuccess={() => {
          handleBackToList();
          refetch();
        }}
      />
    );
  }

  return (
    <div className="max-w-full m-0 text-left">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-bold text-[#0F294A] tracking-tight m-0 mb-1.5">
            Checklist Template Management
          </h1>
          <p className="text-slate-500 text-[14px] m-0">
            Track and manage audit checklist templates and procedures.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg text-[14px] transition-all shadow-sm active:scale-[0.98] cursor-pointer border-none"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Add Template</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-slate-200/80 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-[260px] md:w-[300px] shrink-0">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3.5 py-2 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Select ISO Standart Dropdown */}
          <div className="relative shrink-0" ref={isoDropdownRef}>
            <button
              type="button"
              onClick={() => setIsIsoDropdownOpen(!isIsoDropdownOpen)}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-[14px] text-slate-700 hover:border-slate-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal size={16} className="text-slate-600" />
              <span className="font-normal text-slate-700">
                {selectedStandard || 'Select ISO Standart'}
              </span>
              <ChevronDown size={15} className={`text-slate-400 transition-transform ${isIsoDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isIsoDropdownOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-[210px] bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-[fadeIn_0.15s_ease-out]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStandard('');
                    setCurrentPage(1);
                    setIsIsoDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-[13.5px] text-left border-none bg-transparent cursor-pointer transition-colors ${
                    selectedStandard === '' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>All ISO Standarts</span>
                  {selectedStandard === '' && <Check size={14} className="text-blue-600" />}
                </button>
                {standardOptions.map((iso) => {
                  const isSelected = selectedStandard === iso.code;
                  return (
                    <button
                      key={iso.id}
                      type="button"
                      onClick={() => {
                        setSelectedStandard(iso.code);
                        setCurrentPage(1);
                        setIsIsoDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-[13.5px] text-left border-none bg-transparent cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{iso.code}</span>
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
                <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  TEMPLATE NAME
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  ISO STANDART
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  DEPARTMENT
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  UPDATED
                </th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !templates.length && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    Loading templates...
                  </td>
                </tr>
              )}

              {!loading && paginatedTemplates.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    No checklist templates found matching your filters.
                  </td>
                </tr>
              )}

              {paginatedTemplates.map((template) => {
                const isoDisplay = getIsoDisplayCode(template.isoStandardName, template.isoStandardId);
                const dotColor = getIsoDotColor(isoDisplay + ' ' + (template.isoStandardName || ''));

                return (
                  <tr
                    key={template.id}
                    className="border-b border-slate-100/80 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* TEMPLATE NAME */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900 text-[13.5px]">
                        {template.title}
                      </span>
                    </td>

                    {/* ISO STANDART with colored dot */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-[13px] font-normal text-slate-700">
                        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                        {isoDisplay}
                      </span>
                    </td>

                    {/* DEPARTMENT */}
                    <td className="px-6 py-4 text-[13px] text-slate-600 font-normal">
                      {template.departmentName}
                    </td>

                    {/* UPDATED */}
                    <td className="px-6 py-4 text-[12.5px] text-slate-400 font-normal">
                      {formatUpdatedDate(template.createdAt)}
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(template)}
                          title="Edit Template"
                          className="w-7 h-7 rounded-[6px] bg-[#EEF2FF] hover:bg-blue-100 text-[#3B82F6] flex items-center justify-center transition-colors cursor-pointer border-none"
                        >
                          <Pencil size={14} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTemplate(template)}
                          title="Delete Template"
                          className="w-7 h-7 rounded-[6px] bg-[#FEF2F2] hover:bg-red-100 text-[#EF4444] flex items-center justify-center transition-colors cursor-pointer border-none"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalResults={totalResults}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Delete Template Modal */}
      {deletingTemplate && (
        <DeleteTemplateModal
          template={deletingTemplate}
          onClose={() => setDeletingTemplate(null)}
          onSuccess={() => {
            setDeletingTemplate(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
