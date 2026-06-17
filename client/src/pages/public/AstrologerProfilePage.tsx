import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  BadgeCheck, Clock, Globe, Heart, Share2, Award, ChevronLeft,
  MessageCircle, Phone, Video, Calendar, Sparkles, CheckCircle, Images
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/dateUtils';
import { StarRating } from '../../components/common/StarRating';
import { AppDownloadCTA } from '../../components/common/AppDownloadCTA';
import { InstallAppModal } from '../../components/common/InstallAppModal';
import { useInstallAppModal } from '../../hooks/useInstallAppModal';
import type { ConsultType } from '../../components/common/InstallAppModal';
import { apiFetch, withId, mediaUrl } from '../../config/api';

const SAVED_KEY = 'celestial_saved_astrologers';

interface Package {
  _id: string;
  name: string;
  duration_minutes: number;
  price: number;
  type: string;
}

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
  skills?: string[];
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
  availability_status?: string;
  available_slots?: { day: string; start_time: string; end_time: string }[];
  services?: string[];
  gallery_images?: string[];
  packages?: Package[];
}

const ACTION_TYPES = new Set(['chat', 'call', 'video']);

export default function AstrologerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOpen, consultType, open, close } = useInstallAppModal();
  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'packages'>('about');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) fetchAstrologer();
  }, [id]);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action && ACTION_TYPES.has(action)) {
      open(action as ConsultType);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, open]);

  const fetchAstrologer = async () => {
    try {
      const data = await apiFetch(`/astrologers/${id}`);
      const astro = withId(data);
      setAstrologer({ ...astro, packages: data.packages || [] });
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
          <Link to="/astrologers" className="text-primary-600 hover:underline">Browse all astrologers</Link>
        </div>
      </div>
    );
  }

  const isOnline = astrologer.availability_status === 'online' || astrologer.is_online;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/astrologers" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-5 h-5 mr-1" />Back to Astrologers
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-cosmic-navy via-cosmic-purple to-cosmic-light relative">
            <div className="absolute inset-0 stars-pattern opacity-30" />
          </div>

          <div className="px-6 lg:px-8 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              <div className="relative">
                <img
                  src={mediaUrl(astrologer.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(astrologer.full_name)}&background=7c3aed&color=fff&size=200`}
                  alt={astrologer.full_name}
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover"
                />
                {isOnline && (
                  <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full shadow-lg">
                    {astrologer.availability_status === 'busy' ? 'Busy' : 'Online'}
                  </div>
                )}
                {astrologer.is_verified && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <BadgeCheck className="w-6 h-6 text-primary-600" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-1">{astrologer.full_name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{astrologer.experience} Years Experience</span>
                  <span className="flex items-center"><Globe className="w-4 h-4 mr-1" />{astrologer.languages?.join(', ')}</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <StarRating rating={astrologer.rating} size="md" />
                  <span className="text-gray-600">{astrologer.rating} ({astrologer.total_reviews} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {astrologer.expertise?.map((exp) => (
                    <span key={exp} className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full">{exp}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={toggleSave} className={`p-3 rounded-xl border transition-colors ${isSaved ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:text-red-500'}`}>
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button onClick={() => navigator.share?.({ title: astrologer.full_name, url: window.location.href })} className="p-3 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-600">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

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

            {/* Pricing info (informative) */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { type: 'chat' as const, Icon: MessageCircle, label: 'Chat', price: astrologer.chat_price, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { type: 'call' as const, Icon: Phone, label: 'Audio Call', price: astrologer.call_price, color: 'bg-green-50 text-green-700 hover:bg-green-100' },
                { type: 'video' as const, Icon: Video, label: 'Video Call', price: astrologer.video_price, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
              ].map(({ type, Icon, label, price, color }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => open(type)}
                  className={`flex flex-col items-center py-3 rounded-xl transition cursor-pointer ${color}`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{label}</span>
                  <span className="text-sm font-bold mt-0.5">{formatCurrency(price)}/min</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {(['about', 'reviews', 'packages'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 font-medium transition-colors capitalize ${activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab === 'reviews' ? `Reviews (${astrologer.total_reviews})` : tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About {astrologer.full_name}</h3>
                      <p className="text-gray-600 leading-relaxed">{astrologer.bio || 'Profile details coming soon.'}</p>
                    </div>

                    {astrologer.services && astrologer.services.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Offered</h3>
                        <ul className="grid sm:grid-cols-2 gap-2">
                          {astrologer.services.map(s => (
                            <li key={s} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-sm">
                              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {astrologer.gallery_images && astrologer.gallery_images.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Images className="w-5 h-5" /> Photos
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {astrologer.gallery_images.map((url, i) => (
                            <a key={i} href={mediaUrl(url)} target="_blank" rel="noreferrer" className="aspect-square rounded-xl overflow-hidden border border-gray-100 hover:opacity-90 transition">
                              <img src={mediaUrl(url)} alt="" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {astrologer.skills && astrologer.skills.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Specializations</h3>
                        <div className="flex flex-wrap gap-2">
                          {astrologer.skills.map(s => (
                            <span key={s} className="inline-flex items-center px-3 py-1 bg-violet-50 text-violet-700 rounded-lg text-sm">
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" />{s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {astrologer.education && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                        <p className="text-gray-600">{astrologer.education}</p>
                      </div>
                    )}

                    {astrologer.certifications && astrologer.certifications.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h3>
                        <div className="flex flex-wrap gap-2">
                          {astrologer.certifications.map((cert) => (
                            <span key={cert} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                              <Award className="w-4 h-4 mr-2" />{cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {astrologer.available_slots && astrologer.available_slots.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center"><Calendar className="w-5 h-5 mr-2" />Availability Schedule</h3>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {astrologer.available_slots.map((slot, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl text-sm">
                              <span className="font-medium text-gray-800 capitalize">{slot.day}</span>
                              <span className="text-gray-500">{slot.start_time} – {slot.end_time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <AppDownloadCTA
                      variant="inline"
                      showConsultTypes
                      subtitle={`To chat, call or video consult with ${astrologer.full_name}, download our app.`}
                    />
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {reviews.length > 0 ? reviews.map((review) => (
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
                    )) : (
                      <p className="text-center text-gray-500 py-8">No reviews yet</p>
                    )}
                  </div>
                )}

                {activeTab === 'packages' && (
                  <div className="space-y-3">
                    {(astrologer.packages || []).length > 0 ? astrologer.packages!.map(pkg => (
                      <div key={pkg._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <div className="font-medium text-gray-900">{pkg.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{pkg.type} • {pkg.duration_minutes} minutes</div>
                        </div>
                        <div className="font-bold text-primary-700">{formatCurrency(pkg.price)}</div>
                      </div>
                    )) : (
                      <p className="text-center text-gray-500 py-8">No packages listed. Per-minute rates shown above.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <AppDownloadCTA
              showConsultTypes
              subtitle={`Connect with ${astrologer.full_name} via chat, audio or video — download the app${isOnline ? ' while they are online' : ''}.`}
            />
          </div>
        </div>
      </div>

      <InstallAppModal isOpen={isOpen} onClose={close} consultType={consultType} />
    </div>
  );
}