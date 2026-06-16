import { useEffect, useState } from 'react';
import { Shield, Check } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import toast from 'react-hot-toast';

export default function AdminModeration() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);

  const load = () => apiFetch('/admin/reviews/reported', {}, token).then(setReviews).catch(() => setReviews([]));

  useRealtimeData(load, 'reviews', [token]);

  const dismiss = async (id: string) => {
    await apiFetch(`/admin/reviews/${id}/dismiss`, { method: 'PATCH' }, token);
    toast.success('Report dismissed');
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 text-red-400 rounded-xl flex items-center justify-center border border-slate-700"><Shield className="w-5 h-5" /></div>
        <div><h1 className="text-2xl font-semibold text-white">Moderation</h1><p className="text-slate-400 text-sm">{reviews.length} flagged reviews</p></div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
        {reviews.length === 0 ? <div className="p-10 text-center text-slate-500">No flagged content</div> : reviews.map((r: any) => (
          <div key={r._id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-white">{r.user_id?.full_name} on {r.astrologer_id?.full_name}</div>
              <button onClick={() => dismiss(r._id)} className="text-xs text-emerald-400 flex items-center gap-1 hover:underline"><Check className="w-3.5 h-3.5" />Dismiss</button>
            </div>
            <p className="text-sm text-slate-400">{r.comment}</p>
            {r.report_reason && <p className="text-xs text-red-400 mt-1">Reason: {r.report_reason}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}