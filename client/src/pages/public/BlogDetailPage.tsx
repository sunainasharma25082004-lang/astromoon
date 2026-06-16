import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Clock, User, Share2, Bookmark } from 'lucide-react';

import { apiFetch } from '../../config/api';

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  category: string;
  tags: string[];
  author_name: string;
  author_avatar_url?: string;
  read_time: string;
  published_at: string;
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch(`/blogs/${slug}`);
      setBlog(data);
    } catch (err) {
      console.error('Error fetching blog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-2xl mb-6" />
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h2>
          <Link to="/blog" className="text-primary-600 hover:underline">
            Browse all articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96 bg-gradient-to-br from-cosmic-navy to-cosmic-purple">
        <img
          src={blog.image_url || 'https://images.pexels.com/photos/266026/pexels-photo-266026.jpeg?auto=compress&cs=tinysrgb&w=1200'}
          alt={blog.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-4xl mx-auto">
            {/* Category */}
            <Link
              to={`/blog?category=${blog.category}`}
              className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm hover:bg-white/30 transition-colors mb-4"
            >
              {blog.category}
            </Link>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">{blog.title}</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {blog.author_avatar_url ? (
                  <img src={blog.author_avatar_url} alt={blog.author_name} className="w-10 h-10 rounded-full mr-2" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-2">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <span className="font-medium">{blog.author_name}</span>
              </div>
              <span className="text-white/60">•</span>
              <div className="flex items-center text-white/80">
                <Clock className="w-4 h-4 mr-1" />
                {blog.read_time}
              </div>
              <span className="text-white/60">•</span>
              <span className="text-white/80">
                {new Date(blog.published_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Blog
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-10"
        >
          {/* Actions */}
          <div className="flex justify-end gap-2 mb-6">
            <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary-600"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
