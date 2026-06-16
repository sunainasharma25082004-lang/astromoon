import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import toast from 'react-hot-toast';

export default function AdminConsultations() {
  const { token } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);

  const load = () => apiFetch('/admin/consultations', {}, token).then(setConsultations).catch(() => {});

  useRealtimeData(load, 'consultations', [token]);

  const updateStatus = async (id: string, status: string) => {
    await apiFetch(`/admin/consultations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
    toast.success(`Status → ${status}`);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 text-amber-400 rounded-xl flex items-center justify-center border border-slate-700"><FileText className="w-5 h-5" /></div>
        <div><h1 className="text-2xl font-semibold text-white">Consultations</h1><p className="text-slate-400 text-sm">{consultations.length} sessions</p></div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
        {consultations.length === 0 ? <div className="p-10 text-center text-slate-500">No consultations</div> : consultations.map((c: any) => (
          <div key={c._id} className="p-4 flex items-center justify-between text-sm">
            <div>
              <div className="text-white">{c.user_id?.full_name} → {c.astrologer_id?.full_name}</div>
              <div className="text-xs text-slate-500 capitalize">{c.type} • ₹{c.total_amount || 0} • {c.status}</div>
            </div>
            {c.status === 'active' && (
              <button onClick={() => updateStatus(c._id, 'completed')} className="text-xs text-amber-400 hover:underline">Force Complete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}