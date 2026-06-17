import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';
import { APP_NAME } from '../../constants';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  sideTitle: string;
  sideSubtitle: string;
  sidePoints?: string[];
}

export function AuthLayout({ children, title, subtitle, sideTitle, sideSubtitle, sidePoints = [] }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:w-[44%] relative overflow-hidden bg-gradient-to-br from-[#0f0a1f] via-[#2d1b69] to-[#4c1d95]">
        <div className="absolute inset-0 stars-pattern opacity-40" />
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-10 transition">
              <ArrowLeft className="w-4 h-4" /> Back to website
            </Link>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-xl mb-8">
              <Sparkles className="w-8 h-8 text-[#1a1333]" />
            </div>
            <h2 className="text-4xl font-display font-bold leading-tight mb-4">{sideTitle}</h2>
            <p className="text-white/75 text-lg max-w-md leading-relaxed">{sideSubtitle}</p>
          </div>

          {sidePoints.length > 0 && (
            <div className="space-y-3">
              {sidePoints.map((point, i) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-center gap-3 text-white/85 text-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-300 shrink-0" />
                  {point}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[440px]"
        >
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-slate-900">{APP_NAME}</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-display font-bold text-slate-900 mb-1">{title}</h1>
              <p className="text-slate-500 text-sm">{subtitle}</p>
            </div>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}