import { useState } from 'react';
import { Settings, Save, User, Phone, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import toast from 'react-hot-toast';
import { PageHeader, PanelCard } from '../../components/user/PageHeader';

const inputClass =
  'w-full mt-1.5 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition';

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
      <PageHeader
        icon={Settings}
        title="Settings"
        subtitle="Update your account details"
      />

      <PanelCard className="p-6 max-w-lg">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-violet-500" /> Full Name
            </label>
            <input
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-violet-500" /> Phone
            </label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-violet-500" /> Birth Place
            </label>
            <input
              value={form.birth_place}
              onChange={e => setForm({ ...form, birth_place: e.target.value })}
              className={inputClass}
              placeholder="City, State"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-violet-500" /> Birth Time
            </label>
            <input
              value={form.birth_time}
              onChange={e => setForm({ ...form, birth_time: e.target.value })}
              placeholder="HH:MM"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 transition shadow-md shadow-violet-200"
          >
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </PanelCard>
    </div>
  );
}