import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { apiFetch, withIds, mediaUrl } from '../../config/api';

export function LiveAstrologers() {
  const [astrologers, setAstrologers] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/astrologers/sections/home')
      .then((data: any) => setAstrologers(withIds(data.featured?.length ? data.featured : data.online || []).slice(0, 4)))
      .catch(() => apiFetch('/astrologers').then((d: any) => setAstrologers(withIds(d).slice(0, 4))).catch(() => {}));
  }, []);

  return (
    <section className="py-16 bg-gradient-to-r from-cosmic-navy to-cosmic-purple">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white/90 mb-4">
            <Star className="w-4 h-4 mr-2 text-gold-light" />Featured Astrologers
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Meet Our Expert Astrologers</h2>
          <p className="text-white/70 max-w-2xl mx-auto">Explore detailed profiles — chat, call & video consultations available in our app</p>
        </div>

        {astrologers.length === 0 && (
          <p className="text-center text-white/70 text-sm mb-6">
            Astrologers coming soon. Admin can add profiles from the panel.
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {astrologers.map((astro, index) => (
            <motion.div key={astro.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 group">
              <div className="relative mb-3">
                <img src={mediaUrl(astro.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(astro.full_name)}&background=7c3aed&color=fff&size=150`} alt={astro.full_name} className="w-full aspect-square rounded-xl object-cover" />
                {astro.availability_status === 'online' && (
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">Online</span>
                )}
              </div>
              <h3 className="text-white font-semibold text-sm mb-1 truncate">{astro.full_name}</h3>
              <p className="text-white/60 text-xs mb-2">{astro.expertise?.slice(0, 2).join(' • ') || 'Astrologer'}</p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-amber-400"><Star className="w-4 h-4 mr-1" /><span className="text-sm">{astro.rating}</span></div>
                <span className="text-white/50 text-xs">{astro.experience} yrs</span>
              </div>
              <Link to={`/astrologer/${astro.id}`} className="w-full py-2 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-lg flex items-center justify-center transition">
                View Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/astrologers" className="inline-flex items-center text-white hover:text-gold-light transition-colors">
            View All Astrologers
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}