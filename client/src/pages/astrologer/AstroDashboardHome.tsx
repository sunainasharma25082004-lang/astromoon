import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Star, Clock, ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { mediaUrl } from '../../config/api';

function profileScore(profile: Record<string, any>): number {
  let score = 0;
  if (profile.avatar_url) score += 20;
  if (profile.bio?.length > 30) score += 20;
  if (profile.services?.length > 0) score += 20;
  if (profile.expertise?.length > 0) score += 15;
  if (profile.gallery_images?.length > 0) score += 15;
  if (profile.experience > 0) score += 10;
  return Math.min(100, score);
}

export default function AstroDashboardHome() {
  const { user } = useAuth();
  const profile = user?.astrologer_profile || {};
  const score = profileScore(profile);
  const isOnline = profile.availability_status === 'online';
  const astroId = user?.astrologer_profile_id;

  const checklist = [
    { done: !!profile.avatar_url, label: 'Profile photo uploaded', link: '/astro/profile' },
    { done: (profile.bio?.length || 0) > 30, label: 'Bio written', link: '/astro/profile' },
    { done: (profile.services?.length || 0) > 0, label: 'Services listed', link: '/astro/profile' },
    { done: (profile.gallery_images?.length || 0) > 0, label: 'Gallery photos added', link: '/astro/profile' },
    { done: isOnline, label: 'Set to Online', link: '/astro/availability' },
  ];

  const stats = [
    { label: 'Rating', value: (profile.rating || 0).toFixed(1), icon: Star },
    { label: 'Reviews', value: String(profile.total_reviews || 0), icon: Star },
    { label: 'Experience', value: `${profile.experience || 0} yrs`, icon: Clock },
    { label: 'Photos', value: String(profile.gallery_images?.length || 0), icon: ImageIcon },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Namaste, {(user?.full_name || 'Astrologer').split(' ')[0]}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Complete your profile so users can find and trust you</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-amber-100 p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Profile Completion</h2>
            <p className="text-sm text-gray-500">Users see your profile on the website</p>
          </div>
          <div className="text-3xl font-bold text-amber-600">{score}%</div>
        </div>
        <div className="h-2.5 bg-amber-100 rounded-full overflow-hidden mb-5">
          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: `${score}%` }} />
        </div>
        <div className="space-y-2">
          {checklist.map(item => (
            <Link key={item.label} to={item.link} className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition text-sm">
              {item.done ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              )}
              <span className={item.done ? 'text-gray-600' : 'text-gray-900 font-medium'}>{item.label}</span>
            </Link>
          ))}
        </div>
        {astroId && (
          <Link
            to={`/astrologer/${astroId}`}
            className="inline-block mt-4 text-sm text-amber-700 font-semibold hover:underline"
          >
            Preview how users see your profile →
          </Link>
        )}
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5"
          >
            <stat.icon className="w-5 h-5 text-amber-600 mb-2" />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <Link
        to="/astro/profile"
        className="flex items-center gap-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl p-6 hover:from-amber-700 hover:to-orange-700 transition shadow-lg shadow-amber-200"
      >
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
        <div>
          <div className="font-semibold text-lg">Edit Profile & Upload Photos</div>
          <div className="text-amber-100 text-sm">Bio, services, gallery — sab kuch yahan update karo</div>
        </div>
      </Link>

      {profile.avatar_url && (
        <div className="mt-6 bg-white rounded-2xl border border-amber-100 p-4 flex items-center gap-4">
          <img src={mediaUrl(profile.avatar_url)} alt="" className="w-16 h-16 rounded-xl object-cover" />
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{profile.full_name || user?.full_name}</p>
            <p className="text-sm text-gray-500 line-clamp-2">{profile.bio || 'Add your bio in profile'}</p>
          </div>
        </div>
      )}
    </div>
  );
}