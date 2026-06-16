import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, MessageCircle, ShoppingBag, Heart, FileText, Bell, Settings, User, LogOut, Sparkles, Star } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/Auth';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { useSocket } from '../../context/SocketContext';
import { apiFetch } from '../../config/api';
import { APP_NAME } from '../../constants';

const sidebar = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Wallet', path: '/wallet', icon: Wallet },
  { label: 'Consultations', path: '/dashboard/consultations', icon: MessageCircle },
  { label: 'Orders', path: '/dashboard/orders', icon: ShoppingBag },
  { label: 'My Kundlis', path: '/dashboard/kundlis', icon: FileText },
  { label: 'Saved', path: '/dashboard/saved', icon: Heart },
  { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', path: '/dashboard/settings', icon: Settings },
  { label: 'Become Astrologer', path: '/dashboard/become-astrologer', icon: Star },
];

export default function UserPanelLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, signOut } = useAuth();
  const { connected } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const wallet = user?.wallet_balance || 0;
  const freeMins = user?.free_minutes_remaining ?? 5;

  const loadUnread = () => {
    if (!token) return;
    apiFetch('/notifications/unread-count', {}, token)
      .then((d: any) => setUnreadCount(d.count || 0))
      .catch(() => {});
  };

  useRealtimeData(loadUnread, 'notifications', [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
              <span className="font-display font-bold text-sm hidden sm:block">{APP_NAME}</span>
            </Link>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">USER PANEL</span>
            <span className={`hidden sm:inline text-[10px] px-2 py-0.5 rounded-full ${connected ? 'bg-emerald-400/25 text-emerald-100' : 'bg-white/10 text-white/60'}`}>
              {connected ? '● LIVE' : '○ sync'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/wallet" className="hidden sm:flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full hover:bg-white/25">
              <Wallet className="w-3.5 h-3.5" /> ₹{Math.floor(wallet)}
            </Link>
            {freeMins > 0 && !user?.free_trial_used && (
              <span className="hidden md:block text-xs bg-emerald-400/30 px-2 py-1 rounded-full">{freeMins} min free</span>
            )}
            <Link to="/astrologers" className="text-xs bg-white text-blue-600 px-3 py-1.5 rounded-full font-semibold hover:bg-blue-50">Book Astrologer</Link>
            <button onClick={async () => { await signOut(); navigate('/'); }} className="p-1.5 hover:bg-white/15 rounded-lg"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-sky-100 overflow-hidden sticky top-20">
              <div className="p-5 bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center"><User className="w-6 h-6" /></div>
                  <div>
                    <h3 className="font-semibold text-sm">{user?.full_name || 'User'}</h3>
                    <p className="text-white/75 text-xs truncate max-w-[130px]">{user?.email}</p>
                  </div>
                </div>
              </div>
              <nav className="p-3">
                {sidebar.map(item => (
                  <Link key={item.path} to={item.path} className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-0.5 text-sm transition ${location.pathname === item.path ? 'bg-sky-100 text-sky-700 font-semibold' : 'text-gray-600 hover:bg-sky-50'}`}>
                    <span className="flex items-center"><item.icon className="w-4 h-4 mr-2.5" />{item.label}</span>
                    {item.path === '/dashboard/notifications' && unreadCount > 0 && (
                      <span className="text-[10px] bg-sky-600 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{unreadCount}</span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          <main className="lg:col-span-3"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}