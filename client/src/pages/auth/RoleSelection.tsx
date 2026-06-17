import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Sparkles, ArrowRight, Download, Shield } from 'lucide-react';
import { APP_NAME, APP_PLAY_STORE_URL } from '../../constants';

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1f] via-[#2d1b69] to-[#4c1d95] flex items-center justify-center p-6">
      <div className="absolute inset-0 stars-pattern opacity-30" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-amber-300 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl">
            <Sparkles className="w-8 h-8 text-[#1a1333]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">{APP_NAME}</h1>
          <p className="text-white/70 mt-2">Browse, shop & manage your spiritual journey</p>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-3xl p-7 text-left mb-4">
          <div className="w-12 h-12 bg-violet-500/25 rounded-xl flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-amber-200" />
          </div>
          <h2 className="text-xl font-display font-bold text-white mb-1">User Account</h2>
          <p className="text-white/60 text-sm mb-5">Shop orders, saved astrologers & become-astrologer application</p>
          <div className="space-y-2.5">
            <Link to="/auth/register" className="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-violet-800 font-semibold rounded-xl hover:bg-violet-50 transition">
              Create Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/auth/login?role=user" className="block text-center text-amber-200 text-sm hover:underline">
              Already registered? Sign in
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <a href={APP_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 bg-emerald-600/90 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition">
            <Download className="w-4 h-4" /> Get App
          </a>
          <Link to="/auth/login?role=admin" className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-medium rounded-xl transition">
            <Shield className="w-4 h-4" /> Admin Login
          </Link>
        </div>

        <p className="text-center text-white/40 text-xs">
          Admin access is for authorised shop managers only.
        </p>
      </motion.div>
    </div>
  );
}