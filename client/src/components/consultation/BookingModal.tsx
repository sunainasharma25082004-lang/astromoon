import { useState, useEffect } from 'react';
import { X, MessageCircle, Phone, Video } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { API_BASE } from '../../config/api';
import toast from 'react-hot-toast';

interface Props {
  astrologer: any;
  initialType?: 'chat' | 'call' | 'video';
  onClose: () => void;
  onBooked: (consultation: any) => void;
}

export default function BookingModal({ astrologer, initialType = 'chat', onClose, onBooked }: Props) {
  const { token, user } = useAuth();
  const [type, setType] = useState<'chat' | 'call' | 'video'>(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setType(initialType); }, [initialType]);

  const astroId = astrologer._id || astrologer.id;
  const chatPrice = astrologer.chat_price || 25;
  const callPrice = astrologer.call_price || 35;
  const videoPrice = astrologer.video_price || 55;
  const rate = type === 'video' ? videoPrice : type === 'call' ? callPrice : chatPrice;
  const freeMins = user?.free_trial_used ? 0 : (user?.free_minutes_remaining ?? 5);

  const types = [
    { key: 'chat' as const, label: 'Chat', icon: MessageCircle, price: chatPrice, color: 'blue', desc: 'Text only — no audio/video' },
    { key: 'call' as const, label: 'Audio Call', icon: Phone, price: callPrice, color: 'green', desc: 'Voice only — no chat/video' },
    { key: 'video' as const, label: 'Video Call', icon: Video, price: videoPrice, color: 'purple', desc: 'Face to face — no chat mixing' },
  ];

  const handleBook = async () => {
    if (!token) {
      toast.error('Please login first');
      onClose();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/consultations/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ astrologer_id: astroId, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Booking failed');
      toast.success(`${type === 'chat' ? 'Chat' : type === 'call' ? 'Audio call' : 'Video call'} booked!`);
      onBooked(data.consultation);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 flex justify-between border-b bg-gradient-to-r from-sky-50 to-blue-50">
          <div>
            <div className="font-semibold text-lg">Book with {astrologer.full_name}</div>
            <div className="text-sm text-gray-500">Choose one mode — chat, audio or video</div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

          <div className="space-y-2">
            {types.map(t => {
              const Icon = t.icon;
              const selected = type === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`w-full p-4 border-2 rounded-2xl text-left flex items-center gap-4 transition ${
                    selected
                      ? t.color === 'blue' ? 'border-blue-500 bg-blue-50' : t.color === 'green' ? 'border-green-500 bg-green-50' : 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    t.color === 'blue' ? 'bg-blue-100 text-blue-600' : t.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{t.label}</div>
                    <div className="text-xs text-gray-500">{t.desc}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">₹{t.price}/min</div>
                </button>
              );
            })}
          </div>

          <div className="bg-sky-50 p-4 rounded-2xl text-sm border border-sky-100">
            {freeMins > 0 ? (
              <p>🎁 <strong>First {freeMins} minutes FREE!</strong> After that, pay ₹{rate * 5} advance to continue.</p>
            ) : (
              <p>After booking, ₹{rate * 5} advance required for 5 minutes of session time.</p>
            )}
            <div className="font-semibold mt-2 text-sky-700">Rate: ₹{rate}/min</div>
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border font-medium">Cancel</button>
          <button
            onClick={handleBook}
            disabled={loading}
            className={`flex-1 py-3 rounded-2xl text-white font-semibold disabled:opacity-60 ${
              type === 'chat' ? 'bg-blue-600 hover:bg-blue-700' : type === 'call' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading ? 'Booking...' : `Start ${type === 'chat' ? 'Chat' : type === 'call' ? 'Audio Call' : 'Video Call'}`}
          </button>
        </div>
      </div>
    </div>
  );
}