import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, UserCheck, DollarSign, BarChart3, Shield, 
  FileText, Settings, AlertTriangle, Check, X 
} from 'lucide-react';
import { useAuth } from '../../context/Auth';

const adminSidebar = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Manage Users', path: '/admin/users', icon: Users },
  { label: 'Astrologers', path: '/admin/astrologers', icon: UserCheck },
  { label: 'Consultations', path: '/admin/consultations', icon: FileText },
  { label: 'Transactions', path: '/admin/transactions', icon: DollarSign },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Moderation', path: '/admin/moderation', icon: Shield },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

const kpis = [
  { label: 'Total Users', value: '12,480', change: '+312 this week', icon: Users, color: 'text-blue-600' },
  { label: 'Active Astrologers', value: '487', change: '42 pending verification', icon: UserCheck, color: 'text-purple-600' },
  { label: 'Revenue (MTD)', value: '₹8.4L', change: '+18% from last month', icon: DollarSign, color: 'text-emerald-600' },
  { label: 'Consultations Today', value: '284', change: '19 ongoing right now', icon: FileText, color: 'text-amber-600' },
];

const pendingAstros = [
  { id: 'a1', name: 'Dr. Meera Joshi', exp: '9 yrs', rating: '4.6', applied: '2d ago' },
  { id: 'a2', name: 'Pt. Vikram Malhotra', exp: '18 yrs', rating: '4.9', applied: '5d ago' },
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const location = useLocation();
  const { user, token } = useAuth();
  const [tab, setTab] = useState<'overview' | 'pending'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isMain = location.pathname === '/admin';
  const displayName = user?.full_name || 'Admin';

  const loadAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [s, u, a, c] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_BASE}/admin/users?limit=30`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_BASE}/admin/astrologers`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${API_BASE}/admin/consultations`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      setStats(s);
      setUsers(Array.isArray(u) ? u : []);
      setAstrologers(Array.isArray(a) ? a : []);
      setConsultations(Array.isArray(c) ? c : []);
    } catch (e) {
      console.error('Admin data load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [token]);

  const approveAstro = async (id: string) => {
    if (!token) return;
    await fetch(`${API_BASE}/admin/astrologers/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    loadAdminData();
  };

  const adjustWallet = async (userId: string, amount: number, type: 'credit' | 'debit') => {
    if (!token) return;
    await fetch(`${API_BASE}/admin/users/${userId}/wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount, type })
    });
    loadAdminData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Admin Sidebar - dark professional look */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{displayName}</div>
                    <div className="text-xs text-slate-400">Administrator</div>
                  </div>
                </div>
              </div>

              <nav className="p-3 text-sm">
                {adminSidebar.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className={`flex items-center gap-3 px-4 py-[10px] rounded-xl mb-1 ${location.pathname === item.path 
                      ? 'bg-slate-800 text-white' 
                      : 'text-slate-400 hover:bg-slate-950 hover:text-slate-200'}`}
                  >
                    <item.icon className="w-4 h-4" /> {item.label}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500">
                Admin Panel v1 • All actions logged
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            {isMain ? (
              <>
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tighter text-white">Admin Overview</h1>
                    <p className="text-slate-400">Platform health at a glance • {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="px-4 py-1 text-xs border border-slate-700 rounded-full text-slate-400">LIVE DATA</div>
                </div>

                {/* Live KPI Cards from backend */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                  {stats ? (
                    <>
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><Users className="w-5 h-5 text-blue-400" /><div className="text-3xl font-semibold mt-4">{stats.totalUsers}</div><div className="text-sm text-slate-400">Total Users</div></div>
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><UserCheck className="w-5 h-5 text-purple-400" /><div className="text-3xl font-semibold mt-4">{stats.totalAstrologers}</div><div className="text-sm text-slate-400">Active Astrologers</div></div>
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><DollarSign className="w-5 h-5 text-emerald-400" /><div className="text-3xl font-semibold mt-4">₹{Math.round(stats.totalRevenue || 0)}</div><div className="text-sm text-slate-400">Total Revenue</div></div>
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><FileText className="w-5 h-5 text-amber-400" /><div className="text-3xl font-semibold mt-4">{stats.totalConsultations}</div><div className="text-sm text-slate-400">Consultations</div></div>
                    </>
                  ) : (
                    kpis.map((kpi, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 opacity-70">Loading...</div>
                    ))
                  )}
                </div>

                <div className="grid lg:grid-cols-5 gap-5">
                  {/* Pending verifications */}
                  <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <div className="flex justify-between mb-4 items-center">
                      <div className="font-medium flex items-center gap-2 text-white">
                        <AlertTriangle className="w-4 h-4 text-amber-400" /> Pending Astrologer Approvals
                      </div>
                      <Link to="/admin/astrologers" className="text-xs px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800">Manage all</Link>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-auto">
                      {astrologers.filter((a: any) => !a.is_verified).slice(0, 5).map((p: any) => (
                        <div key={p._id} className="flex items-center justify-between bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl">
                          <div>
                            <div className="font-medium">{p.full_name}</div>
                            <div className="text-xs text-slate-500">Experience: {p.experience || 0} yrs • {p.languages?.join(', ')}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => approveAstro(p._id)} className="flex items-center text-xs bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 rounded-xl"><Check className="w-3.5 h-3.5 mr-1" /> Approve</button>
                          </div>
                        </div>
                      ))}
                      {astrologers.filter((a: any) => !a.is_verified).length === 0 && <div className="text-sm text-slate-400 py-8 text-center">No pending astrologer approvals.</div>}
                    </div>
                  </div>

                  {/* Quick management cards */}
                  <div className="lg:col-span-2 space-y-4">
                    <Link to="/admin/users" className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5">
                      <Users className="mb-3 text-blue-400" />
                      <div className="font-medium">User Management</div>
                      <div className="text-xs text-slate-400 mt-1">Search, block, view activity and wallet balances</div>
                    </Link>

                    <Link to="/admin/transactions" className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5">
                      <DollarSign className="mb-3 text-emerald-400" />
                      <div className="font-medium">Financials &amp; Payouts</div>
                      <div className="text-xs text-slate-400 mt-1">Reconciliations, refunds and astrologer settlements</div>
                    </Link>

                    <Link to="/admin/moderation" className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5">
                      <Shield className="mb-3 text-red-400" />
                      <div className="font-medium">Content Moderation</div>
                      <div className="text-xs text-slate-400 mt-1">Flagged reviews, chats and reports</div>
                    </Link>
                  </div>
                </div>

                {/* Quick admin management tables */}
                <div className="grid lg:grid-cols-2 gap-5 mt-2">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                    <div className="font-medium mb-3 text-white">Recent Users</div>
                    <div className="text-xs space-y-2 max-h-52 overflow-auto">
                      {users.slice(0, 6).map((u: any) => (
                        <div key={u._id} className="flex justify-between bg-slate-950 px-3 py-2 rounded-xl">
                          <span>{u.full_name} ({u.role})</span>
                          <span className="text-emerald-400">₹{u.wallet_balance || 0}</span>
                          <button onClick={() => adjustWallet(u._id, 200, 'credit')} className="text-[10px] underline">+200</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                    <div className="font-medium mb-3 text-white">Recent Consultations</div>
                    <div className="text-xs space-y-1.5 max-h-52 overflow-auto">
                      {consultations.slice(0, 5).map((c: any) => (
                        <div key={c._id} className="flex justify-between px-2 py-1 bg-slate-950 rounded">
                          <span>{c.user_id?.full_name || 'User'} → {c.astrologer_id?.full_name}</span>
                          <span className="text-amber-400">₹{c.total_amount} • {c.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-xs text-slate-500 text-center">
                  Tip: All sensitive actions are permanently logged for audit. • Data auto-refreshes on actions.
                </div>
              </>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
                <h2 className="text-2xl font-semibold mb-2 text-white">Section under construction</h2>
                <p className="text-slate-400">This admin feature will be implemented soon.</p>
                <Link to="/admin" className="mt-4 inline-block text-sm text-red-400 hover:text-red-300">Return to Overview →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
