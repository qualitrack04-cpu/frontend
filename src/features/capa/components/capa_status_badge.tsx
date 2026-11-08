import { ChevronDown } from 'lucide-react';
import type { CapaStatusItem } from '../../system_configuration/api/system_config_api';

interface CapaStatusBadgeProps {
  status?: string;
  statusId?: string;
  availableStatuses?: CapaStatusItem[];
  /** Kalau diisi, badge jadi dropdown yang bisa diubah (dipakai di list). */
  onChange?: (statusName: string, statusId: string) => void;
  disabled?: boolean;
}

function hexToRgba(hex?: string, alpha = 0.15): string {
  if (!hex || !hex.startsWith('#')) return `rgba(158, 158, 158, ${alpha})`;
  let c = hex.slice(1);
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  if (c.length >= 6) {
    const r = parseInt(c.slice(0, 2), 16) || 0;
    const g = parseInt(c.slice(2, 4), 16) || 0;
    const b = parseInt(c.slice(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(158, 158, 158, ${alpha})`;
}

function norm(s?: string): string {
  return (s || '').toLowerCase().replace(/[\s_-]/g, '');
}

function getDefaultColor(name: string): string {
  const k = norm(name);
  if (k.includes('open')) return '#EF4444';
  if (k.includes('prog')) return '#F59E0B';
  if (k.includes('pend')) return '#9E9E9E';
  if (k.includes('close') || k.includes('done')) return '#10B981';
  return '#64748B';
}

export default function CapaStatusBadge({
  status = 'Open',
  statusId,
  availableStatuses,
  onChange,
  disabled,
}: CapaStatusBadgeProps) {
  const currentItem = availableStatuses?.find(
    (item) => (statusId && item.id === statusId) || norm(item.name) === norm(status)
  );

  const displayName = currentItem?.name || status || 'Open';
  const color = currentItem?.hexaCode || getDefaultColor(displayName);
  const bgColor = hexToRgba(color, 0.15);
  const isTerminal = currentItem?.isTerminal ?? (norm(displayName) === 'closed');

  // Filter hanya status yang aktif, atau fallback default jika belum termuat
  const activeStatuses =
    availableStatuses && availableStatuses.length > 0
      ? availableStatuses.filter((s) => s.isActive !== false)
      : [
          { id: statusId || 'open', name: displayName, hexaCode: color },
        ];

  if (!onChange || isTerminal) {
    // Varian statis, dipakai di sidebar Detail CAPA atau jika status sudah terminal (Closed)
    return (
      <span
        className="inline-flex items-center justify-center min-w-[90px] px-3 py-1.5 rounded-full text-[12px] font-semibold shrink-0 whitespace-nowrap transition-colors"
        style={{ backgroundColor: bgColor, color }}
      >
        {displayName}
      </span>
    );
  }

  // Varian dropdown: teks + chevron tampil di atas, <select> transparan overlay di bawah
  return (
    <span
      className="inline-flex items-center justify-between min-w-[100px] px-3 py-1.5 rounded-full text-[12px] font-semibold shrink-0 whitespace-nowrap transition-colors relative cursor-pointer"
      style={{ backgroundColor: bgColor, color }}
    >
      <span>{displayName}</span>
      <ChevronDown size={14} className="pointer-events-none opacity-80 ml-2" style={{ color }} />
      <select
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none disabled:cursor-not-allowed"
        value={currentItem?.id || displayName}
        disabled={disabled}
        onChange={(e) => {
          const val = e.target.value;
          const found = activeStatuses.find((s) => s.id === val || norm(s.name) === norm(val));
          if (found && onChange) {
            onChange(found.name, found.id);
          }
        }}
        onClick={(e) => e.stopPropagation()}
        aria-label="Change CAPA status"
      >
        {activeStatuses.map((opt) => (
          <option key={opt.id} value={opt.id} className="text-slate-800 bg-white">
            {opt.name}
          </option>
        ))}
      </select>
    </span>
  );
}
