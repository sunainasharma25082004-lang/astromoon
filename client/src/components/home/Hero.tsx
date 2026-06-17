import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, MessageCircle, Phone, Video, Star, Download, ShoppingBag } from 'lucide-react';
import { InstallAppModal } from '../common/InstallAppModal';
import { useInstallAppModal } from '../../hooks/useInstallAppModal';
import type { ConsultType } from '../common/InstallAppModal';
import { APP_NAME, APP_PLAY_STORE_URL } from '../../constants';

const consultOptions: { type: ConsultType; Icon: typeof MessageCircle; label: string; color: string }[] = [
  { type: 'chat', Icon: MessageCircle, label: 'Chat', color: 'from-sky-400 to-blue-600' },
  { type: 'call', Icon: Phone, label: 'Call', color: 'from-emerald-400 to-teal-600' },
  { type: 'video', Icon: Video, label: 'Video', color: 'from-violet-400 to-purple-600' },
];

const stats = [
  { value: '1M+', label: 'Users' },
  { value: '500+', label: 'Astrologers' },
  { value: '4.9★', label: 'Rating' },
  { value: '24/7', label: 'Support' },
];

export function HeroSection() {
  const { isOpen, consultType, open, close } = useInstallAppModal();

  return (
    <>
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#0f0a1e]" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/80 via-[#1a1035] to-indigo-950/90" />
        <div className="absolute inset-0 stars-pattern opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-28 w-full">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 backdrop-blur border border-white/10 mb-7">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-sm text-white/85 font-medium">India&apos;s Trusted Astrology Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-display font-bold text-white leading-[1.1] mb-6">
                Welcome to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-300">
                  {APP_NAME}
                </span>
              </h1>

              <p className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
                Browse verified astrologers, generate free kundli, and shop spiritual products — all on the website.
                Live consultations via our mobile app.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8">
                <Link
                  to="/astrologers"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Browse Astrologers
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/kundli"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/15 transition-all"
                >
                  Free Kundli
                </Link>
                <Link
                  to="/become-astrologer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-violet-600/80 backdrop-blur border border-violet-400/30 text-white font-semibold rounded-2xl hover:bg-violet-600 transition-all"
                >
                  <Star className="w-4 h-4 text-amber-300" />
                  Become Astrologer
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 max-w-md">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="text-center p-3 rounded-2xl bg-white/5 border border-white/8"
                  >
                    <div className="text-lg font-bold text-amber-300">{s.value}</div>
                    <div className="text-[10px] text-white/50 mt-0.5">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — consultation cards + quick links */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="space-y-4"
            >
              <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 mb-2">
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-4">Live Consultations</p>
                <div className="space-y-3">
                  {consultOptions.map((item, i) => (
                    <motion.button
                      key={item.type}
                      type="button"
                      onClick={() => open(item.type)}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      className="flex items-center w-full p-4 rounded-2xl bg-white/8 border border-white/10 hover:bg-white/12 hover:border-white/20 transition-all text-left group"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mr-4 shadow-lg group-hover:scale-105 transition-transform`}>
                        <item.Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm">{item.label} Consultation</h3>
                        <p className="text-white/50 text-xs">Available in mobile app</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all shrink-0" />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/shop"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-rose-300" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Spiritual Shop</p>
                    <p className="text-white/45 text-xs">Rudraksha, gems & more</p>
                  </div>
                </Link>
                <a
                  href={APP_PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-600/20 border border-emerald-500/20 hover:bg-emerald-600/30 transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                    <Download className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Get App</p>
                    <p className="text-white/45 text-xs">Live chat & call</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <InstallAppModal isOpen={isOpen} onClose={close} consultType={consultType} />
    </>
  );
}