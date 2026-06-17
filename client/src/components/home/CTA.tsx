import { motion } from 'framer-motion';
import { Sparkles, MessageCircle, Phone, Video } from 'lucide-react';
import { InstallAppModal } from '../common/InstallAppModal';
import { useInstallAppModal } from '../../hooks/useInstallAppModal';
import type { ConsultType } from '../common/InstallAppModal';

const buttons: { type: ConsultType; Icon: typeof MessageCircle; label: string; color: string }[] = [
  { type: 'chat', Icon: MessageCircle, label: 'Chat Now', color: 'from-blue-500 to-blue-600' },
  { type: 'call', Icon: Phone, label: 'Call Now', color: 'from-green-500 to-green-600' },
  { type: 'video', Icon: Video, label: 'Video Call', color: 'from-purple-500 to-purple-600' },
];

export function CTASection() {
  const { isOpen, consultType, open, close } = useInstallAppModal();

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-cosmic-navy via-cosmic-purple to-cosmic-light relative overflow-hidden">
        <div className="absolute inset-0 stars-pattern" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white/90 mb-6">
              <Sparkles className="w-4 h-4 mr-2 text-gold-light" />Start Your Journey
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Consult with India's Best Astrologers</motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-white/80 text-lg mb-10">Live consultations are available in our app — install to chat, call or video with astrologers.</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {buttons.map(({ type, Icon, label, color }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => open(type)}
                  className={`inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r ${color} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all`}
                >
                  <Icon className="w-5 h-5 mr-2" />{label}
                </button>
              ))}
            </motion.div>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="text-white/60 text-sm mt-8">Website is for browsing profiles & shopping — app required for live sessions</motion.p>
          </div>
        </div>
      </section>

      <InstallAppModal isOpen={isOpen} onClose={close} consultType={consultType} />
    </>
  );
}