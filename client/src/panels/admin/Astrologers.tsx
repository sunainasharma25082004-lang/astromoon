import { useEffect, useState } from 'react';
import { UserCheck, Check, X } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import toast from 'react-hot-toast';

export default function AdminAstrologers() {
  const { token } = useAuth();
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!token) return;
    const path = filter === 'all' ? '/admin/astrologers' : `/admin/astrologers?status=${filter}`;
    apiFetch(path, {}, token).then(setAstrologers).catch(() => {}).finally(() => setLoading(false));
  };

  useRealtimeData(load, 'astrologers', [token, filter]);

  const approve = async (id: string) => {
    await apiFetch(`/admin/astrologers/${id}/approve`, { method: 'POST' }, token);
    toast.success('Astrologer approved');
    load();
  };

  const reject = async (id: string) => {
    await apiFetch(`/admin/astrologers/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason: 'Does not meet criteria' }) }, token);
    toast.success('Astrologer rejected');
    load();
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 text-purple-400 rounded-xl flex items-center justify-center border border-slate-700"><UserCheck className="w-5 h-5" /></div>
          <div><h1 className="text-2xl font-semibold text-white">Astrologers</h1><p className="text-slate-400 text-sm">{astrologers.length} profiles</p></div>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? <div className="p-10 text-center text-slate-500">Loading...</div> : (
          <div className="divide-y divide-slate-800">
            {astrologers.map((a: any) => (
              <div key={a._id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white text-sm">{a.full_name}</div>
                  <div className="text-xs text-slate-500">{a.experience} yrs • {a.approval_status} • {a.availability_status}</div>
                </div>
                <div className="flex gap-2">
                  {a.approval_status === 'pending' && (
                    <>
                      <button onClick={() => approve(a._id)} className="flex items-center text-xs bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-white"><Check className="w-3.5 h-3.5 mr-1" />Approve</button>
                      <button onClick={() => reject(a._id)} className="flex items-center text-xs bg-red-600/80 hover:bg-red-600 px-3 py-1.5 rounded-lg text-white"><X className="w-3.5 h-3.5 mr-1" />Reject</button>
                    </>
                  )}
                  <span className="text-xs text-amber-400 self-center">★ {a.rating}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}