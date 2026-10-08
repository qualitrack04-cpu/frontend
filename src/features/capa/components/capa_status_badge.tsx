import { ChevronDown } from 'lucide-react';
import { capaStatusLabel, type CapaStatus } from '../api/capa_api';

const STATUS_OPTIONS: CapaStatus[] = ['Open', 'InProgress', 'PendingVerification', 'Closed'];

// Helper function to get color classes based on status
function getStatusClasses(status: CapaStatus) {
  const base = "inline-flex items-center gap-[6px] p-[4px_10px] rounded-[20px] text-[11px] font-bold uppercase shrink-0 whitespace-nowrap border";
  const s = status.toLowerCase();
  if (s === 'open') return `${base} bg-[#eff6ff] border-[#bfdbfe] text-[#1e3a8a]`;
  if (s === 'inprogress') return `${base} bg-[#fffbeb] border-[#fde68a] text-[#92400e]`;
  if (s === 'pendingverification') return `${base} bg-[#faf5ff] border-[#e9d5ff] text-[#581c87]`;
  return `${base} bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]`;
}

function getDotClass(status: CapaStatus) {
  const s = status.toLowerCase();
  const base = "w-[6px] h-[6px] rounded-full";
  if (s === 'open') return `${base} bg-[#3b82f6]`;
  if (s === 'inprogress') return `${base} bg-[#f59e0b]`;
  if (s === 'pendingverification') return `${base} bg-[#8b5cf6]`;
  return `${base} bg-[#10b981]`;
}

interface CapaStatusBadgeProps {
  status: CapaStatus;
  /** Kalau diisi, badge jadi dropdown yang bisa diubah (dipakai di list). */
  onChange?: (status: CapaStatus) => void;
  disabled?: boolean;
}

export default function CapaStatusBadge({ status, onChange, disabled }: CapaStatusBadgeProps) {
  if (!onChange || status === 'Closed') {
    // Varian statis, dipakai di sidebar Detail CAPA atau jika status sudah Closed (selesai).
    return (
      <span className={getStatusClasses(status)}>
        <span className={getDotClass(status)} />
        {capaStatusLabel[status]}
      </span>
    );
  }

  // Varian editable: teks + chevron tampil di atas, <select> transparan overlay di bawah
  // agar label tetap terlihat sementara select bisa diklik.
  return (
    <span className={`${getStatusClasses(status)} relative pr-[28px] cursor-pointer transition-all duration-200 hover:brightness-95`}>
      <span className={getDotClass(status)} />
      <span>{capaStatusLabel[status]}</span>
      <ChevronDown size={14} className="absolute right-[8px] pointer-events-none opacity-60" />
      <select
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none disabled:cursor-not-allowed"
        value={status}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as CapaStatus)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Ubah status CAPA"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {capaStatusLabel[opt]}
          </option>
        ))}
      </select>
    </span>
  );
}
