import { useState } from 'react';
import { UserCheck, Check, X, Plus, Pencil, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import toast from 'react-hot-toast';

const emptyForm = {
  full_name: '',
  avatar_url: '',
  experience: '0',
  bio: '',
  education: '',
  expertise: '',
  languages: 'Hindi, English',
  skills: '',
  certifications: '',
  chat_price: '10',
  call_price: '15',
  video_price: '20',
  availability_status: 'offline',
  is_featured: false,
  is_new: true,
};

export default function AdminAstrologers() {
  const { token } = useAuth();
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    if (!token) return;
    const path = filter === 'all' ? '/admin/astrologers' : `/admin/astrologers?status=${filter}`;
    apiFetch(path, {}, token).then(setAstrologers).catch(() => {}).finally(() => setLoading(false));
  };

  useRealtimeData(load, 'astrologers', [token, filter]);

  const toForm = (a?: any) => ({
    full_name: a?.full_name || '',
    avatar_url: a?.avatar_url || '',
    experience: String(a?.experience ?? 0),
    bio: a?.bio || '',
    education: a?.education || '',
    expertise: (a?.expertise || []).join(', '),
    languages: (a?.languages || ['Hindi', 'English']).join(', '),
    skills: (a?.skills || []).join(', '),
    certifications: (a?.certifications || []).join(', '),
    chat_price: String(a?.chat_price ?? 10),
    call_price: String(a?.call_price ?? 15),
    video_price: String(a?.video_price ?? 20),
    availability_status: a?.availability_status || 'offline',
    is_featured: a?.is_featured ?? false,
    is_new: a?.is_new ?? true,
  });

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setModal('create');
  };

  const openEdit = (a: any) => {
    setEditing(a);
    setForm(toForm(a));
    setModal('edit');
  };

  const splitList = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);

  const save = async () => {
    if (!form.full_name) {
      toast.error('Name is required');
      return;
    }
    const body = {
      full_name: form.full_name,
      avatar_url: form.avatar_url || undefined,
      experience: Number(form.experience),
      bio: form.bio,
      education: form.education,
      expertise: splitList(form.expertise),
      languages: splitList(form.languages),
      skills: splitList(form.skills),
      certifications: splitList(form.certifications),
      chat_price: Number(form.chat_price),
      call_price: Number(form.call_price),
      video_price: Number(form.video_price),
      availability_status: form.availability_status,
      is_online: form.availability_status === 'online',
      is_featured: form.is_featured,
      is_new: form.is_new,
    };
    try {
      if (modal === 'edit' && editing) {
        await apiFetch(`/admin/astrologers/${editing._id}`, { method: 'PATCH', body: JSON.stringify(body) }, token);
        toast.success('Astrologer updated');
      } else {
        await apiFetch('/admin/astrologers', { method: 'POST', body: JSON.stringify(body) }, token);
        toast.success('Astrologer added');
      }
      setModal(null);
      load();
    } catch {
      toast.error('Failed to save');
    }
  };

  const approve = async (id: string) => {
    await apiFetch(`/admin/astrologers/${id}/approve`, { method: 'POST' }, token);
    toast.success('Approved');
    load();
  };

  const reject = async (id: string) => {
    await apiFetch(`/admin/astrologers/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason: 'Does not meet criteria' }) }, token);
    toast.success('Rejected');
    load();
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 text-purple-400 rounded-xl flex items-center justify-center border border-slate-700">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Astrologers</h1>
            <p className="text-slate-400 text-sm">Add & manage all astrologer profiles from admin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={openCreate} className="flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl text-white font-medium">
            <Plus className="w-4 h-4" /> Add Astrologer
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading...</div>
        ) : astrologers.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No astrologers. Add your first profile above.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {astrologers.map((a: any) => (
              <div key={a._id} className="p-4 flex items-center gap-4">
                <img
                  src={a.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.full_name)}&background=7c3aed&color=fff`}
                  alt={a.full_name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm">{a.full_name}</div>
                  <div className="text-xs text-slate-500">
                    {a.experience} yrs • {a.approval_status} • {a.availability_status} • ★ {a.rating}
                  </div>
                  <div className="text-xs text-slate-600 truncate mt-0.5">{(a.expertise || []).join(' • ')}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {a.approval_status === 'approved' && (
                    <Link to={`/astrologer/${a._id}`} target="_blank" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white" title="View profile">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  <button onClick={() => openEdit(a)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {a.approval_status === 'pending' && (
                    <>
                      <button onClick={() => approve(a._id)} className="flex items-center text-xs bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-white">
                        <Check className="w-3.5 h-3.5 mr-1" />Approve
                      </button>
                      <button onClick={() => reject(a._id)} className="flex items-center text-xs bg-red-600/80 hover:bg-red-600 px-3 py-1.5 rounded-lg text-white">
                        <X className="w-3.5 h-3.5 mr-1" />Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">{modal === 'create' ? 'Add Astrologer' : 'Edit Astrologer'}</h2>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-slate-800 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Full Name *</label>
                <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Photo URL</label>
                <input value={form.avatar_url} onChange={e => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://..." className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Experience (years)</label>
                <input type="number" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Status</label>
                <select value={form.availability_status} onChange={e => setForm({ ...form, availability_status: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white">
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Expertise (comma separated)</label>
                <input value={form.expertise} onChange={e => setForm({ ...form, expertise: e.target.value })} placeholder="Vedic, Tarot, Numerology" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Languages</label>
                <input value={form.languages} onChange={e => setForm({ ...form, languages: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Skills</label>
                <input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Certifications</label>
                <input value={form.certifications} onChange={e => setForm({ ...form, certifications: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Bio</label>
                <textarea rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Education</label>
                <input value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Chat Price (₹/min)</label>
                <input type="number" value={form.chat_price} onChange={e => setForm({ ...form, chat_price: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Call Price (₹/min)</label>
                <input type="number" value={form.call_price} onChange={e => setForm({ ...form, call_price: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Video Price (₹/min)</label>
                <input type="number" value={form.video_price} onChange={e => setForm({ ...form, video_price: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" />
              </div>
              <div className="flex items-center gap-4 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
                  Featured on home
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={form.is_new} onChange={e => setForm({ ...form, is_new: e.target.checked })} />
                  Mark as new
                </label>
              </div>
            </div>
            <div className="p-5 border-t border-slate-800 flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm">Cancel</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium">Save Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}