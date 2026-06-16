import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { apiFetch, withIds } from '../../config/api';

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
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center"><Heart className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Saved Astrologers</h1>
          <p className="text-gray-500 text-sm">Your favourite astrologers</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-sky-100">
        {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : astrologers.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            No saved astrologers. Tap ❤️ on an astrologer profile to save.
            <Link to="/astrologers" className="block text-sky-600 font-medium mt-2">Browse Astrologers →</Link>
          </div>
        ) : (
          <div className="divide-y divide-sky-50">
            {astrologers.map((a: any) => (
              <Link key={a.id} to={`/astrologer/${a.id}`} className="p-5 flex items-center justify-between hover:bg-sky-50/50">
                <div>
                  <div className="font-medium text-sm">{a.full_name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {a.rating} • {a.is_online ? 'Online' : 'Offline'}
                  </div>
                </div>
                <span className="text-xs text-sky-600">View →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}