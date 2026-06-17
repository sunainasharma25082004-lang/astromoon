import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'How does online astrology consultation work?', a: 'Our platform connects you with verified astrologers via chat, call, or video. Simply browse astrologers and choose your preferred consultation type.' },
  { q: 'Are the astrologers verified?', a: 'Yes, all astrologers undergo a rigorous verification process including qualifications and experience checks.' },
  { q: 'How much does a consultation cost?', a: 'Rates vary by astrologer. Each sets their own per-minute rates, typically ranging from ₹15-50/min.' },
  { q: 'Is my consultation private?', a: 'Yes, all conversations are completely confidential and encrypted.' },
  { q: 'Can I get a refund?', a: 'For valid concerns, we offer refunds or wallet credit. Your satisfaction matters.' },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 bg-gray-50 scroll-mt-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 mb-4">FAQ</motion.div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="bg-white rounded-xl border overflow-hidden">
              <button onClick={() => setOpen(open === index ? null : index)} className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-900">{faq.q}</span>
                <motion.div animate={{ rotate: open === index ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown className="w-5 h-5 text-gray-400" /></motion.div>
              </button>
              <AnimatePresence>{open === index && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden"><div className="px-6 pb-4 text-gray-600">{faq.a}</div></motion.div>
              )}</AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
