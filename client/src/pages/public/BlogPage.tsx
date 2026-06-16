import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Search } from 'lucide-react';

import { apiFetch } from '../../config/api';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  category: string;
  author_name: string;
  read_time: string;
  created_at: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory]);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const path = selectedCategory
        ? `/blogs?category=${encodeURIComponent(selectedCategory)}`
        : '/blogs';
      const data = await apiFetch(path);
      if (data) setBlogs(data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['Vedic Astrology', 'Planets', 'Remedies', 'Numerology', 'Tarot'];

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-100 text-secondary-700 mb-4"
          >
            Blog
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Astrology Blog
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore insightful articles on Vedic astrology, remedies, planetary movements, and spiritual wisdom.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-72" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog, index) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={blog.image_url || 'https://images.pexels.com/photos/266026/pexels-photo-266026.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm text-gray-700">
                    {blog.category}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Clock className="w-4 h-4 mr-1" />
                    {blog.read_time} read
                    <span className="mx-2">•</span>
                    {new Date(blog.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{blog.excerpt}</p>

                  <Link
                    to={`/blog/${blog.slug}`}
                    className="inline-flex items-center text-primary-600 font-medium text-sm hover:text-primary-700"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
