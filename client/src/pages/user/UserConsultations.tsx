import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, Video, Clock } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import ConsultationRoom from '../../components/consultation/ConsultationRoom';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';

export default function UserConsultations() {
  const { token, refreshUser } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch('/consultations/my', {}, token);
      setConsultations(data);
    } catch {}
    setLoading(false);
  };

  useRealtimeData(load, 'consultations', [token]);

  const typeIcon = (type: string) => {
    if (type === 'video') return <Video className="w-5 h-5" />;
    if (type === 'call') return <Phone className="w-5 h-5" />;
    return <MessageCircle className="w-5 h-5" />;
  };

  const joinLabel = (type: string) => {
    if (type === 'video') return 'Open Video Call';
    if (type === 'call') return 'Open Audio Call';
    return 'Open Chat';
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">My Consultations</h1>
          <p className="text-gray-500 text-sm">All your chat, audio and video sessions</p>
        </div>
        <Link to="/astrologers" className="text-sm px-4 py-2 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700">
          + New Session
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading...</div>
        ) : consultations.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 mb-3">No consultations yet</p>
            <Link to="/astrologers" className="text-sky-600 font-medium text-sm">Browse Astrologers →</Link>
          </div>
        ) : (
          <div className="divide-y divide-sky-50">
            {consultations.map((c: any) => {
              const canJoin = ['active', 'pending', 'payment_required'].includes(c.status);
              return (
                <div key={c._id} className="p-5 flex items-center justify-between hover:bg-sky-50/30">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      c.type === 'video' ? 'bg-purple-100 text-purple-600' : c.type === 'call' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {typeIcon(c.type)}
                    </div>
                    <div>
                      <div className="font-medium">{c.astrologer_id?.full_name || 'Astrologer'}</div>
                      <div className="text-xs text-gray-500 capitalize flex items-center gap-2 mt-0.5">
                        <span>{c.type}</span>
                        <span>•</span>
                        <span className={c.status === 'active' ? 'text-emerald-600' : c.status === 'payment_required' ? 'text-amber-600' : ''}>{c.status}</span>
                        {c.duration_minutes > 0 && <><span>•</span><Clock className="w-3 h-3" /><span>{c.duration_minutes} min</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <div className="font-semibold">₹{c.total_amount || c.billed_amount || 0}</div>
                      <div className="text-xs text-gray-400">₹{c.per_minute_rate}/min</div>
                    </div>
                    {canJoin && (
                      <button onClick={() => setActiveRoom(c)} className="px-4 py-2 text-sm bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-medium">
                        {joinLabel(c.type)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeRoom && (
        <ConsultationRoom
          consultation={activeRoom}
          onClose={() => { setActiveRoom(null); load(); refreshUser?.(); }}
          onComplete={() => { setActiveRoom(null); load(); refreshUser?.(); }}
        />
      )}
    </>
  );
}