import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, MessageCircle, ShoppingBag, Phone, Video, Star } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import BookingModal from '../../components/consultation/BookingModal';
import ConsultationRoom from '../../components/consultation/ConsultationRoom';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';

export default function UserDashboardHome() {
  const { user, token, refreshUser } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);

  const wallet = user?.wallet_balance || 0;
  const freeMins = user?.free_minutes_remaining ?? 5;

  const stats = [
    { label: 'Wallet Balance', value: `₹${Math.floor(wallet)}`, icon: Wallet, color: 'bg-sky-100 text-sky-600' },
    { label: 'Consultations', value: consultations.length.toString(), icon: MessageCircle, color: 'bg-blue-100 text-blue-600' },
    { label: 'Free Minutes', value: user?.free_trial_used ? 'Used' : `${freeMins} min`, icon: Phone, color: 'bg-emerald-100 text-emerald-600' },
  ];

  const loadMyConsultations = async () => {
    if (!token) return;
    try {
      const data = await apiFetch('/consultations/my', {}, token);
      setConsultations(data);
    } catch {}
  };

  useRealtimeData(loadMyConsultations, 'consultations', [token]);

  const typeIcon = (type: string) => {
    if (type === 'video') return <Video className="w-4 h-4" />;
    if (type === 'call') return <Phone className="w-4 h-4" />;
    return <MessageCircle className="w-4 h-4" />;
  };

  const joinLabel = (type: string) => {
    if (type === 'video') return 'Join Video';
    if (type === 'call') return 'Join Call';
    return 'Join Chat';
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Welcome back, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="text-gray-500 text-sm mt-1">Your personal dashboard — chat, call or video with astrologers</p>
        </div>
        <Link to="/astrologers" className="text-sm px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-medium">
          Find Astrologer →
        </Link>
      </div>

      {user?.role === 'user' && (
        <Link
          to="/dashboard/become-astrologer"
          className="block mb-6 bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Become an Astrologer</p>
                <p className="text-sm text-white/80">Apply from your panel — admin will review &amp; give you login access</p>
              </div>
            </div>
            <span className="text-sm font-medium bg-white/20 px-3 py-1.5 rounded-full group-hover:bg-white/30">Apply →</span>
          </div>
        </Link>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {stats.map(stat => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-sky-100 p-5">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden mb-6">
        <div className="flex items-center justify-between p-5 border-b border-sky-50">
          <h2 className="font-semibold text-gray-900">Recent Consultations</h2>
          <Link to="/dashboard/consultations" className="text-sm text-sky-600 font-medium">View All</Link>
        </div>
        <div className="divide-y divide-sky-50">
          {consultations.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">
              No consultations yet. <Link to="/astrologers" className="text-sky-600 font-medium">Book your first session</Link>
            </div>
          )}
          {consultations.slice(0, 4).map((c: any) => {
            const astroName = c.astrologer_id?.full_name || 'Astrologer';
            const isActive = c.status === 'active' || c.status === 'pending' || c.status === 'payment_required';
            return (
              <div key={c._id} className="p-4 flex items-center justify-between hover:bg-sky-50/50">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    c.type === 'video' ? 'bg-purple-100 text-purple-600' : c.type === 'call' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {typeIcon(c.type)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{astroName}</div>
                    <div className="text-xs text-gray-500 capitalize">{c.type} • {c.status}</div>
                  </div>
                </div>
                {isActive && (
                  <button onClick={() => setActiveRoom(c)} className="px-4 py-1.5 text-xs bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-medium">
                    {joinLabel(c.type)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/astrologers" className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl p-5 text-white hover:shadow-lg transition">
          <h3 className="font-semibold mb-1">Book Consultation</h3>
          <p className="text-white/80 text-sm">Chat, audio or video with verified astrologers</p>
        </Link>
        <Link to="/wallet" className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-5 text-white hover:shadow-lg transition">
          <h3 className="font-semibold mb-1">Add Money</h3>
          <p className="text-white/80 text-sm">Recharge wallet — demo payment available</p>
        </Link>
      </div>

      {activeRoom && (
        <ConsultationRoom
          consultation={activeRoom}
          onClose={() => { setActiveRoom(null); loadMyConsultations(); refreshUser?.(); }}
          onComplete={() => { setActiveRoom(null); loadMyConsultations(); refreshUser?.(); }}
        />
      )}
    </>
  );
}