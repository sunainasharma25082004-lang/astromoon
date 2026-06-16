import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, DollarSign, Users, Star, Clock, Settings, 
  MessageCircle, Video, Phone, CheckCircle, XCircle, User 
} from 'lucide-react';
import { useAuth } from '../../context/Auth';
import ConsultationRoom from '../../components/consultation/ConsultationRoom';

const astroSidebar = [
  { label: 'Dashboard', path: '/astro', icon: LayoutDashboard },
  { label: 'Consultations', path: '/astro/consultations', icon: Calendar },
  { label: 'Earnings', path: '/astro/earnings', icon: DollarSign },
  { label: 'Availability', path: '/astro/availability', icon: Clock },
  { label: 'My Profile', path: '/astro/profile', icon: User },
  { label: 'Reviews', path: '/astro/reviews', icon: Star },
  { label: 'Settings', path: '/astro/settings', icon: Settings },
];

const upcoming = [
  { id: 'c1', client: 'Rahul Sharma', type: 'chat', time: 'Today 3:30 PM', duration: '15 min', amount: 300 },
  { id: 'c2', client: 'Priya Verma', type: 'video', time: 'Tomorrow 11:00 AM', duration: '25 min', amount: 1250 },
];

const recentEarnings = [
  { id: 'e1', client: 'Amit K.', amount: 450, date: 'Jun 10' },
  { id: 'e2', client: 'Sneha R.', amount: 900, date: 'Jun 9' },
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AstroDashboard() {
  const location = useLocation();
  const { user, token } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);

  const isMain = location.pathname === '/astro';

  const displayName = user?.full_name || 'Astrologer';
  const roleBadge = 'Astrologer';

  const loadAstroConsultations = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/consultations/for-astro`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setConsultations(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    loadAstroConsultations();
  }, [token]);

  // Demo stats for astrologer panel (different from user)
  const stats = [
    { label: 'Today\'s Sessions', value: '4', icon: Calendar, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'This Month Earnings', value: '₹18,450', icon: DollarSign, color: 'bg-amber-50 text-amber-600' },
    { label: 'Avg Rating', value: '4.8', icon: Star, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Total Clients', value: '312', icon: Users, color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Astro Sidebar - different styling */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border overflow-hidden sticky top-24">
              <div className="p-6 bg-gradient-to-br from-cosmic-purple to-secondary-600 text-white">
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden ring-2 ring-white/40">
                    <User className="w-7 h-7" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold">{displayName}</h3>
                    <div className="flex items-center gap-1.5">
                      <p className="text-white/80 text-xs">{roleBadge}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${isOnline ? 'bg-emerald-400/90' : 'bg-white/30'} text-white`}>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsOnline(!isOnline)}
                  className="mt-4 w-full text-xs bg-white/20 hover:bg-white/30 transition py-2 rounded-xl font-medium"
                >
                  {isOnline ? 'Go Offline' : 'Go Online'} • Accept Consultations
                </button>
              </div>

              <nav className="p-4">
                {astroSidebar.map(item => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className={`flex items-center px-4 py-3 rounded-xl mb-1 text-sm ${location.pathname === item.path ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />{item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isMain ? (
              <>
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <h1 className="text-2xl font-display font-bold mb-1">Namaste, {displayName.split(' ')[0]}!</h1>
                    <p className="text-gray-600">Welcome to your Astrologer Panel. Manage your consultations here.</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs bg-white px-3 py-1 rounded-full border">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {isOnline ? 'Available for new consultations' : 'Currently unavailable'}
                  </div>
                </div>

                {/* Astro-specific stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {stats.map((stat, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 12 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.03 }}
                      className="bg-white rounded-2xl shadow border p-5"
                    >
                      <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <Link to="/astro/consultations" className="bg-white border hover:border-purple-200 rounded-2xl p-5 group">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><MessageCircle className="w-5 h-5" /></div>
                      <div>
                        <div className="font-semibold group-hover:text-purple-700">View Upcoming</div>
                        <div className="text-xs text-gray-500">2 consultations scheduled</div>
                      </div>
                    </div>
                  </Link>
                  <Link to="/astro/earnings" className="bg-white border hover:border-amber-200 rounded-2xl p-5 group">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><DollarSign className="w-5 h-5" /></div>
                      <div>
                        <div className="font-semibold group-hover:text-amber-700">Earnings Report</div>
                        <div className="text-xs text-gray-500">Withdrawals &amp; payouts</div>
                      </div>
                    </div>
                  </Link>
                  <Link to="/astro/availability" className="bg-white border hover:border-emerald-200 rounded-2xl p-5 group">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Clock className="w-5 h-5" /></div>
                      <div>
                        <div className="font-semibold group-hover:text-emerald-700">Set Availability</div>
                        <div className="text-xs text-gray-500">Manage your slots</div>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Live Incoming Consultations for this Astrologer */}
                <div className="bg-white rounded-2xl shadow border mb-6 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="font-semibold flex items-center gap-2"><Calendar className="w-4 h-4" /> Incoming / Active Consultations</h2>
                    <button onClick={loadAstroConsultations} className="text-sm text-purple-600">Refresh</button>
                  </div>
                  <div className="divide-y">
                    {consultations.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No pending or active sessions. Your profile is visible to users.</div>}
                    {consultations.map((c: any) => {
                      const clientName = c.user_id?.full_name || 'Client';
                      const canJoin = c.status === 'active' || c.status === 'pending';
                      return (
                        <div key={c._id} className="px-6 py-4 flex items-center">
                          <div className="flex-1">
                            <div className="font-medium">{clientName}</div>
                            <div className="text-sm text-gray-500">{c.type?.toUpperCase()} • Status: {c.status}</div>
                          </div>
                          <div className="text-right mr-4 text-sm font-semibold text-emerald-600">₹{c.total_amount || c.per_minute_rate * 5}</div>
                          {canJoin && (
                            <button onClick={() => setActiveRoom(c)} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-2xl">
                              {c.status === 'pending' ? 'Accept & Join' : 'Join Room'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Earnings summary */}
                <div className="bg-white rounded-2xl shadow border p-5">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-semibold">Recent Earnings</div>
                    <Link to="/astro/earnings" className="text-xs text-amber-600">Full report →</Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentEarnings.map(e => (
                      <div key={e.id} className="flex justify-between bg-gray-50 rounded-xl px-4 py-3 text-sm">
                        <span>{e.client}</span>
                        <span className="font-semibold text-emerald-600">+₹{e.amount}</span>
                        <span className="text-gray-400 text-xs self-center">{e.date}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">Payouts processed every Friday. Next payout: Friday</div>
                </div>

                {activeRoom && (
                  <ConsultationRoom
                    consultation={activeRoom}
                    onClose={() => { setActiveRoom(null); loadAstroConsultations(); }}
                    onComplete={() => { setActiveRoom(null); loadAstroConsultations(); }}
                  />
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
                <p className="text-gray-600 text-sm">This astrologer panel section is under active development.</p>
                <Link to="/astro" className="inline-block mt-4 text-sm text-purple-600">← Back to Astro Dashboard</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
