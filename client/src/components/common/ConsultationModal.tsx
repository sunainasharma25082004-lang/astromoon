import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Phone, Video } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useAuth } from '../../context/Auth';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/dateUtils';
import BookingModal from '../consultation/BookingModal';
import ConsultationRoom from '../consultation/ConsultationRoom';

interface Astrologer {
  id: string;
  _id?: string;
  full_name: string;
  avatar_url?: string;
  chat_price: number;
  call_price: number;
  video_price: number;
  is_online?: boolean;
}

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  astrologer: Astrologer;
  initialType?: 'chat' | 'call' | 'video';
}

export function ConsultationModal({ isOpen, onClose, astrologer, initialType = 'chat' }: ConsultationModalProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [type, setType] = useState<'chat' | 'call' | 'video'>(initialType);

  const handleStart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to start a consultation');
      onClose();
      navigate('/auth/login');
      return;
    }
    if (!astrologer.is_online) {
      toast.error('Astrologer is currently offline');
      return;
    }
    setShowBooking(true);
  };

  const handleBooked = (consultation: any) => {
    setShowBooking(false);
    onClose();
    setActiveRoom(consultation);
  };

  if (!isOpen && !showBooking && !activeRoom) return null;

  return (
    <>
      {isOpen && !showBooking && !activeRoom && (
        <Modal isOpen={isOpen} onClose={onClose} size="md" title={`Consult ${astrologer.full_name}`} showClose>
          <div className="space-y-3 mb-5">
            {(['chat', 'call', 'video'] as const).map(t => {
              const price = t === 'chat' ? astrologer.chat_price : t === 'call' ? astrologer.call_price : astrologer.video_price;
              const Icon = t === 'chat' ? MessageCircle : t === 'call' ? Phone : Video;
              const color = t === 'chat' ? 'blue' : t === 'call' ? 'green' : 'purple';
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition ${
                    type === t
                      ? color === 'blue' ? 'border-blue-500 bg-blue-50' : color === 'green' ? 'border-green-500 bg-green-50' : 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-green-600' : 'text-purple-600'}`} />
                  <div className="flex-1 text-left">
                    <div className="font-semibold capitalize">{t === 'call' ? 'Audio Call' : t}</div>
                    <div className="text-xs text-gray-500">
                      {t === 'chat' ? 'Text only' : t === 'call' ? 'Voice only' : 'Video only'}
                    </div>
                  </div>
                  <span className="font-semibold text-primary-600">{formatCurrency(price)}/min</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 text-center mb-4">🎁 First 5 minutes FREE on your first consultation</p>
          <Button variant="cosmic" size="lg" className="w-full" onClick={handleStart}>
            Start {type === 'call' ? 'Audio Call' : type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        </Modal>
      )}

      {showBooking && (
        <BookingModal
          astrologer={astrologer}
          initialType={type}
          onClose={() => { setShowBooking(false); onClose(); }}
          onBooked={handleBooked}
        />
      )}

      {activeRoom && (
        <ConsultationRoom
          consultation={activeRoom}
          onClose={() => setActiveRoom(null)}
          onComplete={() => setActiveRoom(null)}
        />
      )}
    </>
  );
}