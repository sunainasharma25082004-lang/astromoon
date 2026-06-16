import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MessageCircle, Phone, Video, Clock, BadgeCheck, Globe } from 'lucide-react';
import { formatCurrency } from '../../utils/dateUtils';

interface AstrologerCardProps {
  astrologer: {
    id: string;
    full_name: string;
    avatar_url?: string;
    expertise: string[];
    languages: string[];
    experience: number;
    rating: number;
    total_reviews: number;
    chat_price: number;
    call_price: number;
    video_price: number;
    is_online: boolean;
    is_verified: boolean;
    bio?: string;
  };
  variant?: 'default' | 'compact' | 'featured';
}

export function AstrologerCard({ astrologer, variant = 'default' }: AstrologerCardProps) {
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isFeatured ? 'md:flex' : ''
      }`}
    >
      {/* Online Badge */}
      {astrologer.is_online && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
            Online
          </span>
        </div>
      )}

      <div className={`${isFeatured ? 'md:w-1/3' : ''} ${isCompact ? 'p-3' : 'p-5'}`}>
        {/* Avatar */}
        <div className="relative">
          <img
            src={astrologer.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.full_name)}&background=7c3aed&color=fff&size=128`}
            alt={astrologer.full_name}
            className={`rounded-xl object-cover ${isCompact ? 'w-full h-32' : 'w-full h-48'}`}
          />
          {astrologer.is_verified && (
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
              <BadgeCheck className="w-5 h-5 text-primary-600" />
            </div>
          )}
        </div>
      </div>

      <div className={`${isFeatured ? 'md:w-2/3' : ''} ${isCompact ? 'p-3' : 'p-5 pt-3'}`}>
        {/* Name & Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-semibold text-gray-900 ${isCompact ? 'text-base' : 'text-lg'}`}>
            {astrologer.full_name}
          </h3>
          <div className="flex items-center text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm font-medium text-gray-700">{astrologer.rating}</span>
            <span className="ml-1 text-xs text-gray-500">({astrologer.total_reviews})</span>
          </div>
        </div>

        {/* Experience & Languages */}
        <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {astrologer.experience} yrs exp
          </span>
          <span className="flex items-center">
            <Globe className="w-4 h-4 mr-1" />
            {astrologer.languages.slice(0, 2).join(', ')}
          </span>
        </div>

        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {astrologer.expertise.slice(0, isCompact ? 2 : 3).map((exp) => (
            <span
              key={exp}
              className="inline-block px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700"
            >
              {exp}
            </span>
          ))}
        </div>

        {/* Bio */}
        {!isCompact && astrologer.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{astrologer.bio}</p>
        )}

        {/* Pricing */}
        <div className="flex items-center gap-3 mb-4 text-sm">
          <span className="flex items-center text-blue-600">
            <MessageCircle className="w-4 h-4 mr-1" />
            {formatCurrency(astrologer.chat_price)}/min
          </span>
          <span className="flex items-center text-green-600">
            <Phone className="w-4 h-4 mr-1" />
            {formatCurrency(astrologer.call_price)}/min
          </span>
          <span className="flex items-center text-purple-600">
            <Video className="w-4 h-4 mr-1" />
            {formatCurrency(astrologer.video_price)}/min
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/astrologer/${astrologer.id}`}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            View Profile
          </Link>
          <Link
            to={`/astrologer/${astrologer.id}?action=chat`}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-center rounded-lg text-sm font-medium hover:from-primary-700 hover:to-primary-600 transition-colors"
          >
            Consult Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
