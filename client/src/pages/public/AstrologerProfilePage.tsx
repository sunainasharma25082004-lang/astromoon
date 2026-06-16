import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BadgeCheck, Clock, Globe,
  Heart, Share2, Award, ChevronLeft
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { StarRating } from '../../components/common/StarRating';
import { AppDownloadCTA } from '../../components/common/AppDownloadCTA';

import { apiFetch, withId } from '../../config/api';

const SAVED_KEY = 'celestial_saved_astrologers';

interface Review {
  id: string;
  rating: number;
  comment: string;
  user_name: string;
  created_at: string;
  consultation_type: string;
}

interface Astrologer {
  id: string;
  full_name: string;
  avatar_url?: string;
  expertise: string[];
  languages: string[];
  experience: number;
  bio?: string;
  education?: string;
  certifications?: string[];
  chat_price: number;
  call_price: number;
  video_price: number;
  rating: number;
  total_reviews: number;
  total_consultations: number;
  is_online: boolean;
  is_verified: boolean;
}

export default function AstrologerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAstrologer();
      fetchReviews();
    }
  }, [id]);

  const fetchAstrologer = async () => {
    try {
      const data = await apiFetch(`/astrologers/${id}`);
      const astro = withId(data);
      setAstrologer(astro);
      if (data.reviews) {
        setReviews(data.reviews.map((r: any) => ({
          id: r._id,
          rating: r.rating,
          comment: r.comment,
          user_name: r.user_id?.full_name || 'User',
          created_at: r.createdAt,
          consultation_type: r.consultation_type || 'chat',
        })));
      }
      const saved: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
      setIsSaved(saved.includes(astro.id));
    } catch (err) {
      console.error('Error fetching astrologer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const data = await apiFetch(`/reviews/astrologer/${id}`);
      setReviews(data.map((r: any) => ({
        id: r._id,
        rating: r.rating,
        comment: r.comment,
        user_name: r.user_id?.full_name || 'User',
        created_at: r.createdAt,
        consultation_type: r.consultation_type || 'chat',
      })));
    } catch {}
  };

  const toggleSave = () => {
    if (!astrologer) return;
    const saved: string[] = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    const next = isSaved ? saved.filter(s => s !== astrologer.id) : [...saved, astrologer.id];
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    setIsSaved(!isSaved);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-2xl mb-6" />
            <div className="h-12 bg-gray-200 rounded-xl mb-4 w-1/2" />
            <div className="h-6 bg-gray-200 rounded-xl w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!astrologer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Astrologer not found</h2>
          <Link to="/astrologers" className="text-primary-600 hover:underline">
            Browse all astrologers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/astrologers"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Astrologers
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-cosmic-navy via-cosmic-purple to-cosmic-light relative">
            <div className="absolute inset-0 stars-pattern opacity-30" />
          </div>

          <div className="px-6 lg:px-8 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={astrologer.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.full_name)}&background=7c3aed&color=fff&size=200`}
                  alt={astrologer.full_name}
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover"
                />
                {astrologer.is_online && (
                  <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full shadow-lg">
                    Online
                  </div>
                )}
                {astrologer.is_verified && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <BadgeCheck className="w-6 h-6 text-primary-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-1">
                  {astrologer.full_name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {astrologer.experience} Years Experience
                  </span>
                  <span className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    {astrologer.languages.join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <StarRating rating={astrologer.rating} size="md" />
                    <span className="ml-2 text-gray-600">{astrologer.rating} ({astrologer.total_reviews} reviews)</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {astrologer.expertise.map((exp) => (
                    <span key={exp} className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={toggleSave}
                  className={`p-3 rounded-xl border transition-colors ${
                    isSaved
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'bg-white border-gray-200 text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-600">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{astrologer.total_consultations}+</div>
                <div className="text-sm text-gray-500">Consultations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{astrologer.total_reviews}</div>
                <div className="text-sm text-gray-500">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{astrologer.experience}</div>
                <div className="text-sm text-gray-500">Years Experience</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - About & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'about'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'reviews'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Reviews ({astrologer.total_reviews})
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'about' ? (
                  <div className="space-y-6">
                    {/* Bio */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                      <p className="text-gray-600 leading-relaxed">{astrologer.bio}</p>
                    </div>

                    <AppDownloadCTA
                      variant="inline"
                      subtitle={`To connect with ${astrologer.full_name}, download our app — calls & chat work best on mobile.`}
                    />

                    {/* Education */}
                    {astrologer.education && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                        <p className="text-gray-600">{astrologer.education}</p>
                      </div>
                    )}

                    {/* Certifications */}
                    {astrologer.certifications && astrologer.certifications.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h3>
                        <div className="flex flex-wrap gap-2">
                          {astrologer.certifications.map((cert) => (
                            <span key={cert} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                              <Award className="w-4 h-4 mr-2" />
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-medium text-gray-900">{review.user_name}</span>
                              <span className="text-sm text-gray-500 ml-2 capitalize">{review.consultation_type}</span>
                            </div>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                          <p className="text-xs text-gray-400 mt-2">{formatDate(review.created_at)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">No reviews yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - App download */}
          <div>
            <AppDownloadCTA
              subtitle={`Book ${astrologer.full_name} for chat, audio or video — open the ${astrologer.is_online ? 'app while they are online' : 'app and get notified when online'}.`}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
