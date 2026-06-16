import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MessageCircle, Phone, Video, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/dateUtils';
import { useAuth } from '../../context/Auth';
import BookingModal from '../../components/consultation/BookingModal';
import ConsultationRoom from '../../components/consultation/ConsultationRoom';
import toast from 'react-hot-toast';
import { apiFetch, withIds } from '../../config/api';

interface Astrologer {
  id: string;
  full_name: string;
  avatar_url?: string;
  expertise: string[];
  languages: string[];
  experience: number;
  rating: number;
  total_reviews: number;
  chat_price: number;
  call_price: number;
  video_price: number;
  is_online: boolean;
  is_verified: boolean;
  availability_status?: 'online' | 'offline' | 'busy';
}

export default function AstrologersPage() {
  const { user, token } = useAuth();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ online: false, sortBy: 'rating' as 'rating' | 'price' });
  const [bookingAstro, setBookingAstro] = useState<any>(null);
  const [bookingType, setBookingType] = useState<'chat' | 'call' | 'video'>('chat');
  const [activeRoom, setActiveRoom] = useState<any>(null);

  useEffect(() => { fetchAstrologers(); }, [filters.online]);

  const fetchAstrologers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/astrologers${filters.online ? '?online=true' : ''}`);
      setAstrologers(withIds(data));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const isAstroAvailable = (astro: Astrologer) =>
    astro.availability_status === 'online' || astro.availability_status === 'busy' || astro.is_online;

  const openBooking = (astro: Astrologer, type: 'chat' | 'call' | 'video') => {
    if (!user || !token) {
      toast.error('Please login to book');
      return;
    }
    if (!isAstroAvailable(astro)) {
      toast.error('Astrologer is offline — pick someone online');
      return;
    }
    setBookingType(type);
    setBookingAstro(astro);
  };

  const filtered = [...astrologers]
    .filter(a => (!filters.online || a.is_online))
    .sort((a, b) => filters.sortBy === 'rating' ? (b.rating || 0) - (a.rating || 0) : (a.chat_price || 0) - (b.chat_price || 0));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3">Find Your Astrologer</h1>
          <p className="text-gray-600 max-w-md mx-auto">Chat, audio call or video — each mode is separate</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button onClick={() => setFilters({ ...filters, online: !filters.online })} className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-medium border transition ${filters.online ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200'}`}>
            <span className="w-2 h-2 bg-current rounded-full mr-2" /> Online Only
          </button>
          <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm">
            <option value="rating">Highest Rated</option>
            <option value="price">Lowest Price</option>
          </select>
          <div className="text-sm text-gray-500 ml-auto hidden sm:block">{filtered.length} astrologers</div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-96 bg-white rounded-2xl animate-pulse border" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((astro, index) => (
              <motion.div key={astro.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.03, 0.3) }} className="bg-white rounded-2xl shadow border overflow-hidden group">
                <div className="relative">
                  <img src={astro.avatar_url || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'} alt={astro.full_name} className="w-full h-48 object-cover" />
                  {isAstroAvailable(astro) && <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-medium flex items-center"><span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse" />{astro.availability_status === 'busy' ? 'BUSY' : 'ONLINE'}</div>}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-lg">{astro.full_name}</h3>
                    <div className="flex items-center text-amber-500 text-sm"><Star className="w-4 h-4 fill-current" /><span className="ml-0.5 font-medium text-gray-800">{astro.rating}</span></div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="inline-flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{astro.experience} yrs</span>
                    <span>{astro.languages?.slice(0, 2).join(' • ')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">{(astro.expertise || []).slice(0, 3).map(e => <span key={e} className="text-[10px] px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">{e}</span>)}</div>

                  {/* Separate action buttons */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <button
                      onClick={() => openBooking(astro, 'chat')}
                      disabled={!isAstroAvailable(astro)}
                      className="flex flex-col items-center py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
                    >
                      <MessageCircle className="w-4 h-4 mb-0.5" />
                      Chat
                      <span className="text-[10px] opacity-70">{formatCurrency(astro.chat_price)}/m</span>
                    </button>
                    <button
                      onClick={() => openBooking(astro, 'call')}
                      disabled={!isAstroAvailable(astro)}
                      className="flex flex-col items-center py-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
                    >
                      <Phone className="w-4 h-4 mb-0.5" />
                      Call
                      <span className="text-[10px] opacity-70">{formatCurrency(astro.call_price)}/m</span>
                    </button>
                    <button
                      onClick={() => openBooking(astro, 'video')}
                      disabled={!isAstroAvailable(astro)}
                      className="flex flex-col items-center py-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
                    >
                      <Video className="w-4 h-4 mb-0.5" />
                      Video
                      <span className="text-[10px] opacity-70">{formatCurrency(astro.video_price)}/m</span>
                    </button>
                  </div>

                  <Link to={`/astrologer/${astro.id}`} className="block py-2 text-center text-sm font-medium rounded-xl border hover:bg-gray-50">
                    View Full Profile
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {bookingAstro && (
        <BookingModal
          astrologer={bookingAstro}
          initialType={bookingType}
          onClose={() => setBookingAstro(null)}
          onBooked={(c) => { setBookingAstro(null); setActiveRoom(c); }}
        />
      )}
      {activeRoom && (
        <ConsultationRoom consultation={activeRoom} onClose={() => setActiveRoom(null)} onComplete={() => setActiveRoom(null)} />
      )}
    </div>
  );
}