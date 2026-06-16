import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  { id: '1', name: 'Rahul Mehta', location: 'Mumbai', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100', rating: 5, text: 'The astrologer predicted my career change perfectly. His guidance was invaluable.' },
  { id: '2', name: 'Anjali Patel', location: 'Delhi', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100', rating: 5, text: 'Got my Kundli matched here. The detailed analysis made our family confident.' },
  { id: '3', name: 'Vikram Singh', location: 'Bangalore', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100', rating: 5, text: 'The video consultation felt like sitting with an astrologer in person.' },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-cosmic-navy via-cosmic-purple to-cosmic-light">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white/80 mb-4">
            <Star className="w-4 h-4 mr-2 text-gold-light" />Customer Stories
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">What Our Users Say</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div key={testimonial.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-white/20" />
              <div className="flex items-center mb-4"><img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover mr-4" /><div><h4 className="font-semibold text-white">{testimonial.name}</h4><p className="text-sm text-white/60">{testimonial.location}</p></div></div>
              <div className="flex mb-4">{[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-gold-light fill-current" />)}</div>
              <p className="text-white/80 leading-relaxed">{testimonial.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ value: '1M+', label: 'Happy Users' }, { value: '500+', label: 'Astrologers' }, { value: '4.9', label: 'Rating' }, { value: '99%', label: 'Satisfaction' }].map(stat => (
            <div key={stat.label} className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10"><div className="text-3xl font-bold text-gold-light mb-2">{stat.value}</div><div className="text-white/70 text-sm">{stat.label}</div></div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
