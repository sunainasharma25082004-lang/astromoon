import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, MessageCircle, Phone, Video } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-cosmic-navy via-cosmic-purple to-cosmic-light">
      <div className="absolute inset-0 stars-pattern" />
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/20 rounded-full blur-3xl" />
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-gold-light mr-2" /><span className="text-sm text-white/90">Trusted by 1 Million+ Users</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
              Discover Your Destiny with<span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold to-gold-dark">Cosmic Wisdom</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">Connect with verified astrologers for personalized consultations on career, relationships, health, and life decisions.</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/astrologers" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gold-light via-gold to-gold-dark text-cosmic-dark font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                <Sparkles className="w-5 h-5 mr-2" />Consult Now<ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/kundli" className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all">Free Kundli</Link>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center"><div className="flex -space-x-2">{[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-cosmic-navy bg-gradient-to-br from-cosmic-light to-secondary-600" />)}</div><span className="ml-3 text-sm text-white/80">50,000+ Happy Users</span></div>
              <div className="text-sm text-white/80">⭐ 4.9 Rating</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="grid gap-4">
            {[
              { Icon: MessageCircle, label: 'Chat', color: 'from-blue-500 to-blue-600' },
              { Icon: Phone, label: 'Call', color: 'from-green-500 to-green-600' },
              { Icon: Video, label: 'Video', color: 'from-purple-500 to-purple-600' },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} whileHover={{ scale: 1.02, x: 10 }} className="flex items-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 cursor-pointer group">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mr-5 group-hover:scale-110 transition-transform`}><item.Icon className="w-8 h-8 text-white" /></div>
                <div className="flex-1"><h3 className="text-xl font-semibold text-white">{item.label} with Astrologer</h3><p className="text-white/70 text-sm">Connect instantly for guidance</p></div>
                <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-2 transition-all" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
