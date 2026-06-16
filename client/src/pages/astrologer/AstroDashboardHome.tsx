import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Star, Users, MessageCircle, Phone, Video } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import ConsultationRoom from '../../components/consultation/ConsultationRoom';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';

export default function AstroDashboardHome() {
  const { user, token } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);

  const displayName = user?.full_name || 'Astrologer';

  const loadAstroConsultations = async () => {
    if (!token) return;
    try {
      const data = await apiFetch('/consultations/for-astro', {}, token);
      setConsultations(data);
    } catch {}
  };

  const loadEarnings = () => {
    if (!token) return;
    apiFetch('/astrologers/earnings/summary', {}, token).then(setEarnings).catch(() => {});
  };

  useRealtimeData(loadAstroConsultations, 'consultations', [token]);
  useRealtimeData(loadEarnings, 'earnings', [token]);

  useEffect(() => {
    const onIncoming = (e: Event) => {
      const data = (e as CustomEvent).detail;
      loadAstroConsultations();
      if (data?.consultation?.status === 'pending') {
        setActiveRoom(data.consultation);
      }
    };
    window.addEventListener('astro:incoming', onIncoming);
    return () => window.removeEventListener('astro:incoming', onIncoming);
  }, [token]);

  const stats = [
    { label: "Today's Sessions", value: consultations.filter(c => c.status === 'active').length.toString(), icon: Calendar, color: 'bg-amber-100 text-amber-700' },
    { label: 'Pending Requests', value: consultations.filter(c => c.status === 'pending').length.toString(), icon: Users, color: 'bg-orange-100 text-orange-700' },
    { label: 'Avg Rating', value: (earnings?.rating || user?.astrologer_profile?.rating || 0).toString(), icon: Star, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Total Earned', value: `₹${Math.round(earnings?.total_earnings || 0)}`, icon: DollarSign, color: 'bg-emerald-100 text-emerald-700' },
  ];

  const typeIcon = (type: string) => {
    if (type === 'video') return <Video className="w-4 h-4" />;
    if (type === 'call') return <Phone className="w-4 h-4" />;
    return <MessageCircle className="w-4 h-4" />;
  };

  const joinLabel = (type: string, status: string) => {
    const prefix = status === 'pending' ? 'Accept' : 'Join';
    if (type === 'video') return `${prefix} Video`;
    if (type === 'call') return `${prefix} Audio`;
    return `${prefix} Chat`;
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Namaste, {displayName.split(' ')[0]}!</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your consultations — chat, audio and video sessions</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Link to="/astro/consultations" className="bg-white border border-amber-100 hover:border-amber-300 rounded-2xl p-5 transition">
          <Calendar className="w-5 h-5 text-amber-600 mb-2" />
          <div className="font-semibold">All Consultations</div>
          <div className="text-xs text-gray-500">{consultations.length} total sessions</div>
        </Link>
        <Link to="/astro/earnings" className="bg-white border border-amber-100 hover:border-amber-300 rounded-2xl p-5 transition">
          <DollarSign className="w-5 h-5 text-emerald-600 mb-2" />
          <div className="font-semibold">Earnings</div>
          <div className="text-xs text-gray-500">View payouts &amp; withdrawals</div>
        </Link>
        <Link to="/astro/availability" className="bg-white border border-amber-100 hover:border-amber-300 rounded-2xl p-5 transition">
          <Calendar className="w-5 h-5 text-orange-600 mb-2" />
          <div className="font-semibold">Availability</div>
          <div className="text-xs text-gray-500">Set your online hours</div>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-50">
          <h2 className="font-semibold text-gray-900">Incoming / Active Sessions</h2>
          <button onClick={loadAstroConsultations} className="text-sm text-amber-700 font-medium hover:underline">Refresh</button>
        </div>
        <div className="divide-y divide-amber-50">
          {consultations.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">No sessions yet. Stay online to receive requests.</div>
          )}
          {consultations.map((c: any) => {
            const canJoin = ['active', 'pending', 'payment_required'].includes(c.status);
            return (
              <div key={c._id} className="px-5 py-4 flex items-center">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mr-3 ${
                  c.type === 'video' ? 'bg-purple-100 text-purple-600' : c.type === 'call' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {typeIcon(c.type)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{c.user_id?.full_name || 'Client'}</div>
                  <div className="text-xs text-gray-500 capitalize">{c.type} • {c.status}</div>
                </div>
                <div className="text-sm font-semibold text-emerald-600 mr-3">₹{c.per_minute_rate}/min</div>
                {canJoin && (
                  <button onClick={() => setActiveRoom(c)} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-xl font-medium">
                    {joinLabel(c.type, c.status)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {activeRoom && (
        <ConsultationRoom
          consultation={activeRoom}
          onClose={() => { setActiveRoom(null); loadAstroConsultations(); }}
          onComplete={() => { setActiveRoom(null); loadAstroConsultations(); }}
        />
      )}
    </>
  );
}