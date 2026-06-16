import { useState } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import toast from 'react-hot-toast';

export default function AstroAvailability() {
  const { token, user } = useAuth();
  const [status, setStatus] = useState(user?.astrologer_profile?.availability_status || 'online');
  const [loading, setLoading] = useState(false);

  const slots = user?.astrologer_profile?.available_slots || [
    { day: 'Monday', start_time: '09:00', end_time: '18:00' },
    { day: 'Wednesday', start_time: '10:00', end_time: '20:00' },
  ];

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      await apiFetch('/astrologers/availability', { method: 'PATCH', body: JSON.stringify({ status: newStatus }) }, token);
      setStatus(newStatus);
      toast.success(`Status set to ${newStatus}`);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Availability</h1>
          <p className="text-gray-500 text-sm">Control when users can reach you</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-amber-100 p-6 mb-6">
        <h3 className="font-semibold mb-4">Current Status</h3>
        <div className="flex gap-3">
          {(['online', 'busy', 'offline'] as const).map(s => (
            <button key={s} onClick={() => updateStatus(s)} disabled={loading} className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition ${status === s ? (s === 'online' ? 'bg-emerald-600 text-white' : s === 'busy' ? 'bg-amber-500 text-white' : 'bg-gray-600 text-white') : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-amber-100 p-6">
        <h3 className="font-semibold mb-4">Weekly Schedule</h3>
        <div className="space-y-3">
          {slots.map((slot: any, i: number) => (
            <div key={i} className="flex justify-between items-center p-4 bg-amber-50/50 rounded-xl text-sm">
              <span className="font-medium">{slot.day}</span>
              <span className="text-gray-600">{slot.start_time} — {slot.end_time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}