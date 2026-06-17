import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Star, Eye, EyeOff, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch, mediaUrl, withId } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import toast from 'react-hot-toast';

export default function AdminAstrologers() {
  const { token } = useAuth();
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    apiFetch('/admin/astrologers', {}, token)
      .then((data) => setAstrologers(data.map((a: any) => withId(a))))
      .catch(() => toast.error('Failed to load astrologers'))
      .finally(() => setLoading(false));
  };

  useRealtimeData(load, 'astrologers', [token]);

  const toggleActive = async (astro: any) => {
    const next = astro.is_active === false;
    setBusyId(astro.id);
    try {
      await apiFetch(`/admin/astrologers/${astro.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: next }),
      }, token);
      toast.success(next ? `${astro.full_name} activated` : `${astro.full_name} deactivated`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const statusBadge = (a: any) => {
    if (a.is_active === false) return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">Deactivated</span>;
    if (a.approval_status === 'pending') return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Pending</span>;
    if (a.availability_status === 'online') return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Online</span>;
    return <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-600 text-slate-300">Offline</span>;
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-violet-500/15 border border-violet-500/30 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">All Astrologers</h1>
          <p className="text-slate-500 text-sm">Full profiles — deactivate to hide from website</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">Loading...</div>
      ) : astrologers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          No astrologers yet. Approve applications first.
        </div>
      ) : (
        <div className="space-y-3">
          {astrologers.map((a) => {
            const open = expanded === a.id;
            const avatar = a.avatar_url ? mediaUrl(a.avatar_url) : `https://ui-avatars.com/api/?name=${encodeURIComponent(a.full_name)}&background=7c3aed&color=fff`;
            return (
              <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <img src={avatar} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{a.full_name}</h3>
                      {statusBadge(a)}
                      <span className="text-xs text-slate-500 flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {a.rating} ({a.total_reviews})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{a.user?.email || 'No login linked'}</p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{a.bio || 'No bio'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link to={`/astrologer/${a.id}`} target="_blank" className="text-xs px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === a.id}
                      onClick={() => toggleActive(a)}
                      className={`text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-1 ${
                        a.is_active === false
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-600/30'
                          : 'bg-red-600/20 text-red-300 border border-red-600/40 hover:bg-red-600/30'
                      }`}
                    >
                      {a.is_active === false ? <><Eye className="w-3.5 h-3.5" /> Activate</> : <><EyeOff className="w-3.5 h-3.5" /> Deactivate</>}
                    </button>
                    <button type="button" onClick={() => setExpanded(open ? null : a.id)} className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800">
                      {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-800">
                    <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Contact</p>
                        <p className="text-slate-300">Email: {a.user?.email || '—'}</p>
                        <p className="text-slate-300">Phone: {a.user?.phone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Details</p>
                        <p className="text-slate-300">Experience: {a.experience} yrs</p>
                        <p className="text-slate-300">Education: {a.education || '—'}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-slate-500 text-xs mb-1">Bio</p>
                        <p className="text-slate-300">{a.bio || '—'}</p>
                      </div>
                      {a.services?.length > 0 && (
                        <div className="sm:col-span-2">
                          <p className="text-slate-500 text-xs mb-1">Services</p>
                          <div className="flex flex-wrap gap-1.5">
                            {a.services.map((s: string) => (
                              <span key={s} className="text-xs px-2 py-1 bg-violet-500/15 text-violet-300 rounded-lg">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {a.expertise?.length > 0 && (
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Expertise</p>
                          <p className="text-slate-300">{a.expertise.join(', ')}</p>
                        </div>
                      )}
                      {a.languages?.length > 0 && (
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Languages</p>
                          <p className="text-slate-300">{a.languages.join(', ')}</p>
                        </div>
                      )}
                      {a.gallery_images?.length > 0 && (
                        <div className="sm:col-span-2">
                          <p className="text-slate-500 text-xs mb-2">Gallery ({a.gallery_images.length} photos)</p>
                          <div className="flex flex-wrap gap-2">
                            {a.gallery_images.slice(0, 6).map((url: string, i: number) => (
                              <img key={i} src={mediaUrl(url)} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-700" />
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Pricing</p>
                        <p className="text-slate-300">Chat ₹{a.chat_price} · Call ₹{a.call_price} · Video ₹{a.video_price}/min</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Status</p>
                        <p className="text-slate-300 capitalize">{a.approval_status} · {a.is_active === false ? 'Hidden from site' : 'Visible on site'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}