const rawApiUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export const API_BASE = rawApiUrl;

function resolveSocketUrl() {
  if (import.meta.env.VITE_SOCKET_URL) {
    return String(import.meta.env.VITE_SOCKET_URL).replace(/\/$/, '');
  }
  if (import.meta.env.DEV) return '';
  if (rawApiUrl.startsWith('http')) {
    return rawApiUrl.replace(/\/api$/, '');
  }
  return '';
}

export const SOCKET_URL = resolveSocketUrl();

export function createSocketOptions(token?: string | null) {
  const url = SOCKET_URL || (import.meta.env.DEV ? undefined : undefined);
  return {
    url: url || undefined,
    options: {
      path: '/socket.io',
      transports: ['polling', 'websocket'] as ('polling' | 'websocket')[],
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 3000,
      timeout: 20000,
    },
  };
}

export function authHeaders(token?: string | null) {
  const t = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function apiFetch(path: string, options: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    ...authHeaders(token) as Record<string, string>,
  };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      'Cannot connect to server. Start the backend: cd server && npm run dev (or run npm run dev from project root).'
    );
  }
  const text = await res.text();
  let data: any = {};
  if (text) {
    try { data = JSON.parse(text); } catch { throw new Error('Invalid server response'); }
  }
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export function withId<T extends Record<string, any>>(item: T): T & { id: string } {
  return { ...item, id: item.id || item._id };
}

export function withIds<T extends Record<string, any>>(items: T[]): (T & { id: string })[] {
  return Array.isArray(items) ? items.map(withId) : [];
}

/** Backend origin for static uploads (Render / production) */
export function uploadOrigin(): string {
  if (rawApiUrl.startsWith('http')) {
    return rawApiUrl.replace(/\/api$/, '');
  }
  return '';
}

/** Resolve data URLs, absolute URLs, or /uploads paths */
export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const origin = uploadOrigin();
  return origin ? `${origin}${normalized}` : normalized;
}