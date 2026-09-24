import { ChevronDown } from 'lucide-react';
import { capaStatusLabel, type CapaStatus } from '../api/capa_api';

const STATUS_OPTIONS: CapaStatus[] = ['Open', 'InProgress', 'PendingVerification', 'Closed'];

// Kelas warna per status. "capa-status--" + status (huruf kecil semua).
function statusClass(status: CapaStatus) {
  return `capa-status capa-status--${status.toLowerCase()}`;
}

interface CapaStatusBadgeProps {
  status: CapaStatus;
  /** Kalau diisi, badge jadi dropdown yang bisa diubah (dipakai di list). */
  onChange?: (status: CapaStatus) => void;
  disabled?: boolean;
}

export default function CapaStatusBadge({ status, onChange, disabled }: CapaStatusBadgeProps) {
  if (!onChange) {
    // Varian statis, dipakai di sidebar Detail CAPA.
    return (
      <span className={statusClass(status)}>
        <span className="capa-status-dot" />
        {capaStatusLabel[status]}
      </span>
    );
  }

  return (
    <span className={`${statusClass(status)} capa-status--editable`}>
      <select
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
      <ChevronDown size={16} className="capa-status-chevron" />
    </span>
  );
}
