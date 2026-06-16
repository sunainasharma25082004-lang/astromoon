import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, DollarSign, ShoppingBag, AlertTriangle, Check, Shield, Package } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';

export default function AdminDashboardHome() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const loadAdminData = async () => {
    if (!token) return;
    try {
      const [s, u, a, o] = await Promise.all([
        apiFetch('/admin/stats', {}, token),
        apiFetch('/admin/users?limit=30', {}, token),
        apiFetch('/admin/astrologers', {}, token),
        apiFetch('/admin/orders', {}, token),
      ]);
      setStats(s);
      setUsers(Array.isArray(u) ? u : []);
      setAstrologers(Array.isArray(a) ? a : []);
      setOrders(Array.isArray(o) ? o : []);
    } catch {}
  };

  useRealtimeData(loadAdminData, ['stats', 'users', 'astrologers', 'orders', 'transactions'], [token]);

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
              <ShoppingBag className="w-5 h-5 text-amber-400 mb-3" />
              <div className="text-3xl font-semibold text-white">{orders.length}</div>
              <div className="text-sm text-slate-400">Shop Orders</div>
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
          <Link to="/admin/products" className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5">
            <ShoppingBag className="mb-2 text-amber-400 w-5 h-5" />
            <div className="font-medium text-white">Shop Products</div>
            <div className="text-xs text-slate-400 mt-1">Upload &amp; manage products</div>
          </Link>
          <Link to="/admin/orders" className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5">
            <Package className="mb-2 text-sky-400 w-5 h-5" />
            <div className="font-medium text-white">Shop Orders</div>
            <div className="text-xs text-slate-400 mt-1">User purchase history</div>
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
          <div className="font-medium mb-3 text-white text-sm flex justify-between">
            <span>Recent Shop Orders</span>
            <Link to="/admin/orders" className="text-xs text-sky-400">View all</Link>
          </div>
          <div className="text-xs space-y-1.5 max-h-48 overflow-auto">
            {orders.slice(0, 5).map((o: any) => (
              <div key={o._id} className="flex justify-between px-2 py-1.5 bg-slate-950 rounded-lg text-slate-400">
                <span>{o.user_id?.full_name || 'User'}</span>
                <span className="text-emerald-400">₹{o.total}</span>
              </div>
            ))}
            {orders.length === 0 && <div className="text-slate-500 text-center py-4">No orders yet</div>}
          </div>
        </div>
      </div>
    </>
  );
}