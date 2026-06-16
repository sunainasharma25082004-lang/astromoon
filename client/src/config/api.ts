export const API_BASE = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? '' : (typeof window !== 'undefined' ? window.location.origin : ''));

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
    throw new Error('Cannot connect to server. Please check your connection.');
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