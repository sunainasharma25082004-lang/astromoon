import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, DollarSign, Clock, User, Star, Settings, LogOut, Moon, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/Auth';
import { APP_NAME } from '../../constants';
import { apiFetch } from '../../config/api';
import { useSocket } from '../../context/SocketContext';
import IncomingConsultationAlert from '../../components/consultation/IncomingConsultationAlert';
import ConsultationRoom from '../../components/consultation/ConsultationRoom';
import toast from 'react-hot-toast';

const sidebar = [
  { label: 'Dashboard', path: '/astro', icon: LayoutDashboard },
  { label: 'Consultations', path: '/astro/consultations', icon: Calendar },
  { label: 'Earnings', path: '/astro/earnings', icon: DollarSign },
  { label: 'Availability', path: '/astro/availability', icon: Clock },
  { label: 'My Profile', path: '/astro/profile', icon: User },
  { label: 'Reviews', path: '/astro/reviews', icon: Star },
  { label: 'Settings', path: '/astro/settings', icon: Settings },
];

export default function AstroPanelLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, signOut, refreshUser } = useAuth();
  const { connected, connectionError } = useSocket();
  const [isOnline, setIsOnline] = useState(false);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const polledIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const me = await apiFetch('/auth/me', {}, token);
        const profile = me.user?.astrologer_profile || me.astrologer_profile;
        const status = profile?.availability_status;
        if (cancelled) return;

        if (status === 'offline' || !status) {
          await apiFetch('/astrologers/availability', {
            method: 'PATCH',
            body: JSON.stringify({ status: 'online' }),
          }, token);
          if (!cancelled) {
            setIsOnline(true);
            toast.success('You are online — ready to receive calls & chats');
          }
        } else {
          setIsOnline(status === 'online');
        }
        await refreshUser();
      } catch {
        // status syncs when profile loads
      }
    })();

    return () => { cancelled = true; };
  }, [token, refreshUser]);

  useEffect(() => {
    const status = user?.astrologer_profile?.availability_status;
    if (status) setIsOnline(status === 'online');
  }, [user?.astrologer_profile?.availability_status]);

  // Fallback poll — ensures incoming calls show even if socket misses an event
  useEffect(() => {
    if (!token || !isOnline) return;
    const checkPending = async () => {
      try {
        const list = await apiFetch('/consultations/for-astro', {}, token);
        const pending = (list || []).find((c: any) => c.status === 'pending');
        if (pending && !polledIds.current.has(pending._id)) {
          polledIds.current.add(pending._id);
          window.dispatchEvent(new CustomEvent('astro:incoming', {
            detail: {
              action: 'incoming',
              type: pending.type,
              consultation: pending,
              user: pending.user_id,
            },
          }));
        }
      } catch {
        // silent
      }
    };
    checkPending();
    const interval = setInterval(checkPending, 6000);
    return () => clearInterval(interval);
  }, [token, isOnline]);

  const toggleOnline = async () => {
    const newStatus = isOnline ? 'offline' : 'online';
    try {
      await apiFetch('/astrologers/availability', { method: 'PATCH', body: JSON.stringify({ status: newStatus }) }, token);
      setIsOnline(!isOnline);
      toast.success(newStatus === 'online' ? 'You are now online' : 'You are now offline');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90"><Moon className="w-5 h-5 text-amber-200" /><span className="font-display font-bold text-sm hidden sm:block">{APP_NAME}</span></Link>
            <span className="text-xs bg-amber-400/30 border border-amber-300/40 px-2.5 py-1 rounded-full font-medium">ASTROLOGER PANEL</span>
            <span className={`hidden sm:inline text-[10px] px-2 py-0.5 rounded-full ${connected ? 'bg-emerald-500/30 text-emerald-100' : 'bg-white/10 text-white/50'}`}>
              {connected ? '● LIVE' : '○ sync'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleOnline} className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 ${isOnline ? 'bg-emerald-500 text-white' : 'bg-white/20'}`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />{isOnline ? 'Online' : 'Offline'}
            </button>
            <button onClick={async () => { await signOut(); navigate('/'); }} className="p-1.5 hover:bg-white/15 rounded-lg"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      {!connected && (
        <div className="bg-red-600 text-white text-center text-sm py-2 px-4">
          Real-time connection lost — calls &amp; chat alerts may not work.
          {connectionError ? ` (${connectionError})` : ' Set VITE_SOCKET_URL to your backend on Render, then redeploy frontend.'}
        </div>
      )}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-3">
          <span>You are OFFLINE — users cannot reach you</span>
          <button onClick={toggleOnline} className="underline font-semibold">Go Online</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-amber-200 overflow-hidden sticky top-20">
              <div className="p-5 bg-gradient-to-br from-amber-600 to-orange-700 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-400/30 flex items-center justify-center"><Sparkles className="w-6 h-6" /></div>
                  <div>
                    <h3 className="font-semibold text-sm">{user?.full_name}</h3>
                    <p className="text-amber-100/80 text-xs">Verified Astrologer</p>
                  </div>
                </div>
                <button onClick={toggleOnline} className="mt-3 w-full text-xs bg-white/15 hover:bg-white/25 py-2 rounded-xl font-medium">
                  {isOnline ? '● Accepting Consultations' : '○ Not Accepting'}
                </button>
              </div>
              <nav className="p-3">
                {sidebar.map(item => (
                  <Link key={item.path} to={item.path} className={`flex items-center px-3 py-2.5 rounded-xl mb-0.5 text-sm transition ${location.pathname === item.path ? 'bg-amber-100 text-amber-800 font-semibold' : 'text-gray-600 hover:bg-amber-50'}`}>
                    <item.icon className="w-4 h-4 mr-2.5" />{item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          <main className="lg:col-span-3"><Outlet /></main>
        </div>
      </div>

      <IncomingConsultationAlert
        onAccept={(consultation) => setActiveRoom({ ...consultation, status: 'active' })}
        onReject={() => refreshUser()}
      />
      {activeRoom && (
        <ConsultationRoom
          consultation={activeRoom}
          onClose={() => setActiveRoom(null)}
          onComplete={() => setActiveRoom(null)}
        />
      )}
    </div>
  );
}