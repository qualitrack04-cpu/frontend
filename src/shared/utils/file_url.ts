export function fileUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('blob:') || path.startsWith('data:')) return path;

  const base = (
    import.meta.env.VITE_API_BASE_URL_PRIORITAS ||
    import.meta.env.VITE_API_BASE_URL_SECOND ||
    import.meta.env.VITE_API_BASE_URL ||
    ''
  ).replace(/\/api\/?$/, '');

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (!base) {
    // In local development, if base is empty, default to backend server port 5146
    return `http://localhost:5146${cleanPath}`;
  }

  return `${base}${cleanPath}`;
}