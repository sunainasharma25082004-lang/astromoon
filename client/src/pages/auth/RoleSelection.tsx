import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Sparkles, ArrowRight, Download } from 'lucide-react';
import { APP_PLAY_STORE_URL } from '../../constants';

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-navy via-cosmic-purple to-cosmic-light flex items-center justify-center p-6">
      <div className="absolute inset-0 stars-pattern opacity-40" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gold-light to-gold rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-cosmic-dark" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
          Celestial Guidance
        </h1>
        <p className="text-white/70 text-lg mb-10 max-w-md mx-auto">
          Browse astrologers, shop spiritual products & use free tools — login to track orders
        </p>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-left mb-6">
          <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-5">
            <User className="w-7 h-7 text-gold-light" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Login / Register</h2>
          <p className="text-white/60 text-sm mb-6">Track shop orders, save favourite astrologers & manage your account</p>
          <div className="space-y-3">
            <Link to="/auth/login?role=user" className="btn-primary w-full flex items-center justify-center">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link to="/auth/register?role=user" className="block text-center text-gold-light text-sm hover:underline">
              New here? Create account
            </Link>
          </div>
        </motion.div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
          <p className="text-white/80 text-sm mb-3 font-medium">Want chat, call or video with an astrologer?</p>
          <a href={APP_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition">
            <Download className="w-4 h-4" /> Download Our App
          </a>
        </div>

        <p className="text-white/40 text-xs mt-8">
          Admin? <Link to="/auth/login?role=admin" className="underline hover:text-white/60">Login to admin panel</Link>
        </p>
      </motion.div>
    </div>
  );
}