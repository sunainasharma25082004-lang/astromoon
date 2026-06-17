import { useState, useEffect } from 'react';
import { Clock, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Slot {
  day: string;
  start_time: string;
  end_time: string;
}

export default function AstroAvailability() {
  const { token, refreshUser } = useAuth();
  const [status, setStatus] = useState('offline');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch('/astrologers/me/profile', {}, token)
      .then((p: any) => {
        setStatus(p.availability_status || 'offline');
        setSlots(p.available_slots?.length ? p.available_slots : [
          { day: 'Monday', start_time: '09:00', end_time: '18:00' },
          { day: 'Wednesday', start_time: '10:00', end_time: '20:00' },
        ]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const updateStatus = async (newStatus: string) => {
    try {
      await apiFetch('/astrologers/availability', { method: 'PATCH', body: JSON.stringify({ status: newStatus }) }, token);
      setStatus(newStatus);
      await refreshUser();
      toast.success(`Status: ${newStatus}`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const addSlot = () => {
    setSlots(prev => [...prev, { day: 'Monday', start_time: '09:00', end_time: '17:00' }]);
  };

  const updateSlot = (idx: number, field: keyof Slot, value: string) => {
    setSlots(prev => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const removeSlot = (idx: number) => {
    setSlots(prev => prev.filter((_, i) => i !== idx));
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      await apiFetch('/astrologers/profile', {
        method: 'PATCH',
        body: JSON.stringify({ available_slots: slots }),
      }, token);
      await refreshUser();
      toast.success('Schedule saved — visible on your public profile');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-400 text-sm">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Availability</h1>
          <p className="text-gray-500 text-sm">Online status & weekly schedule shown to users</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-amber-100 p-6 mb-6">
        <h3 className="font-semibold mb-4">Current Status</h3>
        <div className="flex flex-wrap gap-3">
          {(['online', 'busy', 'offline'] as const).map(s => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition ${
                status === s
                  ? (s === 'online' ? 'bg-emerald-600 text-white' : s === 'busy' ? 'bg-amber-500 text-white' : 'bg-gray-600 text-white')
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-amber-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Weekly Schedule</h3>
          <button type="button" onClick={addSlot} className="text-sm text-amber-700 font-medium flex items-center gap-1 hover:underline">
            <Plus className="w-4 h-4" /> Add slot
          </button>
        </div>
        <div className="space-y-3 mb-5">
          {slots.map((slot, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 p-3 bg-amber-50/50 rounded-xl">
              <select
                value={slot.day}
                onChange={e => updateSlot(i, 'day', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input
                type="time"
                value={slot.start_time}
                onChange={e => updateSlot(i, 'start_time', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="time"
                value={slot.end_time}
                onChange={e => updateSlot(i, 'end_time', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button type="button" onClick={() => removeSlot(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg ml-auto">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={saveSchedule}
          disabled={saving}
          className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 disabled:opacity-60"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  );
}