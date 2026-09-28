export function fileUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const base = (
    import.meta.env.VITE_API_BASE_URL_PRIORITAS ||
    import.meta.env.VITE_API_BASE_URL_SECOND ||
    import.meta.env.VITE_API_BASE_URL ||
    ''
  ).replace(/\/api\/?$/, '');
  return `${base}${path}`;
}