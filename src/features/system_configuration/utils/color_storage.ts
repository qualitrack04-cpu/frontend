// Color and Status persistence helper for Finding Categories and CAPA Statuses

const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  conform: '#10B981',
  minor: '#F59E0B',
  major: '#EF4444',
  observation: '#8B5CF6',
  critical: '#DC2626',
};

const DEFAULT_STATUS_COLORS: Record<string, string> = {
  open: '#2563EB',
  'in progress': '#F59E0B',
  'under review': '#8B5CF6',
  closed: '#10B981',
};

const CATEGORY_COLORS_KEY = 'qualitrack_category_colors';
const STATUS_COLORS_KEY = 'qualitrack_status_colors';
const CATEGORY_ACTIVE_KEY = 'qualitrack_category_active';
const STATUS_ACTIVE_KEY = 'qualitrack_status_active';

function getStoredMap(key: string): Record<string, string | boolean> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStoredMap(key: string, map: Record<string, any>) {
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getCategoryColor(id: string, name?: string): string {
  const map = getStoredMap(CATEGORY_COLORS_KEY);
  if (map[id]) return String(map[id]);
  if (name && map[name.toLowerCase()]) return String(map[name.toLowerCase()]);
  if (name && DEFAULT_CATEGORY_COLORS[name.toLowerCase()]) {
    return DEFAULT_CATEGORY_COLORS[name.toLowerCase()];
  }
  return '#2563EB';
}

export function setCategoryColor(idOrName: string, color: string) {
  const map = getStoredMap(CATEGORY_COLORS_KEY);
  map[idOrName] = color;
  setStoredMap(CATEGORY_COLORS_KEY, map);
}

export function getStatusColor(id: string, name?: string): string {
  const map = getStoredMap(STATUS_COLORS_KEY);
  if (map[id]) return String(map[id]);
  if (name && map[name.toLowerCase()]) return String(map[name.toLowerCase()]);
  if (name && DEFAULT_STATUS_COLORS[name.toLowerCase()]) {
    return DEFAULT_STATUS_COLORS[name.toLowerCase()];
  }
  return '#2563EB';
}

export function setStatusColor(idOrName: string, color: string) {
  const map = getStoredMap(STATUS_COLORS_KEY);
  map[idOrName] = color;
  setStoredMap(STATUS_COLORS_KEY, map);
}

export function getCategoryActive(id: string, defaultVal: boolean = true): boolean {
  const map = getStoredMap(CATEGORY_ACTIVE_KEY);
  if (typeof map[id] === 'boolean') return Boolean(map[id]);
  return defaultVal;
}

export function setCategoryActive(id: string, isActive: boolean) {
  const map = getStoredMap(CATEGORY_ACTIVE_KEY);
  map[id] = isActive;
  setStoredMap(CATEGORY_ACTIVE_KEY, map);
}

export function getStatusActive(id: string, defaultVal: boolean = true): boolean {
  const map = getStoredMap(STATUS_ACTIVE_KEY);
  if (typeof map[id] === 'boolean') return Boolean(map[id]);
  return defaultVal;
}

export function setStatusActive(id: string, isActive: boolean) {
  const map = getStoredMap(STATUS_ACTIVE_KEY);
  map[id] = isActive;
  setStoredMap(STATUS_ACTIVE_KEY, map);
}
