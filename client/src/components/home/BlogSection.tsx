import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

const blogs = [
  { id: '1', title: 'Understanding Your Birth Chart', excerpt: 'Learn the basics of Kundli reading and planetary positions.', category: 'Vedic Astrology', image: 'https://images.pexels.com/photos/266026/pexels-photo-266026.jpeg?auto=compress&cs=tinysrgb&w=400', date: 'Jan 15, 2024', read_time: '8 min' },
  { id: '2', title: 'Mercury Retrograde Explained', excerpt: 'Debunking myths about Mercury retrograde.', category: 'Planets', image: 'https://images.pexels.com/photos/73873/star-clusters-73873.jpeg?auto=compress&cs=tinysrgb&w=400', date: 'Jan 12, 2024', read_time: '5 min' },
  { id: '3', title: 'Choosing the Right Gemstone', excerpt: 'How to select gemstones based on your birth chart.', category: 'Remedies', image: 'https://images.pexels.com/photos/1452594/pexels-photo-1452594.jpeg?auto=compress&cs=tinysrgb&w=400', date: 'Jan 10, 2024', read_time: '6 min' },
];

export function BlogSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-100 text-secondary-700 mb-4">Latest Articles</motion.div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Astrology Blog</h2>
            <p className="text-gray-600">Insightful articles on astrology and spiritual wisdom</p>
          </div>
          <Link to="/blog" className="hidden md:flex items-center text-primary-600 font-medium">View All<ArrowRight className="w-4 h-4 ml-2" /></Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <motion.article key={blog.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all group">
              <div className="relative h-48 overflow-hidden"><img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /><div className="absolute top-3 left-3 px-3 py-1 bg-white/90 rounded-full text-sm text-gray-700">{blog.category}</div></div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-500"><span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{blog.read_time}</span><span>{blog.date}</span></div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{blog.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{blog.excerpt}</p>
                <Link to={`/blog/${blog.id}`} className="inline-flex items-center text-primary-600 text-sm font-medium">Read More<ArrowRight className="w-4 h-4 ml-1" /></Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
