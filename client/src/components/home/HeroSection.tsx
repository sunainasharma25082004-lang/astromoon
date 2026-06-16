import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Users, BookOpen, ShoppingBag, Download } from 'lucide-react';
import { APP_PLAY_STORE_URL } from '../../constants';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-cosmic-navy via-cosmic-purple to-cosmic-light">
      <div className="absolute inset-0 stars-pattern" />
      <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/20 rounded-full blur-3xl" />
      <motion.div animate={{ y: [0, 20, 0], x: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-gold-light mr-2" /><span className="text-sm text-white/90">India's Trusted Astrology Platform</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
              Discover Expert<span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold to-gold-dark">Astrologers & Guidance</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Browse verified astrologer profiles, read reviews, explore our spiritual shop — and connect via chat, call or video in our mobile app.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/astrologers" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gold-light via-gold to-gold-dark text-cosmic-dark font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                <Users className="w-5 h-5 mr-2" />Browse Astrologers<ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <a href={APP_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all">
                <Download className="w-5 h-5 mr-2" />Download App
              </a>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-sm text-white/80">⭐ Verified Astrologers</div>
              <div className="text-sm text-white/80">🛍️ Spiritual Shop</div>
              <div className="text-sm text-white/80">📱 App for Live Consultations</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="grid gap-4">
            {[
              { Icon: Users, label: 'Astrologer Profiles', desc: 'Full bio, expertise, reviews & ratings', path: '/astrologers', color: 'from-blue-500 to-blue-600' },
              { Icon: ShoppingBag, label: 'Spiritual Shop', desc: 'Gemstones, rudraksha, yantras & more', path: '/shop', color: 'from-amber-500 to-amber-600' },
              { Icon: BookOpen, label: 'Free Tools', desc: 'Kundli, horoscope & astrology blog', path: '/kundli', color: 'from-purple-500 to-purple-600' },
            ].map((item, i) => (
              <Link key={item.label} to={item.path}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} whileHover={{ scale: 1.02, x: 10 }} className="flex items-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mr-5 group-hover:scale-110 transition-transform`}>
                    <item.Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">{item.label}</h3>
                    <p className="text-white/70 text-sm">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-2 transition-all" />
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}