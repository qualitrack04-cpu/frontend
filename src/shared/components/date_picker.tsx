import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// value/min/max pakai format ISO (yyyy-mm-dd), tampilan ke user pakai dd-mm-yyyy
interface DatePickerProps {
  value: string;
  onChange: (isoDate: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toIso(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function isoToDisplay(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
}

// "dd-mm-yyyy" -> "yyyy-mm-dd", atau null kalau tanggalnya tidak valid
function displayToIso(text: string) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(text);
  if (!match) return null;
  const d = Number(match[1]);
  const m = Number(match[2]) - 1;
  const y = Number(match[3]);
  const date = new Date(y, m, d);
  if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) return null;
  return toIso(y, m, d);
}

// Sisipkan "-" otomatis saat user mengetik angka
function maskInput(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

export default function DatePicker({ value, onChange, min, max, placeholder = 'dd-mm-yyyy' }: DatePickerProps) {
  const [text, setText] = useState(isoToDisplay(value));
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(isoToDisplay(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const isDisabled = (iso: string) => (!!min && iso < min) || (!!max && iso > max);

  const openCalendar = () => {
    const base = value ? new Date(`${value}T00:00:00`) : min ? new Date(`${min}T00:00:00`) : new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setOpen(true);
  };

  const handleTextChange = (raw: string) => {
    const masked = maskInput(raw);
    setText(masked);
    if (masked === '') {
      onChange('');
      return;
    }
    const iso = displayToIso(masked);
    if (iso) onChange(iso);
  };

  const handleBlur = () => {
    // Kalau yang diketik tidak lengkap/tidak valid, kembalikan ke nilai terakhir yang valid
    if (text !== '' && !displayToIso(text)) setText(isoToDisplay(value));
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const pickDay = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };

  // Grid kalender dimulai dari hari Senin
  const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const now = new Date();
  const todayIso = toIso(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <div className="date-picker" ref={wrapperRef}>
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        onFocus={openCalendar}
        onBlur={handleBlur}
      />
      <button
        type="button"
        className="date-picker-toggle"
        onClick={() => (open ? setOpen(false) : openCalendar())}
        aria-label="Buka kalender"
      >
        <Calendar size={18} />
      </button>

      {open && (
        <div className="date-picker-popup">
          <div className="date-picker-header">
            <button type="button" onClick={() => shiftMonth(-1)} aria-label="Bulan sebelumnya">
              <ChevronLeft size={18} />
            </button>
            <span>{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={() => shiftMonth(1)} aria-label="Bulan berikutnya">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="date-picker-grid">
            {WEEKDAYS.map((w) => (
              <span key={w} className="date-picker-weekday">{w}</span>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <span key={`empty-${i}`} />;
              const iso = toIso(viewYear, viewMonth, day);
              const classes = ['date-picker-day'];
              if (iso === value) classes.push('selected');
              if (iso === todayIso) classes.push('today');
              return (
                <button
                  key={iso}
                  type="button"
                  className={classes.join(' ')}
                  disabled={isDisabled(iso)}
                  onClick={() => pickDay(iso)}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {!isDisabled(todayIso) && (
            <button type="button" className="date-picker-today-btn" onClick={() => pickDay(todayIso)}>
              Hari ini
            </button>
          )}
        </div>
      )}
    </div>
  );
}
