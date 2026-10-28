import { ChevronDown } from 'lucide-react';
import { capaStatusLabel, type CapaStatus } from '../api/capa_api';

const STATUS_OPTIONS: CapaStatus[] = ['Open', 'InProgress', 'PendingVerification', 'Closed'];

// Helper function to get color classes based on status
function getStatusClasses(status: CapaStatus) {
  const base = "inline-flex items-center justify-between min-w-[100px] px-3 py-1.5 rounded-md text-[13px] font-semibold shrink-0 whitespace-nowrap transition-colors";
  const s = status.toLowerCase();
  if (s === 'open') return `${base} bg-red-100 text-red-700 hover:bg-red-200`;
  if (s === 'inprogress') return `${base} bg-blue-100 text-blue-700 hover:bg-blue-200`;
  return `${base} bg-emerald-100 text-emerald-700 hover:bg-emerald-200`;
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
      <span className={`${getStatusClasses(status)} !justify-center`}>
        {capaStatusLabel[status]}
      </span>
    );
  }

  // Varian editable: teks + chevron tampil di atas, <select> transparan overlay di bawah
  // agar label tetap terlihat sementara select bisa diklik.
  return (
    <span className={`${getStatusClasses(status)} relative cursor-pointer`}>
      <span>{capaStatusLabel[status]}</span>
      <ChevronDown size={14} className="pointer-events-none opacity-60 ml-2" />
      <select
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none disabled:cursor-not-allowed"
        value={status}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as CapaStatus)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Change CAPA status"
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
