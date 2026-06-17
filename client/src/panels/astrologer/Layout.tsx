import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Clock, User, Star, LogOut, Moon, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/Auth';
import { APP_NAME } from '../../constants';
import { apiFetch, mediaUrl } from '../../config/api';
import toast from 'react-hot-toast';

const sidebar = [
  { label: 'Dashboard', path: '/astro', icon: LayoutDashboard },
  { label: 'My Profile', path: '/astro/profile', icon: User },
  { label: 'Availability', path: '/astro/availability', icon: Clock },
  { label: 'Reviews', path: '/astro/reviews', icon: Star },
];

export default function AstroPanelLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, signOut, refreshUser } = useAuth();
  const [isOnline, setIsOnline] = useState(false);

  const profile = user?.astrologer_profile || {};
  const avatarSrc = profile.avatar_url
    ? mediaUrl(profile.avatar_url)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'A')}&background=d97706&color=fff`;

  useEffect(() => {
    const status = profile.availability_status;
    if (status) setIsOnline(status === 'online');
  }, [profile.availability_status]);

  const toggleOnline = async () => {
    const newStatus = isOnline ? 'offline' : 'online';
    try {
      await apiFetch('/astrologers/availability', { method: 'PATCH', body: JSON.stringify({ status: newStatus }) }, token);
      setIsOnline(!isOnline);
      await refreshUser();
      toast.success(newStatus === 'online' ? 'You are now visible to users' : 'You are now offline');
    } catch (e: any) {
      toast.error(e.message);
    }
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
            {user?.astrologer_profile_id && (
              <Link to={`/astrologer/${user.astrologer_profile_id}`} className="hidden sm:block text-xs text-amber-100 hover:text-white px-2 py-1">
                View public profile
              </Link>
            )}
            <button
              onClick={toggleOnline}
              className={`text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 ${isOnline ? 'bg-emerald-500 text-white' : 'bg-white/20'}`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </button>
            <button onClick={async () => { await signOut(); navigate('/'); }} className="p-1.5 hover:bg-white/15 rounded-lg">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {!isOnline && (
        <div className="bg-amber-500 text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-3">
          <span>You are OFFLINE — users will not see you as available</span>
          <button onClick={toggleOnline} className="underline font-semibold">Go Online</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-amber-200 overflow-hidden sticky top-20">
              <div className="p-5 bg-gradient-to-br from-amber-600 to-orange-700 text-white">
                <div className="flex items-center gap-3">
                  <img src={avatarSrc} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/30" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{user?.full_name}</h3>
                    <p className="text-amber-100/80 text-xs truncate">{profile.expertise?.[0] || 'Astrologer'}</p>
                  </div>
                </div>
                <Link
                  to="/astro/profile"
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs bg-white/15 hover:bg-white/25 py-2 rounded-xl font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Edit Profile & Photos
                </Link>
              </div>
              <nav className="p-3">
                {sidebar.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-xl mb-0.5 text-sm transition ${
                      location.pathname === item.path
                        ? 'bg-amber-100 text-amber-800 font-semibold'
                        : 'text-gray-600 hover:bg-amber-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2.5" />
                    {item.label}
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