import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function parseApiResponse(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Server returned an invalid response. Please try again.');
  }
}

async function apiFetch(path: string, options?: RequestInit) {
  try {
    return await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error(
      'Cannot connect to server. Make sure the backend is running (npm run dev:server or npm run dev).'
    );
  }
}

interface User { 
  _id?: string; 
  id?: string; 
  email: string; 
  full_name: string; 
  phone?: string;
  wallet_balance: number; 
  role?: 'user' | 'astrologer' | 'admin';
  astrologer_profile_id?: string | null;
  astrologer_profile?: any;
  free_trial_used?: boolean;
  free_minutes_remaining?: number;
  referral_code?: string;
}

interface AuthContextType { 
  user: User | null; 
  isAuthenticated: boolean;
  isInitializing: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<User>; 
  signUp: (email: string, password: string, full_name: string, role?: 'user' | 'astrologer', extra?: Record<string, unknown>) => Promise<User>;
  signInOtp: (phone: string, otp: string, full_name?: string) => Promise<User>;
  sendOtp: (phone: string) => Promise<void>;
  signInGoogle: (data: { google_id: string; email: string; full_name: string; avatar_url?: string }) => Promise<User>;
  updateProfile: (data: Record<string, unknown>) => Promise<User>;
  signOut: () => Promise<void>; 
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistUser(u: User | null) {
  if (u) localStorage.setItem('user', JSON.stringify(u));
  else localStorage.removeItem('user');
}

function normalizeUser(u: Record<string, unknown>): User {
  return {
    id: String(u._id || u.id || ''),
    email: String(u.email || ''),
    full_name: String(u.full_name || ''),
    phone: u.phone ? String(u.phone) : undefined,
    wallet_balance: Number(u.wallet_balance) || 0,
    role: (u.role as User['role']) || 'user',
    astrologer_profile_id: u.astrologer_profile_id ? String(u.astrologer_profile_id) : null,
    astrologer_profile: (u.astrologer_profile as User['astrologer_profile']) || null,
    free_trial_used: Boolean(u.free_trial_used),
    free_minutes_remaining: u.free_minutes_remaining as number | undefined,
    referral_code: u.referral_code ? String(u.referral_code) : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const storedToken = localStorage.getItem('token');
  const [user, setUser] = useState<User | null>(() => (storedToken ? readCachedUser() : null));
  const [token, setToken] = useState<string | null>(storedToken);
  const [isInitializing, setIsInitializing] = useState(!!storedToken);

  const applyUser = (next: User | null) => {
    setUser(next);
    persistUser(next);
  };

  const fetchMe = async (authToken: string) => {
    try {
      const res = await apiFetch('/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        const u = data.user || data;
        applyUser(normalizeUser(u));
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        setToken(null);
        applyUser(null);
      }
    } catch (e) {
      console.error('Failed to fetch user', e);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMe(token);
    } else {
      setIsInitializing(false);
    }
  }, [token]);

  const signIn = async (email: string, password: string): Promise<User> => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error(data.message || 'Login failed');
    
    const loggedUser = normalizeUser({ ...data.user, role: data.user.role || 'user' });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    applyUser(loggedUser);
    setIsInitializing(false);
    if (loggedUser.role === 'astrologer') fetchMe(data.token);
    return loggedUser;
  };

  const signUp = async (email: string, password: string, full_name: string, role: 'user' | 'astrologer' = 'user', extra: Record<string, unknown> = {}): Promise<User> => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name, role, ...extra })
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    const loggedUser = normalizeUser({ ...data.user, role: data.user.role || 'user' });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    applyUser(loggedUser);
    setIsInitializing(false);
    return loggedUser;
  };

  const sendOtp = async (phone: string) => {
    const res = await apiFetch('/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
    if (data.dev_otp) console.log('[DEV OTP]', data.dev_otp);
  };

  const signInOtp = async (phone: string, otp: string, full_name?: string): Promise<User> => {
    const res = await apiFetch('/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, full_name }),
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error(data.message || 'OTP verification failed');
    const loggedUser = normalizeUser({ ...data.user, role: data.user.role || 'user' });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    applyUser(loggedUser);
    setIsInitializing(false);
    return loggedUser;
  };

  const signInGoogle = async (gData: { google_id: string; email: string; full_name: string; avatar_url?: string }): Promise<User> => {
    const res = await apiFetch('/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gData),
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error(data.message || 'Google login failed');
    const loggedUser = normalizeUser({ ...data.user, role: data.user.role || 'user' });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    applyUser(loggedUser);
    setIsInitializing(false);
    return loggedUser;
  };

  const updateProfile = async (profileData: Record<string, unknown>): Promise<User> => {
    const res = await apiFetch('/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(profileData),
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error(data.message || 'Profile update failed');
    const updated = normalizeUser({ ...user, ...data.user });
    applyUser(updated);
    return updated;
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setToken(null);
    applyUser(null);
    setIsInitializing(false);
  };

  const refreshUser = async () => {
    if (token) await fetchMe(token);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!token && !!user,
    isInitializing,
    token,
    signIn,
    signUp,
    sendOtp,
    signInOtp,
    signInGoogle,
    updateProfile,
    signOut,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { 
  const ctx = useContext(AuthContext); 
  if (!ctx) throw new Error('useAuth must be used within AuthProvider'); 
  return ctx; 
}
