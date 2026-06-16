import { useEffect, useState } from 'react';
import { Calendar, MessageCircle, Phone, Video } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import ConsultationRoom from '../../components/consultation/ConsultationRoom';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';

export default function AstroConsultations() {
  const { token } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!token) return;
    apiFetch('/consultations/for-astro', {}, token).then(setConsultations).catch(() => {}).finally(() => setLoading(false));
  };

  useRealtimeData(load, 'consultations', [token]);

  useEffect(() => {
    const onIncoming = (e: Event) => {
      const data = (e as CustomEvent).detail;
      load();
      if (data?.consultation?.status === 'pending') setActiveRoom(data.consultation);
    };
    window.addEventListener('astro:incoming', onIncoming);
    return () => window.removeEventListener('astro:incoming', onIncoming);
  }, [token]);

  const typeIcon = (type: string) => type === 'video' ? <Video className="w-4 h-4" /> : type === 'call' ? <Phone className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />;

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">All Consultations</h1>
          <p className="text-gray-500 text-sm">{consultations.length} total sessions</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
        {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : consultations.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">No consultations yet. Stay online to receive requests.</div>
        ) : (
          <div className="divide-y divide-amber-50">
            {consultations.map((c: any) => {
              const canJoin = ['active', 'pending', 'payment_required'].includes(c.status);
              return (
                <div key={c._id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.type === 'video' ? 'bg-purple-100 text-purple-600' : c.type === 'call' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{typeIcon(c.type)}</div>
                    <div>
                      <div className="font-medium text-sm">{c.user_id?.full_name || 'Client'}</div>
                      <div className="text-xs text-gray-500 capitalize">{c.type} • {c.status} • ₹{c.per_minute_rate}/min</div>
                    </div>
                  </div>
                  {canJoin && (
                    <button onClick={() => setActiveRoom(c)} className="px-4 py-2 bg-amber-600 text-white text-sm rounded-xl font-medium hover:bg-amber-700">
                      {c.status === 'pending' ? 'Accept' : 'Join'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {activeRoom && <ConsultationRoom consultation={activeRoom} onClose={() => { setActiveRoom(null); load(); }} onComplete={() => { setActiveRoom(null); load(); }} />}
    </>
  );
}