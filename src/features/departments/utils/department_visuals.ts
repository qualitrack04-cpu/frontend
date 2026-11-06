import { Building2, ClipboardCheck, Factory, Package, Warehouse } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DepartmentItem } from '../api/departments_api';

export interface DepartmentVisual {
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
}

/**
 * Palet warna otomatis. Urutan & nilai HARUS sama dengan
 * AutoColorPalette di DepartmentController.cs supaya warna fallback konsisten
 * antara backend (yang mengirim `color`) dan frontend.
 */
export const AUTO_DEPARTMENT_COLORS = [
  '#2563EB',
  '#9333EA',
  '#DB2777',
  '#059669',
  '#0284C7',
  '#EA580C',
  '#0891B2',
  '#7C3AED',
];

/**
 * Warna otomatis (deterministik) dari nama department.
 * Dipakai hanya jika department belum punya warna tersimpan.
 */
export function autoDepartmentColor(name: string): string {
  if (!name?.trim()) return AUTO_DEPARTMENT_COLORS[0];

  let hash = 0;
  for (const ch of name.trim().toLowerCase()) {
    hash = (hash * 31 + ch.charCodeAt(0)) & 0x7fffffff;
  }

  return AUTO_DEPARTMENT_COLORS[hash % AUTO_DEPARTMENT_COLORS.length];
}

/** Warna aksen department: pakai warna tersimpan, kalau kosong pakai warna otomatis. */
export function resolveDepartmentColor(department: Pick<DepartmentItem, 'name' | 'color'>): string {
  const stored = (department.color || '').trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(stored)) return stored.toUpperCase();
  return autoDepartmentColor(department.name);
}

/** Ikon + warna default yang ditentukan program dari kata kunci nama department. */
export function getDepartmentVisual(name: string): DepartmentVisual {
  const n = (name || '').toLowerCase();

  if (n.includes('control') || n.includes('quality') || n.includes('qc') || n.includes('assurance')) {
    return { icon: ClipboardCheck, bgColor: 'bg-[#E0F2FE]', iconColor: 'text-[#0284C7]' };
  }
  if (n.includes('production') || n.includes('factory')) {
    return { icon: Factory, bgColor: 'bg-[#FCE7F3]', iconColor: 'text-[#DB2777]' };
  }
  if (n.includes('pack') || n.includes('packaging')) {
    return { icon: Package, bgColor: 'bg-[#F3E8FF]', iconColor: 'text-[#9333EA]' };
  }
  if (n.includes('warehouse') || n.includes('storage')) {
    return { icon: Warehouse, bgColor: 'bg-[#D1FAE5]', iconColor: 'text-[#059669]' };
  }

  return { icon: Building2, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' };
}