import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, DollarSign, FileText, AlertTriangle, Check, Shield } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';

export default function AdminDashboardHome() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);

  const loadAdminData = async () => {
    if (!token) return;
    try {
      const [s, u, a, c] = await Promise.all([
        apiFetch('/admin/stats', {}, token),
        apiFetch('/admin/users?limit=30', {}, token),
        apiFetch('/admin/astrologers', {}, token),
        apiFetch('/admin/consultations', {}, token),
      ]);
      setStats(s);
      setUsers(Array.isArray(u) ? u : []);
      setAstrologers(Array.isArray(a) ? a : []);
      setConsultations(Array.isArray(c) ? c : []);
    } catch {}
  };

  useRealtimeData(loadAdminData, ['stats', 'users', 'astrologers', 'consultations', 'transactions', 'withdrawals', 'applications'], [token]);

  const approveAstro = async (id: string) => {
    if (!token) return;
    await apiFetch(`/admin/astrologers/${id}/approve`, { method: 'POST' }, token);
    loadAdminData();
  };

  const adjustWallet = async (userId: string, amount: number, type: 'credit' | 'debit') => {
    if (!token) return;
    await apiFetch(`/admin/users/${userId}/wallet`, { method: 'POST', body: JSON.stringify({ amount, type }) }, token);
    loadAdminData();
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Admin Overview</h1>
          <p className="text-slate-400 text-sm">Platform health • {new Date().toLocaleDateString()}</p>
        </div>
        <span className="px-3 py-1 text-xs border border-slate-700 rounded-full text-emerald-400 bg-emerald-500/10">● LIVE</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats ? (
          <>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <Users className="w-5 h-5 text-blue-400 mb-3" />
              <div className="text-3xl font-semibold text-white">{stats.totalUsers}</div>
              <div className="text-sm text-slate-400">Total Users</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <UserCheck className="w-5 h-5 text-purple-400 mb-3" />
              <div className="text-3xl font-semibold text-white">{stats.totalAstrologers}</div>
              <div className="text-sm text-slate-400">Astrologers</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <DollarSign className="w-5 h-5 text-emerald-400 mb-3" />
              <div className="text-3xl font-semibold text-white">₹{Math.round(stats.totalRevenue || 0)}</div>
              <div className="text-sm text-slate-400">Revenue</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <FileText className="w-5 h-5 text-amber-400 mb-3" />
              <div className="text-3xl font-semibold text-white">{stats.totalConsultations}</div>
              <div className="text-sm text-slate-400">Consultations</div>
            </div>
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-500">Loading...</div>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-5 mb-5">
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between mb-4 items-center">
            <div className="font-medium flex items-center gap-2 text-white">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Pending Approvals
            </div>
            <Link to="/admin/astrologers" className="text-xs px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400">Manage</Link>
          </div>
          <div className="space-y-2 max-h-72 overflow-auto">
            {astrologers.filter((a: any) => !a.is_verified).slice(0, 5).map((p: any) => (
              <div key={p._id} className="flex items-center justify-between bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl">
                <div>
                  <div className="font-medium text-white text-sm">{p.full_name}</div>
                  <div className="text-xs text-slate-500">{p.experience || 0} yrs exp</div>
                </div>
                <button onClick={() => approveAstro(p._id)} className="flex items-center text-xs bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-white">
                  <Check className="w-3.5 h-3.5 mr-1" /> Approve
                </button>
              </div>
            ))}
            {astrologers.filter((a: any) => !a.is_verified).length === 0 && (
              <div className="text-sm text-slate-500 py-6 text-center">No pending approvals</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <Link to="/admin/users" className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5">
            <Users className="mb-2 text-blue-400 w-5 h-5" />
            <div className="font-medium text-white">User Management</div>
            <div className="text-xs text-slate-400 mt-1">Wallet, block, activity</div>
          </Link>
          <Link to="/admin/transactions" className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5">
            <DollarSign className="mb-2 text-emerald-400 w-5 h-5" />
            <div className="font-medium text-white">Financials</div>
            <div className="text-xs text-slate-400 mt-1">Transactions &amp; payouts</div>
          </Link>
          <Link to="/admin/moderation" className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5">
            <Shield className="mb-2 text-red-400 w-5 h-5" />
            <div className="font-medium text-white">Moderation</div>
            <div className="text-xs text-slate-400 mt-1">Reports &amp; flagged content</div>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="font-medium mb-3 text-white text-sm">Recent Users</div>
          <div className="text-xs space-y-2 max-h-48 overflow-auto">
            {users.slice(0, 6).map((u: any) => (
              <div key={u._id} className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-lg">
                <span className="text-slate-300">{u.full_name}</span>
                <span className="text-emerald-400">₹{u.wallet_balance || 0}</span>
                <button onClick={() => adjustWallet(u._id, 200, 'credit')} className="text-[10px] text-blue-400 hover:underline">+₹200</button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="font-medium mb-3 text-white text-sm">Recent Consultations</div>
          <div className="text-xs space-y-1.5 max-h-48 overflow-auto">
            {consultations.slice(0, 5).map((c: any) => (
              <div key={c._id} className="flex justify-between px-2 py-1.5 bg-slate-950 rounded-lg text-slate-400">
                <span>{c.user_id?.full_name} → {c.astrologer_id?.full_name}</span>
                <span className="text-amber-400 capitalize">{c.type} • ₹{c.total_amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}