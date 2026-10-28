import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  SlidersHorizontal,
  ChevronDown, 
  RotateCcw, 
  Calendar,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  PauseCircle,
  Trash2,
  Check,
  X,
  Settings
} from 'lucide-react';
import TablePagination from '../../../shared/components/table_pagination';
import { useRecentChanges } from '../hooks/use_recent_changes';
import type { RecentChangeItem } from '../api/recent_changes_api';

const MODULE_OPTIONS = [
  'Department Management',
  'User Management',
  'SPC Unit Management',
  'ISO Standard Management',
  'Checklist Template Management',
];

export default function RecentChangesPage() {
  const { changes, loading } = useRecentChanges();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('');

  // 2-date range calendar state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Dropdown states
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const moduleDropdownRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Pagination state (Max 7 items per page to match User Management)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moduleDropdownRef.current && !moduleDropdownRef.current.contains(event.target as Node)) {
        setIsModuleDropdownOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter in memory
  const filteredChanges = useMemo(() => {
    let list = [...changes];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.description.toLowerCase().includes(term) ||
          c.entityType.toLowerCase().includes(term) ||
          c.entityName.toLowerCase().includes(term)
      );
    }

    // Filter by module
    if (selectedModule) {
      const mod = selectedModule.toLowerCase();
      list = list.filter((c) => c.entityType.toLowerCase().includes(mod));
    }

    // Filter by selected 2-date range (or 1 date if user picked only 1)
    if (startDate) {
      const startOfDay = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        0, 0, 0, 0
      ).getTime();

      const endOfDay = endDate
        ? new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
            23, 59, 59, 999
          ).getTime()
        : new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            23, 59, 59, 999
          ).getTime();

      list = list.filter((c) => {
        const itemDate = new Date(c.timestamp);
        if (isNaN(itemDate.getTime())) return false;
        const t = itemDate.getTime();
        return t >= startOfDay && t <= endOfDay;
      });
    }

    return list;
  }, [changes, searchTerm, selectedModule, startDate, endDate]);

  // Paginated slice
  const totalResults = filteredChanges.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const paginatedChanges = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredChanges.slice(start, start + pageSize);
  }, [filteredChanges, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedModule('');
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };

  // Helper date comparison and formatters
  const formatDisplayDate = (d: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isDateBetween = (d: Date, start: Date | null, end: Date | null) => {
    if (!start || !end) return false;
    const time = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    return time > s && time < e;
  };

  // 2-date calendar click handler
  const handleDateClick = (clickedDate: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (clickedDate.getTime() < startDate.getTime()) {
        setEndDate(startDate);
        setStartDate(clickedDate);
      } else {
        setEndDate(clickedDate);
      }
    }
    setCurrentPage(1);
  };

  // Generate days for calendar month grid
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; dayNumber: number }[] = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
        dayNumber: daysInPrevMonth - i,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
        dayNumber: d,
      });
    }

    // Next month padding to complete row
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: new Date(year, month + 1, d),
        isCurrentMonth: false,
        dayNumber: d,
      });
    }

    return days;
  }, [calendarMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  // Helper for icon, background color, and icon color
  const getChangeStyle = (item: RecentChangeItem) => {
    const desc = item.description.toLowerCase();
    const action = item.action.toLowerCase();
    const type = item.entityType.toLowerCase();

    // 1. Department added
    if (type.includes('department') || desc.includes('department added')) {
      return {
        icon: CreditCard,
        bgColor: 'bg-[#E0F2FE]',
        iconColor: 'text-[#0284C7]',
      };
    }

    // 2. Role changed / User
    if (type.includes('user') || desc.includes('role of') || action === 'update') {
      return {
        icon: RefreshCw,
        bgColor: 'bg-[#FEF3C7]',
        iconColor: 'text-[#D97706]',
      };
    }

    // 3. Deactivated (must check before activated because 'deactivated' contains 'activated')
    if (action === 'deactivate' || desc.includes('deactivated')) {
      return {
        icon: PauseCircle,
        bgColor: 'bg-[#F1F5F9]',
        iconColor: 'text-[#64748B]',
      };
    }

    // 4. Activated
    if (action === 'activate' || desc.includes('activated')) {
      return {
        icon: CheckCircle2,
        bgColor: 'bg-[#DCFCE7]',
        iconColor: 'text-[#16A34A]',
      };
    }

    // 5. Removed / Delete
    if (action === 'delete' || desc.includes('removed') || desc.includes('deleted')) {
      return {
        icon: Trash2,
        bgColor: 'bg-[#FEE2E2]',
        iconColor: 'text-[#DC2626]',
      };
    }

    return {
      icon: Settings,
      bgColor: 'bg-slate-100',
      iconColor: 'text-slate-600',
    };
  };

  // Date formatter matching reference (e.g. "Today, 15:30" or "22 June 2026")
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
          Recent Changes
        </h1>
        <p className="text-slate-500 text-[14px] m-0">
          Track all system changes made by admins
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
              placeholder="Search change"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3.5 py-2 text-[14px] text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Select Module Dropdown */}
          <div className="relative shrink-0" ref={moduleDropdownRef}>
            <button
              type="button"
              onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-[14px] text-slate-700 hover:border-slate-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal size={16} className="text-slate-600" />
              <span className="font-normal text-slate-700">
                {selectedModule || 'Select Module'}
              </span>
              <ChevronDown size={15} className={`text-slate-400 transition-transform ${isModuleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isModuleDropdownOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-[230px] bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-[fadeIn_0.15s_ease-out]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModule('');
                    setCurrentPage(1);
                    setIsModuleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-[13.5px] text-left border-none bg-transparent cursor-pointer transition-colors ${
                    selectedModule === '' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>All Modules</span>
                  {selectedModule === '' && <Check size={14} className="text-blue-600" />}
                </button>
                {MODULE_OPTIONS.map((mod) => {
                  const isSelected = selectedModule === mod;
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => {
                        setSelectedModule(mod);
                        setCurrentPage(1);
                        setIsModuleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-[13.5px] text-left border-none bg-transparent cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{mod}</span>
                      {isSelected && <Check size={14} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calendar Date Picker Filter (Select 2 Dates) */}
          <div className="relative shrink-0" ref={calendarRef}>
            <button
              type="button"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className={`flex items-center gap-2 bg-white border rounded-lg px-3.5 py-2 text-[14px] transition-colors cursor-pointer whitespace-nowrap ${
                startDate
                  ? 'border-[#2563EB] text-[#2563EB] bg-blue-50/40 font-medium'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <Calendar size={16} className={startDate ? 'text-[#2563EB]' : 'text-slate-600'} />
              <span>
                {startDate && endDate
                  ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
                  : startDate
                  ? formatDisplayDate(startDate)
                  : 'Date Range'}
              </span>
              {startDate ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setStartDate(null);
                    setEndDate(null);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded-full hover:bg-blue-100 flex items-center justify-center text-slate-500 hover:text-slate-700 ml-1 transition-colors"
                  title="Clear date filter"
                >
                  <X size={12} />
                </span>
              ) : (
                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`}
                />
              )}
            </button>

            {isCalendarOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] w-[320px] sm:w-[340px] bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 z-50 animate-[fadeIn_0.15s_ease-out]">
                {/* Calendar Header with Month/Year Navigation */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                    title="Previous month"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <span className="font-bold text-slate-800 text-[14px]">
                    {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                    title="Next month"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>

                {/* Day of Week Headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((dayName) => (
                    <div key={dayName} className="text-[11px] font-semibold text-slate-400 py-1 uppercase">
                      {dayName}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center mb-3">
                  {calendarDays.map((item, idx) => {
                    const isStart = isSameDay(item.date, startDate);
                    const isEnd = isSameDay(item.date, endDate);
                    const inRange = isDateBetween(item.date, startDate, endDate);
                    const isToday = isSameDay(item.date, new Date());

                    if (!item.isCurrentMonth) {
                      return (
                        <div
                          key={`dim-${idx}`}
                          className="h-8 flex items-center justify-center text-slate-300 text-[12.5px] select-none"
                        >
                          {item.dayNumber}
                        </div>
                      );
                    }

                    return (
                      <button
                        key={`cur-${idx}`}
                        type="button"
                        onClick={() => handleDateClick(item.date)}
                        className={`h-8 w-full flex items-center justify-center text-[13px] transition-colors border-none cursor-pointer relative ${
                          isStart || isEnd
                            ? 'bg-[#2563EB] text-white font-bold rounded-lg shadow-xs z-10'
                            : inRange
                            ? 'bg-[#EFF6FF] text-[#1D4ED8] font-semibold rounded-none'
                            : isToday
                            ? 'text-blue-600 font-bold border border-blue-400 rounded-lg hover:bg-slate-50'
                            : 'text-slate-700 hover:bg-slate-100 rounded-lg font-normal'
                        }`}
                      >
                        {item.dayNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Calendar Info and Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[12px]">
                  <div className="text-slate-500 font-medium">
                    {startDate && endDate ? (
                      <span className="text-emerald-600 font-semibold">2 dates selected</span>
                    ) : startDate ? (
                      <span className="text-blue-600">Select 2nd date</span>
                    ) : (
                      <span>Select 2 dates for range</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {(startDate || endDate) && (
                      <button
                        type="button"
                        onClick={() => {
                          setStartDate(null);
                          setEndDate(null);
                          setCurrentPage(1);
                        }}
                        className="text-slate-500 hover:text-slate-800 bg-transparent border-none cursor-pointer font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(false)}
                      className="bg-[#2563EB] text-white hover:bg-blue-700 px-3 py-1 rounded-lg font-semibold transition-colors border-none cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
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

      {/* Changes List Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,44,82,0.03)] border border-slate-100 overflow-hidden">
        {loading && (
          <div className="py-12 text-center text-slate-400 text-sm">
            Loading recent changes...
          </div>
        )}

        {!loading && paginatedChanges.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            No recent changes found matching your filters.
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {paginatedChanges.map((change) => {
            const { icon: Icon, bgColor, iconColor } = getChangeStyle(change);

            return (
              <div
                key={change.id}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Left side: Icon + Title & Module */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgColor} ${iconColor}`}>
                    <Icon size={19} strokeWidth={2} />
                  </div>

                  <div className="min-w-0 text-left">
                    <h3 className="font-bold text-slate-800 text-[14px] m-0 mb-0.5 truncate">
                      {change.description}
                    </h3>
                    <p className="text-slate-400 text-[12.5px] m-0 font-normal truncate">
                      {change.entityType}
                    </p>
                  </div>
                </div>

                {/* Right side: Timestamp */}
                <div className="shrink-0 text-right">
                  <span className="text-[12.5px] text-slate-400 font-normal">
                    {formatChangeDate(change.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
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
