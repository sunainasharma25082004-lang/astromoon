import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, ShoppingBag, Package, DollarSign, BarChart3, Shield, Settings, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { useSocket } from '../../context/SocketContext';

const sidebar = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Astrologers', path: '/admin/astrologers', icon: UserCheck },
  { label: 'Shop Products', path: '/admin/products', icon: ShoppingBag },
  { label: 'Shop Orders', path: '/admin/orders', icon: Package },
  { label: 'Transactions', path: '/admin/transactions', icon: DollarSign },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Moderation', path: '/admin/moderation', icon: Shield },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminPanelLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { connected } = useSocket();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/15 border border-red-500/30 rounded-lg flex items-center justify-center"><Lock className="w-4 h-4 text-red-400" /></div>
            <span className="font-semibold text-white text-sm">Admin Panel</span>
            <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">ADMIN</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${connected ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-slate-600 text-slate-500'}`}>
              {connected ? '● LIVE' : '○ offline'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400 text-xs hidden sm:block">{user?.full_name}</span>
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded border border-slate-700">View Site</Link>
            <button onClick={async () => { await signOut(); navigate('/'); }} className="p-1.5 hover:bg-slate-800 rounded-lg"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden sticky top-20">
              <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                <div><div className="font-semibold text-white text-sm">{user?.full_name}</div><div className="text-[10px] text-slate-500">Full Access</div></div>
              </div>
              <nav className="p-2 text-sm">
                {sidebar.map(item => (
                  <Link key={item.path} to={item.path} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 transition ${location.pathname === item.path ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-950 hover:text-slate-200'}`}>
                    <item.icon className="w-4 h-4" />{item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          <main className="lg:col-span-4"><Outlet /></main>
        </div>
      </div>
    </div>
  );
}