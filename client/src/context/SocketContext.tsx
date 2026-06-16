import { createContext, useContext, useEffect, useRef, useCallback, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './Auth';
import { createSocketOptions, SOCKET_URL } from '../config/api';

type PanelUpdate = {
  resource: string;
  action?: string;
  title?: string;
  message?: string;
  consultation?: any;
  type?: string;
  user?: { full_name?: string };
  at?: number;
};

interface SocketContextType {
  subscribe: (resources: string | string[], callback: () => void) => () => void;
  connected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, token, refreshUser } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, Set<() => void>>>(new Map());
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const subscribe = useCallback((resources: string | string[], callback: () => void) => {
    const keys = Array.isArray(resources) ? resources : [resources];
    keys.forEach((key) => {
      if (!listenersRef.current.has(key)) listenersRef.current.set(key, new Set());
      listenersRef.current.get(key)!.add(callback);
    });
    return () => {
      keys.forEach((key) => listenersRef.current.get(key)?.delete(callback));
    };
  }, []);

  const dispatch = useCallback((resource: string) => {
    listenersRef.current.get(resource)?.forEach((fn) => fn());
    listenersRef.current.get('*')?.forEach((fn) => fn());
  }, []);

  const handleIncoming = useCallback((data: PanelUpdate) => {
    if (user?.role !== 'astrologer') return;
    if (data.action !== 'incoming' || !data.consultation) return;
    if (data.consultation.status && data.consultation.status !== 'pending') return;

    const myAstroId = user?.astrologer_profile_id;
    const consAstroId = data.consultation.astrologer_id?._id || data.consultation.astrologer_id;
    if (myAstroId && consAstroId && String(myAstroId) !== String(consAstroId)) return;

    const name = data.user?.full_name || data.consultation?.user_id?.full_name || 'A client';
    const type = data.type || data.consultation?.type || 'chat';
    const typeLabel = type === 'video' ? 'Video Call' : type === 'call' ? 'Audio Call' : 'Chat';
    toast(`📞 ${name} — ${typeLabel} incoming!`, {
      icon: '🔔',
      duration: 8000,
      style: { background: '#b45309', color: '#fff', fontWeight: 600 },
    });
    window.dispatchEvent(new CustomEvent('astro:incoming', { detail: data }));
  }, [user?.role, user?.astrologer_profile_id]);

  useEffect(() => {
    if (!token || !user?.id) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const { url, options } = createSocketOptions(token);
    const socket = io(url || window.location.origin, options);
    socketRef.current = socket;

    const joinRooms = () => {
      if (!user?.id) return;
      socket.emit('join_panel', {
        userId: String(user.id),
        role: user.role,
        astrologerProfileId: user.astrologer_profile_id ? String(user.astrologer_profile_id) : null,
      });
    };

    socket.on('connect', () => {
      setConnected(true);
      setConnectionError(null);
      joinRooms();
    });

    socket.io.on('reconnect', () => {
      setConnectionError(null);
      joinRooms();
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      setConnected(false);
      const hint = !SOCKET_URL && !import.meta.env.DEV
        ? 'Set VITE_API_URL or VITE_SOCKET_URL to your backend URL on Render.'
        : 'Check backend is running and CORS allows this site.';
      setConnectionError(err.message || hint);
    });

    socket.on('incoming_consultation', handleIncoming);

    socket.on('panel:update', (data: PanelUpdate) => {
      if (!data?.resource) return;
      dispatch(data.resource);

      if (data.resource === 'wallet') refreshUser();

      if (data.resource === 'notifications' && data.title) {
        toast(data.message || data.title, { icon: '🔔', duration: 4500 });
      }

      if (
        data.resource === 'consultations' &&
        data.action === 'status' &&
        user.role === 'user' &&
        data.message
      ) {
        toast(data.message, { duration: 4000 });
      }
    });

    return () => {
      socket.off('incoming_consultation', handleIncoming);
      socket.off('panel:update');
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token, user?.id, user?.role, user?.astrologer_profile_id, dispatch, refreshUser, handleIncoming]);

  return (
    <SocketContext.Provider value={{ subscribe, connected, connectionError }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}