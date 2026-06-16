import { useEffect, useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    free_trial_minutes: 5,
    platform_commission_percent: 30,
    signup_bonus: 100,
    referral_bonus: 50,
  });

  useEffect(() => {
    if (token) apiFetch('/admin/settings', {}, token).then((s: any) => {
      setForm({
        free_trial_minutes: s.free_trial_minutes ?? 5,
        platform_commission_percent: s.platform_commission_percent ?? 30,
        signup_bonus: s.signup_bonus ?? 100,
        referral_bonus: s.referral_bonus ?? 50,
      });
    }).catch(() => {});
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/admin/settings', { method: 'PATCH', body: JSON.stringify(form) }, token);
      toast.success('Settings saved!');
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 text-slate-300 rounded-xl flex items-center justify-center border border-slate-700"><Settings className="w-5 h-5" /></div>
        <div><h1 className="text-2xl font-semibold text-white">Platform Settings</h1><p className="text-slate-400 text-sm">Global configuration</p></div>
      </div>
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-md">
        {[
          { key: 'free_trial_minutes', label: 'Free Trial Minutes' },
          { key: 'platform_commission_percent', label: 'Platform Commission %' },
          { key: 'signup_bonus', label: 'Signup Bonus (₹)' },
          { key: 'referral_bonus', label: 'Referral Bonus (₹)' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-sm text-slate-400">{f.label}</label>
            <input type="number" value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: parseInt(e.target.value) })} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white" />
          </div>
        ))}
        <p className="text-xs text-slate-500">Payment: Demo mode active. Add Razorpay keys in admin settings when ready.</p>
        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60">
          <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}