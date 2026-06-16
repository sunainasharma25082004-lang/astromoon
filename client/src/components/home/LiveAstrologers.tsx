import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, Star } from 'lucide-react';
import { apiFetch, withIds } from '../../config/api';
import { formatCurrency } from '../../utils/helpers';

export function LiveAstrologers() {
  const [astrologers, setAstrologers] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/astrologers/sections/home')
      .then((data: any) => setAstrologers(withIds(data.online || []).slice(0, 4)))
      .catch(() => apiFetch('/astrologers?online=true').then((d: any) => setAstrologers(withIds(d).slice(0, 4))).catch(() => {}));
  }, []);

  return (
    <section className="py-16 bg-gradient-to-r from-cosmic-navy to-cosmic-purple">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 text-green-400 mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />Live Now
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Astrologers Available Now</h2>
          <p className="text-white/70 max-w-2xl mx-auto">Connect instantly with our online astrologers</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {astrologers.map((astro, index) => (
            <motion.div key={astro.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 group">
              <div className="relative mb-3">
                <img src={astro.avatar_url || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'} alt={astro.full_name} className="w-full aspect-square rounded-xl object-cover" />
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">Online</span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1 truncate">{astro.full_name}</h3>
              <p className="text-white/60 text-xs mb-2">{astro.expertise?.[0] || 'Astrologer'}</p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-amber-400"><Star className="w-4 h-4 mr-1" /><span className="text-sm">{astro.rating}</span></div>
                {astro.is_verified && <span className="text-primary-400 text-xs">✓ Verified</span>}
              </div>
              <Link to={`/astrologer/${astro.id}?action=chat`} className="w-full py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 mr-1" />Chat @ {formatCurrency(astro.chat_price)}/min
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/astrologers" className="inline-flex items-center text-white hover:text-gold-light transition-colors">
            View All Online Astrologers
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}