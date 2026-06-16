import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, Video, PhoneOff, PhoneIncoming, User } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import toast from 'react-hot-toast';

type IncomingData = {
  action?: string;
  type?: string;
  consultation?: any;
  user?: { full_name?: string; avatar_url?: string };
};

interface Props {
  onAccept: (consultation: any) => void;
  onReject?: (consultation: any) => void;
}

const typeConfig: Record<string, { label: string; icon: typeof MessageCircle; color: string; bg: string }> = {
  chat: { label: 'Chat', icon: MessageCircle, color: 'from-blue-600 to-sky-600', bg: 'bg-blue-600' },
  call: { label: 'Audio Call', icon: Phone, color: 'from-emerald-600 to-green-700', bg: 'bg-emerald-600' },
  video: { label: 'Video Call', icon: Video, color: 'from-purple-600 to-violet-700', bg: 'bg-purple-600' },
};

const RING_TIMEOUT_MS = 45000;

function useRingtone(active: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const playTone = () => {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 440;
        gain.gain.value = 0.12;
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          osc2.connect(gain);
          osc2.frequency.value = 554;
          osc2.start();
          osc2.stop(ctx.currentTime + 0.4);
        }, 450);
      } catch {
        // audio blocked
      }
    };

    playTone();
    intervalRef.current = setInterval(playTone, 2000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);
}

export default function IncomingConsultationAlert({ onAccept, onReject }: Props) {
  const { token, user } = useAuth();
  const [incoming, setIncoming] = useState<IncomingData | null>(null);
  const [acting, setActing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alertedIds = useRef<Set<string>>(new Set());

  const dismiss = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIncoming(null);
  }, []);

  const showIncoming = useCallback((data: IncomingData) => {
    if (!data?.consultation) return;
    const status = data.consultation.status;
    if (status && status !== 'pending') return;

    const myAstroId = user?.astrologer_profile_id;
    const consAstroId = data.consultation.astrologer_id?._id || data.consultation.astrologer_id;
    if (myAstroId && consAstroId && String(myAstroId) !== String(consAstroId)) return;

    const id = data.consultation._id;
    if (id && alertedIds.current.has(id)) return;
    if (id) alertedIds.current.add(id);

    setIncoming(data);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIncoming(null);
      toast('Incoming request timed out', { icon: '⏱️' });
    }, RING_TIMEOUT_MS);
  }, [user?.astrologer_profile_id]);

  useEffect(() => {
    const handleIncoming = (e: Event) => {
      showIncoming((e as CustomEvent<IncomingData>).detail);
    };
    window.addEventListener('astro:incoming', handleIncoming);
    return () => window.removeEventListener('astro:incoming', handleIncoming);
  }, [showIncoming]);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useRingtone(!!incoming);

  useEffect(() => {
    if (incoming && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const type = incoming.type || incoming.consultation?.type || 'chat';
      const name = incoming.user?.full_name || incoming.consultation?.user_id?.full_name || 'A client';
      new Notification(`Incoming ${type === 'call' ? 'call' : type}`, {
        body: `${name} is calling you`,
        requireInteraction: true,
      });
    }
  }, [incoming]);

  const accept = async () => {
    if (!incoming?.consultation || !token) return;
    setActing(true);
    try {
      const res = await apiFetch(`/consultations/${incoming.consultation._id}/accept`, { method: 'PATCH' }, token);
      const accepted = res.consultation || { ...incoming.consultation, status: 'active' };
      dismiss();
      onAccept(accepted);
      toast.success('Call accepted!');
    } catch (e: any) {
      toast.error(e.message || 'Could not accept');
    } finally {
      setActing(false);
    }
  };

  const reject = async () => {
    if (!incoming?.consultation || !token) return;
    setActing(true);
    try {
      await apiFetch(`/consultations/${incoming.consultation._id}/reject`, { method: 'PATCH' }, token);
      dismiss();
      onReject?.(incoming.consultation);
      toast('Call declined', { icon: '📵' });
    } catch (e: any) {
      toast.error(e.message || 'Could not decline');
    } finally {
      setActing(false);
    }
  };

  const consType = incoming?.type || incoming?.consultation?.type || 'chat';
  const cfg = typeConfig[consType] || typeConfig.chat;
  const Icon = cfg.icon;
  const clientName = incoming?.user?.full_name || incoming?.consultation?.user_id?.full_name || 'A client';
  const clientAvatar = incoming?.user?.avatar_url || incoming?.consultation?.user_id?.avatar_url;
  const isCallType = consType === 'call' || consType === 'video';

  return (
    <AnimatePresence>
      {incoming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[200] flex flex-col items-center justify-center ${
            isCallType
              ? 'bg-gradient-to-b from-gray-900 via-gray-950 to-black'
              : 'bg-black/70 backdrop-blur-sm p-4'
          }`}
        >
          {isCallType ? (
            /* Instagram-style incoming call screen */
            <div className="flex flex-col items-center w-full max-w-sm px-6 text-white">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute -inset-4 rounded-full border-2 border-white/20 animate-pulse" />
                {clientAvatar ? (
                  <img
                    src={clientAvatar}
                    alt={clientName}
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-white/30 shadow-2xl relative z-10"
                  />
                ) : (
                  <div className={`w-32 h-32 rounded-full ${cfg.bg}/40 flex items-center justify-center ring-4 ring-white/30 relative z-10`}>
                    <User className="w-16 h-16 text-white/80" />
                  </div>
                )}
              </motion.div>

              <p className="text-white/60 text-sm mb-1 flex items-center gap-1.5">
                <PhoneIncoming className="w-4 h-4 animate-bounce" />
                Incoming {cfg.label}
              </p>
              <h2 className="text-3xl font-bold mb-2 text-center">{clientName}</h2>
              <p className="text-white/50 text-sm mb-16">is calling you...</p>

              <div className="flex items-center justify-center gap-16 w-full">
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={reject}
                    disabled={acting}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 transition disabled:opacity-50"
                  >
                    <PhoneOff className="w-7 h-7" />
                  </button>
                  <span className="text-xs text-white/60">Decline</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={accept}
                    disabled={acting}
                    className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition disabled:opacity-50 animate-pulse"
                  >
                    <Icon className="w-7 h-7" />
                  </button>
                  <span className="text-xs text-white/60">Accept</span>
                </div>
              </div>
            </div>
          ) : (
            /* Chat request card */
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${cfg.color} px-6 py-5 text-white`}>
                <div className="flex items-center gap-4">
                  {clientAvatar ? (
                    <img src={clientAvatar} alt={clientName} className="w-14 h-14 rounded-full object-cover ring-2 ring-white/40" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-7 h-7" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/80">Incoming Request</p>
                    <h2 className="text-xl font-bold">{clientName}</h2>
                  </div>
                </div>
              </div>
              <div className="p-6 text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${cfg.color} text-white text-sm font-semibold mb-4`}>
                  <Icon className="w-4 h-4" />
                  {cfg.label} session
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  <strong>{clientName}</strong> wants to start a chat with you.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={reject}
                    disabled={acting}
                    className="flex-1 py-3 rounded-2xl border border-red-200 text-red-600 font-medium hover:bg-red-50 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <PhoneOff className="w-4 h-4" /> Decline
                  </button>
                  <button
                    onClick={accept}
                    disabled={acting}
                    className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-lg disabled:opacity-50"
                  >
                    {acting ? 'Accepting...' : 'Accept Chat'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}