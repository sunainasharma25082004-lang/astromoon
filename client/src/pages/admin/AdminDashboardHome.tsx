import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Plus, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';

export default function AdminDashboardHome() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  const loadAdminData = async () => {
    if (!token) return;
    try {
      const [p, o, a] = await Promise.all([
        apiFetch('/products/admin/all', {}, token),
        apiFetch('/admin/orders', {}, token),
        apiFetch('/admin/applications?status=pending', {}, token),
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);
      setApplications(Array.isArray(a) ? a : []);
    } catch {}
  };

  useRealtimeData(loadAdminData, ['orders', 'applications'], [token]);

  const activeProducts = products.filter((p: any) => p.is_active !== false).length;
  const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'processing').length;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Shop Overview</h1>
          <p className="text-slate-400 text-sm">Manage products & track orders • {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <ShoppingBag className="w-5 h-5 text-amber-400 mb-3" />
          <div className="text-3xl font-semibold text-white">{products.length}</div>
          <div className="text-sm text-slate-400">Total Products</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <Package className="w-5 h-5 text-emerald-400 mb-3" />
          <div className="text-3xl font-semibold text-white">{activeProducts}</div>
          <div className="text-sm text-slate-400">Active Products</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <ShoppingBag className="w-5 h-5 text-sky-400 mb-3" />
          <div className="text-3xl font-semibold text-white">{orders.length}</div>
          <div className="text-sm text-slate-400">Total Orders</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <Package className="w-5 h-5 text-orange-400 mb-3" />
          <div className="text-3xl font-semibold text-white">{pendingOrders}</div>
          <div className="text-sm text-slate-400">Pending Orders</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <Link to="/admin/products" className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
            <Plus className="w-5 h-5 text-slate-500" />
          </div>
          <div className="font-medium text-white text-lg">Manage Products</div>
          <div className="text-xs text-slate-400 mt-1">Add, edit & upload shop products</div>
        </Link>
        <Link to="/admin/orders" className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-6 h-6 text-sky-400" />
            <ArrowRight className="w-5 h-5 text-slate-500" />
          </div>
          <div className="font-medium text-white text-lg">Shop Orders</div>
          <div className="text-xs text-slate-400 mt-1">View & update customer orders</div>
        </Link>
        <Link to="/admin/applications" className="block bg-slate-900 border border-slate-800 hover:border-violet-700/50 rounded-2xl p-6 transition">
          <div className="flex items-center justify-between mb-4">
            <UserCheck className="w-6 h-6 text-violet-400" />
            {applications.length > 0 && <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">{applications.length} new</span>}
          </div>
          <div className="font-medium text-white text-lg">Astrologer Applications</div>
          <div className="text-xs text-slate-400 mt-1">Review become-astrologer forms</div>
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="font-medium mb-3 text-white text-sm flex justify-between">
          <span>Recent Shop Orders</span>
          <Link to="/admin/orders" className="text-xs text-sky-400">View all</Link>
        </div>
        <div className="text-xs space-y-1.5 max-h-48 overflow-auto">
          {orders.slice(0, 6).map((o: any) => (
            <div key={o._id} className="flex justify-between px-2 py-1.5 bg-slate-950 rounded-lg text-slate-400">
              <span>{o.user_id?.full_name || 'User'}</span>
              <span className="capitalize">{o.status}</span>
              <span className="text-emerald-400">₹{o.total}</span>
            </div>
          ))}
          {orders.length === 0 && <div className="text-slate-500 text-center py-4">No orders yet</div>}
        </div>
      </div>
    </>
  );
}