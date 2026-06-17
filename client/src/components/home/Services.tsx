import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Calendar, Calculator, Globe, BookOpen, Home, Gift } from 'lucide-react';

const services = [
  { icon: Sparkles, title: 'Free Kundli', path: '/kundli', color: 'from-amber-400 to-orange-500' },
  { icon: Heart, title: 'Kundli Matching', path: '/kundli', color: 'from-pink-400 to-rose-500' },
  { icon: Calendar, title: 'Daily Horoscope', path: '/horoscope', color: 'from-green-400 to-emerald-500' },
  { icon: Calculator, title: 'Birth Chart', path: '/kundli', color: 'from-blue-400 to-indigo-500' },
  { icon: Globe, title: 'Horoscope', path: '/horoscope', color: 'from-purple-400 to-violet-500' },
  { icon: BookOpen, title: 'Become Astrologer', path: '/become-astrologer', color: 'from-cyan-400 to-teal-500' },
  { icon: Home, title: 'Spiritual Shop', path: '/shop', color: 'from-lime-400 to-green-500' },
  { icon: Gift, title: 'Browse Astrologers', path: '/astrologers', color: 'from-red-400 to-rose-500' },
];

export function FreeServices() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 mb-4">
            <Gift className="w-4 h-4 mr-2" />Free Services
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Free Astrology Tools</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {services.map((service, index) => (
            <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} whileHover={{ y: -5 }}>
              <Link to={service.path} className="block p-6 bg-gray-50 rounded-2xl border hover:border-primary-200 hover:shadow-lg transition-all group">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><service.icon className="w-7 h-7 text-white" /></div>
                <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
                <p className="text-sm text-gray-500">Get started free</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
