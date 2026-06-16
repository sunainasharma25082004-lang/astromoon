import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const astrologers = [
  { id: '1', name: 'Acharya Rajesh Kumar', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150', expertise: 'Vedic Astrology', rating: 4.8, chat_price: 20, is_verified: true },
  { id: '2', name: 'Dr. Priya Sharma', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150', expertise: 'Numerology & Tarot', rating: 4.9, chat_price: 25, is_verified: true },
  { id: '3', name: 'Sunita Devi', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', expertise: 'Tarot Reading', rating: 4.6, chat_price: 22, is_verified: true },
  { id: '4', name: 'Guru Ramesh Iyer', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150', expertise: 'Vedic Expert', rating: 4.9, chat_price: 35, is_verified: true },
];

export function LiveAstrologers() {
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
                <img src={astro.avatar} alt={astro.name} className="w-full aspect-square rounded-xl object-cover" />
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">Online</span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1 truncate">{astro.name}</h3>
              <p className="text-white/60 text-xs mb-2">{astro.expertise}</p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-amber-400"><Star className="w-4 h-4 mr-1" /><span className="text-sm">{astro.rating}</span></div>
                {astro.is_verified && <span className="text-primary-400 text-xs">✓ Verified</span>}
              </div>
              <Link to={`/astrologer/${astro.id}?action=chat`} className="w-full py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 mr-1" />Chat @ {formatCurrency(astro.chat_price)}/min
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
