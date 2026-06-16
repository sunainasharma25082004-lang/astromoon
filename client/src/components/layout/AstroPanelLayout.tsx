import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, DollarSign, Clock, User, Star, Settings, LogOut, Sparkles, Moon
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/Auth';
import { APP_NAME } from '../../constants';

const astroSidebar = [
  { label: 'Dashboard', path: '/astro', icon: LayoutDashboard },
  { label: 'Consultations', path: '/astro/consultations', icon: Calendar },
  { label: 'Earnings', path: '/astro/earnings', icon: DollarSign },
  { label: 'Availability', path: '/astro/availability', icon: Clock },
  { label: 'My Profile', path: '/astro/profile', icon: User },
  { label: 'Reviews', path: '/astro/reviews', icon: Star },
  { label: 'Settings', path: '/astro/settings', icon: Settings },
];

export function AstroPanelLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  const displayName = user?.full_name || 'Astrologer';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90">
              <Moon className="w-5 h-5 text-amber-200" />
              <span className="font-display font-bold text-sm hidden sm:block">{APP_NAME}</span>
            </Link>
            <span className="text-xs bg-amber-400/30 border border-amber-300/40 px-2.5 py-1 rounded-full font-medium">ASTROLOGER PANEL</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 ${
                isOnline ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white/80'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </button>
            <button onClick={handleSignOut} className="p-1.5 hover:bg-white/15 rounded-lg" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-amber-200 overflow-hidden sticky top-20">
              <div className="p-5 bg-gradient-to-br from-amber-600 to-orange-700 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-400/30 flex items-center justify-center ring-2 ring-amber-300/50">
                    <Sparkles className="w-6 h-6 text-amber-100" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{displayName}</h3>
                    <p className="text-amber-100/80 text-xs">Verified Astrologer</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className="mt-3 w-full text-xs bg-white/15 hover:bg-white/25 py-2 rounded-xl font-medium transition"
                >
                  {isOnline ? '● Accepting Consultations' : '○ Not Accepting'}
                </button>
              </div>
              <nav className="p-3">
                {astroSidebar.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-xl mb-0.5 text-sm transition ${
                      location.pathname === item.path
                        ? 'bg-amber-100 text-amber-800 font-semibold'
                        : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2.5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}