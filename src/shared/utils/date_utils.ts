/**
 * Utility functions for date parsing and formatting.
 * Handles UTC-to-local timezone conversion accurately for timestamps from the backend.
 */

export function parseUtcDate(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Check if it has a time component (T or space with :)
  const hasTime = trimmed.includes('T') || (trimmed.includes(' ') && trimmed.includes(':'));
  const hasTimezone = trimmed.endsWith('Z') || /[+-]\d{2}(:?\d{2})?$/.test(trimmed);

  // If time is present but timezone indicator is missing, append 'Z' so JS treats it as UTC
  const normalized = hasTime && !hasTimezone ? `${trimmed.replace(' ', 'T')}Z` : trimmed;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Formats a date string to:
 * - "Today, HH:mm" if the date is today in local time (e.g. WIB / UTC+7)
 * - "D Month YYYY" if it is another day
 */
export function formatUpdatedDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = parseUtcDate(dateStr);
    if (!d) return dateStr;

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
    return `${day} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

