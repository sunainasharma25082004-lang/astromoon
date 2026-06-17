import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ArrowRight, Users } from 'lucide-react';
import { apiFetch, withIds, mediaUrl } from '../../config/api';
import { PageHeader, PanelCard } from '../../components/user/PageHeader';

const STORAGE_KEY = 'celestial_saved_astrologers';

export default function UserSaved() {
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const ids: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (ids.length === 0) { setAstrologers([]); setLoading(false); return; }
        const all = withIds(await apiFetch('/astrologers'));
        setAstrologers(all.filter((a: any) => ids.includes(a.id)));
      } catch { setAstrologers([]); }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <PageHeader
        icon={Heart}
        title="Saved Astrologers"
        subtitle="Your favourite astrologers"
      />

      <PanelCard className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        ) : astrologers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-rose-300" />
            </div>
            <p className="text-slate-600 font-medium mb-1">No saved astrologers</p>
            <p className="text-slate-400 text-sm mb-5">Tap ❤️ on an astrologer profile to save them here.</p>
            <Link
              to="/astrologers"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition"
            >
              Browse Astrologers <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {astrologers.map((a: any) => (
              <Link
                key={a.id}
                to={`/astrologer/${a.id}`}
                className="p-5 flex items-center justify-between hover:bg-slate-50/60 transition group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {a.avatar_url ? (
                    <img src={mediaUrl(a.avatar_url)} alt="" className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {a.full_name?.[0]?.toUpperCase() || <Users className="w-5 h-5" />}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-slate-800">{a.full_name}</div>
                    {a.bio && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{a.bio}</p>}
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {a.rating}
                      </span>
                      <span>{a.experience} yrs</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${a.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      {a.is_online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}