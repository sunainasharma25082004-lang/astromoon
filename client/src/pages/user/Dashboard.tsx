import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, MessageCircle, ShoppingBag, Heart, FileText, Bell, Settings, User, Calendar, Star, Clock } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import BookingModal from '../../components/consultation/BookingModal';
import ConsultationRoom from '../../components/consultation/ConsultationRoom';

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

const recentConsultations = [
  { id: '1', astrologer: 'Acharya Rajesh Kumar', type: 'chat', duration: '15 mins', amount: 300, date: 'Jan 15, 2024', rating: 4.8 },
  { id: '2', astrologer: 'Dr. Priya Sharma', type: 'video', duration: '25 mins', amount: 1375, date: 'Jan 12, 2024', rating: 4.9 },
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function UserDashboard() {
  const location = useLocation();
  const isMain = location.pathname === '/dashboard';
  const { user, token, refreshUser } = useAuth();

  const [consultations, setConsultations] = useState<any[]>([]);
  const [showBooking, setShowBooking] = useState<any>(null); // selected astrologer
  const [activeRoom, setActiveRoom] = useState<any>(null);

  const displayName = user?.full_name || 'User';
  const email = user?.email || '';
  const wallet = user?.wallet_balance || 0;

  const stats = [
    { label: 'Wallet Balance', value: `₹${Math.floor(wallet)}`, icon: Wallet, color: 'bg-green-50 text-green-600' },
    { label: 'Consultations', value: consultations.length.toString(), icon: MessageCircle, color: 'bg-blue-50 text-blue-600' },
    { label: 'Last Order', value: 'Recent', icon: ShoppingBag, color: 'bg-amber-50 text-amber-600' },
  ];

  // Load user's consultations
  const loadMyConsultations = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/consultations/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setConsultations(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    loadMyConsultations();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border overflow-hidden sticky top-24">
              <div className="p-6 bg-gradient-to-br from-cosmic-purple to-secondary-600 text-white">
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden"><User className="w-7 h-7" /></div>
                  <div className="ml-3"><h3 className="font-semibold">{displayName}</h3><p className="text-white/80 text-sm truncate max-w-[140px]">{email}</p></div>
                </div>
              </div>
              <nav className="p-4">{sidebar.map(item => (
                <Link key={item.path} to={item.path} className={`flex items-center px-4 py-3 rounded-xl mb-1 ${location.pathname === item.path ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon className="w-5 h-5 mr-3" />{item.label}
                </Link>
              ))}</nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {isMain ? (
              <>
                <div className="mb-8 flex justify-between items-end">
                  <div>
                    <h1 className="text-2xl font-display font-bold mb-2">Welcome back!</h1>
                    <p className="text-gray-600">User Panel • Here's your activity overview</p>
                  </div>
                  <Link to="/astrologers" className="text-sm px-4 py-2 bg-cosmic-purple text-white rounded-2xl">Browse Astrologers →</Link>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-8">{stats.map(stat => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg border p-5">
                    <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}><stat.icon className="w-5 h-5" /></div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </motion.div>
                ))}</div>

                {/* Live My Consultations */}
                <div className="bg-white rounded-2xl shadow-lg border overflow-hidden mb-6">
                  <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-lg font-semibold">My Consultations</h2>
                    <Link to="/astrologers" className="text-sm text-primary-600 font-medium">+ New Booking</Link>
                  </div>
                  <div className="divide-y">
                    {consultations.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No consultations yet. Book your first session from the Astrologers page.</div>}
                    {consultations.slice(0, 4).map((c: any) => {
                      const astroName = c.astrologer_id?.full_name || 'Astrologer';
                      const isActive = c.status === 'active' || c.status === 'pending';
                      return (
                        <div key={c._id} className="p-5 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${c.type === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                              <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-medium">{astroName}</div>
                              <div className="text-xs text-gray-500">{c.type?.toUpperCase()} • {c.status}</div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <div className="font-semibold">₹{c.total_amount || c.per_minute_rate * 5}</div>
                            </div>
                            {isActive && (
                              <button 
                                onClick={() => setActiveRoom(c)}
                                className="px-4 py-1.5 text-sm bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700"
                              >
                                Join Chat / Video
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Link to="/astrologers" className="bg-gradient-to-r from-cosmic-purple to-secondary-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">Book Consultation</h3>
                    <p className="text-white/80 text-sm mb-3">Connect with 500+ astrologers</p>
                    <span className="inline-flex items-center text-sm font-medium">Browse Astrologers →</span>
                  </Link>
                  <Link to="/wallet" className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">Add Money</h3>
                    <p className="text-white/80 text-sm mb-3">Get bonus on recharge</p>
                    <span className="inline-flex items-center text-sm font-medium">Add Funds →</span>
                  </Link>
                </div>

                {/* Booking + Room Modals */}
                {showBooking && (
                  <BookingModal
                    astrologer={showBooking}
                    onClose={() => setShowBooking(null)}
                    onBooked={(newCons) => {
                      setConsultations(prev => [newCons, ...prev]);
                      setActiveRoom(newCons); // auto open room after booking
                    }}
                  />
                )}

                {activeRoom && (
                  <ConsultationRoom
                    consultation={activeRoom}
                    onClose={() => { setActiveRoom(null); loadMyConsultations(); refreshUser?.(); }}
                    onComplete={() => { setActiveRoom(null); loadMyConsultations(); refreshUser?.(); }}
                  />
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
                <p className="text-gray-600">This section is under development.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
