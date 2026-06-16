import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Users, Sparkles, ArrowRight } from 'lucide-react';

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-navy via-cosmic-purple to-cosmic-light flex items-center justify-center p-6">
      <div className="absolute inset-0 stars-pattern opacity-40" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-4xl text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gold-light to-gold rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-cosmic-dark" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
          Celestial Guidance
        </h1>
        <p className="text-white/70 text-lg mb-12 max-w-xl mx-auto">
          Premium astrology consultations — chat, audio & video with expert astrologers
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-left">
            <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-5">
              <User className="w-7 h-7 text-gold-light" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Continue as User</h2>
            <p className="text-white/60 text-sm mb-6">Get consultations, free trial chat, wallet recharge & kundli</p>
            <div className="space-y-3">
              <Link to="/auth/login?role=user" className="btn-primary w-full flex items-center justify-center">
                Login as User <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/auth/register?role=user" className="block text-center text-gold-light text-sm hover:underline">
                New user? Create account
              </Link>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-left">
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-5">
              <Users className="w-7 h-7 text-gold-light" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Continue as Astrologer</h2>
            <p className="text-white/60 text-sm mb-6">Offer services, set your pricing, manage earnings & withdrawals</p>
            <div className="space-y-3">
              <Link to="/auth/login?role=astrologer" className="w-full flex items-center justify-center px-6 py-3 bg-cosmic-purple hover:bg-purple-700 text-white font-medium rounded-xl transition">
                Login as Astrologer <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/auth/register?role=astrologer" className="block text-center text-gold-light text-sm hover:underline">
                Join as Astrologer
              </Link>
            </div>
          </motion.div>
        </div>

        <p className="text-white/40 text-xs mt-10">
          First consultation? Get 5 minutes FREE chat with any astrologer
        </p>
      </motion.div>
    </div>
  );
}