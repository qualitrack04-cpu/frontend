// Color and Status persistence helper for Finding Categories and CAPA Statuses

// Default colors keyed by category name (lowercase)
const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  'major nc': '#EF4444',
  'minor nc': '#F59E0B',
  ofi: '#3B82F6',
  observation: '#3B82F6',
  major: '#EF4444',
  minor: '#F59E0B',
  conform: '#10B981',
  critical: '#DC2626',
};

// Default colors keyed by CAPA status name (lowercase)
const DEFAULT_STATUS_COLORS: Record<string, string> = {
  open: '#EF4444',
  'in progress': '#F59E0B',
  'under review': '#8B5CF6',
  closed: '#10B981',
  done: '#10B981',
};

// Seeded GUID → color mappings (from migration AddSystemConfigTables)
const GUID_CATEGORY_COLORS: Record<string, string> = {
  '11111111-1111-1111-1111-111111111111': '#F59E0B', // Minor NC
  '22222222-2222-2222-2222-222222222222': '#EF4444', // Major NC
  '33333333-3333-3333-3333-333333333333': '#3B82F6', // OFI / Observation
};

const GUID_STATUS_COLORS: Record<string, string> = {
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa': '#EF4444', // Open
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb': '#F59E0B', // In Progress
  'cccccccc-cccc-cccc-cccc-cccccccccccc': '#10B981', // Closed
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
  // 1. Check localStorage override
  const map = getStoredMap(CATEGORY_COLORS_KEY);
  if (map[id]) return String(map[id]);
  if (name && map[name.toLowerCase()]) return String(map[name.toLowerCase()]);
  // 2. Check seeded GUID defaults
  if (GUID_CATEGORY_COLORS[id]) return GUID_CATEGORY_COLORS[id];
  // 3. Check name-based defaults
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
  // 1. Check localStorage override
  const map = getStoredMap(STATUS_COLORS_KEY);
  if (map[id]) return String(map[id]);
  if (name && map[name.toLowerCase()]) return String(map[name.toLowerCase()]);
  // 2. Check seeded GUID defaults
  if (GUID_STATUS_COLORS[id]) return GUID_STATUS_COLORS[id];
  // 3. Check name-based defaults
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
