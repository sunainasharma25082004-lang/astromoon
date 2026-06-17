import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, CheckCircle } from 'lucide-react';

const perks = [
  'Reach thousands of users across India',
  'Flexible working hours from home',
  'Admin support & profile verification',
  'Consult via mobile app (chat, call, video)',
];

export function BecomeAstrologerSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
              <Star className="w-4 h-4" /> Join Our Team
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
              Are You an Astrologer?
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Apply to become a verified astrologer on Astro Star. Fill a simple form, get reviewed by our admin team, and start consulting users through our app.
            </p>
            <ul className="space-y-3 mb-8">
              {perks.map(perk => (
                <li key={perk} className="flex items-center gap-2.5 text-slate-700 text-sm">
                  <CheckCircle className="w-4 h-4 text-violet-600 shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
            <Link
              to="/become-astrologer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-200 hover:shadow-xl hover:from-violet-700 hover:to-indigo-700 transition"
            >
              Apply Now <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-3xl border border-violet-100 shadow-xl p-8">
              <div className="grid grid-cols-2 gap-4 text-center">
                {[
                  { v: '500+', l: 'Astrologers' },
                  { v: '1M+', l: 'Users' },
                  { v: '4.9★', l: 'Rating' },
                  { v: '24/7', l: 'Support' },
                ].map(s => (
                  <div key={s.l} className="p-4 rounded-2xl bg-violet-50">
                    <div className="text-2xl font-bold text-violet-700">{s.v}</div>
                    <div className="text-xs text-slate-500 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-slate-500 mt-6">
                Simple application • Admin review • Start consulting
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}