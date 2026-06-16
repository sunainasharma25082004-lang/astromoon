import { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import toast from 'react-hot-toast';

export default function UserSettings() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    birth_place: '',
    birth_time: '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Settings saved!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center"><Settings className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm">Update your account details</p>
        </div>
      </div>
      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6 space-y-4 max-w-lg">
        <div>
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full mt-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Birth Place</label>
          <input value={form.birth_place} onChange={e => setForm({ ...form, birth_place: e.target.value })} className="w-full mt-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Birth Time</label>
          <input value={form.birth_time} onChange={e => setForm({ ...form, birth_time: e.target.value })} placeholder="HH:MM" className="w-full mt-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400" />
        </div>
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-sky-700 disabled:opacity-60">
          <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}