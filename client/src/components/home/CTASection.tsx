import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle, Phone, Video, ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-cosmic-navy via-cosmic-purple to-cosmic-light relative overflow-hidden">
      <div className="absolute inset-0 stars-pattern" />
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white/90 mb-6">
            <Sparkles className="w-4 h-4 mr-2 text-gold-light" />Start Your Journey Today
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Consult with India's Best Astrologers</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-white/80 text-lg mb-10">Get personalized guidance on career, relationships, and life decisions.</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link to="/astrologers?type=chat" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"><MessageCircle className="w-5 h-5 mr-2" />Chat Now</Link>
            <Link to="/astrologers?type=call" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"><Phone className="w-5 h-5 mr-2" />Call Now</Link>
            <Link to="/astrologers?type=video" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"><Video className="w-5 h-5 mr-2" />Video Call</Link>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="text-white/60 text-sm">First consultation? Get ₹100 bonus in your wallet upon signup!</motion.p>
        </div>
      </div>
    </section>
  );
}
