import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { APP_NAME } from '../../constants';
import BecomeAstrologerForm from '../../panels/user/BecomeAstrologer';

const applyRedirect = '/become-astrologer';

export default function BecomeAstrologerPage() {
  const { token, user, isInitializing } = useAuth();
  const isLoggedIn = !!token;

  if (!isInitializing && user?.role === 'astrologer') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f8f7fc]">
      <section className="bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 text-white py-14 sm:py-18 relative overflow-hidden">
        <div className="absolute inset-0 stars-pattern opacity-20" />
        <div className="absolute -top-20 right-0 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
              <Star className="w-8 h-8 text-amber-300" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">Become an Astrologer on {APP_NAME}</h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              Fill the application form below. Admin will review your profile and contact you.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
        {!isInitializing && !isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200"
          >
            <p className="text-sm text-amber-900">
              <strong>Login required to submit.</strong> Fill the form below, then sign in to send your application.
            </p>
            <div className="flex gap-2 shrink-0">
              <Link
                to={`/auth/login?redirect=${encodeURIComponent(applyRedirect)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
              <Link
                to={`/auth/register?redirect=${encodeURIComponent(applyRedirect)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-violet-300 text-violet-700 text-sm font-semibold rounded-xl hover:bg-violet-50 transition"
              >
                <UserPlus className="w-4 h-4" /> Register
              </Link>
            </div>
          </motion.div>
        )}

        {isInitializing ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        ) : (
          <BecomeAstrologerForm embedded publicMode={!isLoggedIn} />
        )}
      </div>
    </div>
  );
}