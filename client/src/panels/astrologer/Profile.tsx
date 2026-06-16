import { useState } from 'react';
import { User, Save } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import toast from 'react-hot-toast';

export default function AstroProfile() {
  const { token, user, refreshUser } = useAuth();
  const profile = user?.astrologer_profile || {};
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bio: profile.bio || '',
    chat_price: profile.chat_price || 20,
    call_price: profile.call_price || 30,
    video_price: profile.video_price || 50,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/astrologers/profile', { method: 'PATCH', body: JSON.stringify({ bio: form.bio }) }, token);
      await apiFetch('/astrologers/pricing', { method: 'PATCH', body: JSON.stringify({ chat_price: form.chat_price, call_price: form.call_price, video_price: form.video_price }) }, token);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center"><User className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm">Update bio and pricing</p>
        </div>
      </div>
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-amber-100 p-6 space-y-4 max-w-lg">
        <div>
          <label className="text-sm font-medium text-gray-700">Bio</label>
          <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} className="w-full mt-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(['chat_price', 'call_price', 'video_price'] as const).map(f => (
            <div key={f}>
              <label className="text-xs font-medium text-gray-600 capitalize">{f.replace('_price', '')} ₹/min</label>
              <input type="number" value={form[f]} onChange={e => setForm({ ...form, [f]: parseInt(e.target.value) })} className="w-full mt-1 border rounded-xl px-3 py-2 text-sm" />
            </div>
          ))}
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 disabled:opacity-60">
          <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}