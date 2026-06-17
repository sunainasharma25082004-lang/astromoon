import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#f8f7fc]">
      <div className="text-center max-w-md">
        <p className="text-7xl font-display font-bold text-violet-200 mb-2">404</p>
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-500 text-sm mb-8">The page you are looking for does not exist or was moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <button type="button" onClick={() => window.history.back()} className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}