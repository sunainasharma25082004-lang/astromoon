import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, MessageCircle, ShoppingBag, Heart, FileText, Bell, Settings, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/Auth';
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
];

export function UserPanelLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const displayName = user?.full_name || 'User';
  const wallet = user?.wallet_balance || 0;
  const freeMins = user?.free_minutes_remaining ?? 5;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      {/* User Panel Top Bar */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-sm hidden sm:block">{APP_NAME}</span>
            </Link>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">USER PANEL</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/wallet" className="hidden sm:flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full hover:bg-white/25">
              <Wallet className="w-3.5 h-3.5" /> ₹{Math.floor(wallet)}
            </Link>
            {freeMins > 0 && !user?.free_trial_used && (
              <span className="hidden md:block text-xs bg-emerald-400/30 px-2 py-1 rounded-full">{freeMins} min free</span>
            )}
            <Link to="/astrologers" className="text-xs bg-white text-blue-600 px-3 py-1.5 rounded-full font-semibold hover:bg-blue-50">
              Book Astrologer
            </Link>
            <button onClick={handleSignOut} className="p-1.5 hover:bg-white/15 rounded-lg" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-sky-100 overflow-hidden sticky top-20">
              <div className="p-5 bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center ring-2 ring-white/40">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{displayName}</h3>
                    <p className="text-white/75 text-xs truncate max-w-[130px]">{user?.email}</p>
                  </div>
                </div>
              </div>
              <nav className="p-3">
                {sidebar.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-xl mb-0.5 text-sm transition ${
                      location.pathname === item.path
                        ? 'bg-sky-100 text-sky-700 font-semibold'
                        : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600'
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