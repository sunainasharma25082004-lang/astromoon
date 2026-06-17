import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, Bell, User, ChevronDown, LogOut, LayoutDashboard, Download } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { APP_NAME, APP_PLAY_STORE_URL } from '../../constants';

const navItems = [
  { label: 'Astrologers', path: '/astrologers' },
  { label: 'Free Kundli', path: '/kundli' },
  { label: 'Horoscope', path: '/horoscope' },
  { label: 'Shop', path: '/shop' },
  { label: 'Become Astrologer', path: '/become-astrologer', highlight: true },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitializing, signOut } = useAuth();
  const showAsLoggedIn = isAuthenticated || (isInitializing && !!user);

  const role = user?.role || 'user';
  const dashboardLink = role === 'admin' ? '/admin' : role === 'astrologer' ? '/astro' : '/dashboard';
  const dashboardLabel = role === 'admin' ? 'Shop Admin' : role === 'astrologer' ? 'Astro Panel' : 'My Account';
  const notificationsLink = role === 'user' ? '/dashboard/notifications' : role === 'admin' ? '/admin' : '/astro';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => { setIsOpen(false); setUserMenuOpen(false); }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-r from-cosmic-navy via-cosmic-purple to-cosmic-light'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className="w-10 h-10 bg-gradient-to-br from-gold-light to-gold rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cosmic-dark" />
            </motion.div>
            <span className={`font-display text-xl font-bold ${isScrolled ? 'text-cosmic-navy' : 'text-white'}`}>{APP_NAME}</span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  'highlight' in item && item.highlight
                    ? isScrolled
                      ? 'text-violet-700 bg-violet-50 hover:bg-violet-100'
                      : 'text-amber-200 bg-white/10 hover:bg-white/20'
                    : isScrolled
                      ? 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a href={APP_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${isScrolled ? 'text-emerald-700 hover:bg-emerald-50' : 'text-emerald-300 hover:bg-white/10'}`}>
              <Download className="w-3.5 h-3.5" />Get App
            </a>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {showAsLoggedIn && user ? (
              <>
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center text-cosmic-dark text-sm font-bold overflow-hidden">
                      {user.full_name?.[0] || <User className="w-4 h-4" />}
                    </div>
                    <span className="hidden md:block text-sm font-medium max-w-[90px] truncate">{user.full_name?.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border py-1.5 z-50 text-sm">
                        <div className="px-4 py-2 border-b text-xs text-gray-500">
                          Signed in as<br />
                          <span className="font-medium text-gray-900">{user.email}</span>
                          <span className="block mt-0.5 capitalize text-violet-600 font-medium">{role} account</span>
                        </div>
                        <Link to={dashboardLink} className="flex items-center px-4 py-2 hover:bg-gray-50 text-gray-700"><LayoutDashboard className="w-4 h-4 mr-2" /> {dashboardLabel}</Link>
                        <button onClick={handleSignOut} className="w-full flex items-center px-4 py-2 text-left text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4 mr-2" /> Sign Out</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link to="/auth/login" className={`flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${isScrolled ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                <User className="w-4 h-4 mr-1.5" /> Login
              </Link>
            )}

            {showAsLoggedIn && (
              <Link to={notificationsLink} className={`p-2 rounded-lg hidden sm:block ${isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white/80 hover:bg-white/10'}`} title="Notifications">
                <Bell className="w-5 h-5" />
              </Link>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className={`lg:hidden p-2 rounded-lg ${isScrolled ? 'text-gray-600' : 'text-white'}`}>{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white border-t shadow-xl">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg ${
                    'highlight' in item && item.highlight
                      ? 'text-violet-700 bg-violet-50 font-semibold hover:bg-violet-100'
                      : 'text-gray-700 hover:bg-primary-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <a href={APP_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="block px-4 py-3 text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium">Download App</a>
              <div className="pt-2 border-t">
                {showAsLoggedIn ? (
                  <>
                    <Link to={dashboardLink} className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">{dashboardLabel}</Link>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg">Sign Out</button>
                  </>
                ) : (
                  <Link to="/get-started" className="block px-4 py-3 font-medium text-primary-600">Login / Register</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}