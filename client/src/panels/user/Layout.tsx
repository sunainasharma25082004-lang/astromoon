import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Heart, FileText, Bell, Settings,
  User, LogOut, Sparkles, Star, Menu, X, Home, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/Auth';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { apiFetch } from '../../config/api';
import { APP_NAME } from '../../constants';

const sidebar = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Orders', path: '/dashboard/orders', icon: ShoppingBag },
  { label: 'Saved Astrologers', path: '/dashboard/saved', icon: Heart },
  { label: 'My Kundlis', path: '/dashboard/kundlis', icon: FileText },
  { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
  { label: 'Become Astrologer', path: '/dashboard/become-astrologer', icon: Star, highlight: true },
  { label: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export default function UserPanelLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const loadUnread = () => {
    if (!token) return;
    apiFetch('/notifications/unread-count', {}, token)
      .then((d: any) => setUnreadCount(d.count || 0))
      .catch(() => {});
  };

  useRealtimeData(loadUnread, 'notifications', [token]);

  const isActive = (path: string) =>
    path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {sidebar.map(item => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onClick}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all ${
            isActive(item.path)
              ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
              : item.highlight
                ? 'text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-100'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </span>
          {item.path === '/dashboard/notifications' && unreadCount > 0 && (
            <span className="text-[10px] bg-white text-violet-700 px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold">
              {unreadCount}
            </span>
          )}
          {isActive(item.path) && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-[#f8f7fc]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-bold text-slate-900 text-sm leading-none">{APP_NAME}</span>
                <span className="block text-[10px] text-violet-600 font-medium tracking-wide">MY ACCOUNT</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/" className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition">
              <Home className="w-3.5 h-3.5" /> Website
            </Link>
            <Link to="/shop" className="hidden sm:block text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3.5 py-2 rounded-full transition">
              Shop
            </Link>
            <button
              onClick={async () => { await signOut(); navigate('/'); }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-5 bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 text-white relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-lg font-bold border border-white/20">
                      {user?.full_name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{user?.full_name || 'User'}</h3>
                      <p className="text-white/70 text-xs truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <nav className="p-3">
                  <NavLinks />
                </nav>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col">
            <div className="p-5 bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{user?.full_name}</p>
                <p className="text-xs text-white/70 truncate max-w-[180px]">{user?.email}</p>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg bg-white/15">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3 flex-1 overflow-y-auto">
              <NavLinks onClick={() => setMobileOpen(false)} />
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}