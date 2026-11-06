import { useEffect, useState } from 'react';
import api from '../api/axios_instance';

interface DepartmentColorItem {
  name: string;
  color?: string | null;
}

// Warna cadangan kalau department belum ada di API / request gagal
// (nilai ini sama dengan warna default dashboard sebelumnya).
const FALLBACK_DEPARTMENT_COLORS: Record<string, string> = {
  production: '#a855f7',
  packaging: '#3b82f6',
  warehouse: '#ec4899',
  qc: '#22c55e',
};

const DEFAULT_COLOR = '#64748b';
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

/**
 * Mengambil warna aksen department dari API (warna yang diatur admin di
 * halaman Department Management) dan mengembalikan helper `colorFor(name)`.
 */
export function useDepartmentColors() {
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    api
      .get<DepartmentColorItem[]>('/departments')
      .then((response) => {
        if (!active || !Array.isArray(response.data)) return;

        const next: Record<string, string> = {};
        for (const dept of response.data) {
          const key = (dept.name || '').trim().toLowerCase();
          const value = (dept.color || '').trim();
          if (key && HEX_COLOR_REGEX.test(value)) {
            next[key] = value.toUpperCase();
          }
        }

        setColors(next);
      })
      .catch(() => {
        // Diamkan saja: dashboard tetap memakai warna cadangan
      });

    return () => {
      active = false;
    };
  }, []);

  return (departmentName: string): string => {
    const key = (departmentName || '').trim().toLowerCase();
    return colors[key] ?? FALLBACK_DEPARTMENT_COLORS[key] ?? DEFAULT_COLOR;
  };
}