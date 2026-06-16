import { useEffect, useState } from 'react';
import { Users, Search, Plus } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (q = '') => {
    if (!token) return;
    const path = q ? `/admin/users?search=${encodeURIComponent(q)}` : '/admin/users';
    apiFetch(path, {}, token).then(setUsers).catch(() => {}).finally(() => setLoading(false));
  };

  useRealtimeData(() => load(search), ['users', 'wallet', 'stats'], [token, search]);

  const adjustWallet = async (id: string, amount: number) => {
    await apiFetch(`/admin/users/${id}/wallet`, { method: 'POST', body: JSON.stringify({ amount, type: 'credit' }) }, token);
    toast.success(`₹${amount} credited`);
    load(search);
  };

  const toggleBlock = async (id: string, blocked: boolean) => {
    await apiFetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ is_blocked: !blocked }) }, token);
    toast.success(blocked ? 'User unblocked' : 'User blocked');
    load(search);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 text-blue-400 rounded-xl flex items-center justify-center border border-slate-700"><Users className="w-5 h-5" /></div>
          <div><h1 className="text-2xl font-semibold text-white">Manage Users</h1><p className="text-slate-400 text-sm">{users.length} users</p></div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(search)} placeholder="Search..." className="bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white w-48" />
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? <div className="p-10 text-center text-slate-500">Loading...</div> : (
          <div className="divide-y divide-slate-800">
            {users.map((u: any) => (
              <div key={u._id} className="p-4 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium text-white">{u.full_name}</div>
                  <div className="text-xs text-slate-500">{u.email} • {u.role} {u.is_blocked && <span className="text-red-400">(blocked)</span>}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-medium">₹{u.wallet_balance || 0}</span>
                  <button onClick={() => adjustWallet(u._id, 200)} className="text-xs text-blue-400 hover:underline flex items-center gap-0.5"><Plus className="w-3 h-3" />₹200</button>
                  <button onClick={() => toggleBlock(u._id, u.is_blocked)} className="text-xs text-slate-400 hover:text-white underline">{u.is_blocked ? 'Unblock' : 'Block'}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}