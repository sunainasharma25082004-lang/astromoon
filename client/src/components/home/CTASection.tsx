import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Download, Users, ShoppingBag, ArrowRight } from 'lucide-react';
import { APP_PLAY_STORE_URL, APP_APK_DOWNLOAD_URL } from '../../constants';

export function CTASection() {
  const apkReady = Boolean(APP_APK_DOWNLOAD_URL);

  return (
    <section className="py-20 bg-gradient-to-br from-cosmic-navy via-cosmic-purple to-cosmic-light relative overflow-hidden">
      <div className="absolute inset-0 stars-pattern" />
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white/90 mb-6">
            <Sparkles className="w-4 h-4 mr-2 text-gold-light" />Want to Talk to an Astrologer?
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Download Our App for Live Consultations
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-white/80 text-lg mb-10">
            Chat, audio call & video call with astrologers — available only in our mobile app. Browse profiles & shop here on the website.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <a href={APP_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
              <Download className="w-5 h-5 mr-2" />Get on Play Store
            </a>
            <a href={apkReady ? APP_APK_DOWNLOAD_URL : APP_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-8 py-4 bg-white/10 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all">
              <Download className="w-5 h-5 mr-2" />{apkReady ? 'Download APK' : 'Get Android App'}
            </a>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/astrologers" className="inline-flex items-center text-white/80 hover:text-white text-sm">
              <Users className="w-4 h-4 mr-1.5" />Browse Astrologers <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
            <Link to="/shop" className="inline-flex items-center text-white/80 hover:text-white text-sm">
              <ShoppingBag className="w-4 h-4 mr-1.5" />Visit Shop <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}