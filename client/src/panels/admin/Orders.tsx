import { useState } from 'react';
import { Package } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { formatDate } from '../../utils/dateUtils';

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!token) return;
    apiFetch('/admin/orders', {}, token)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useRealtimeData(load, 'orders', [token]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 text-sky-400 rounded-xl flex items-center justify-center border border-slate-700">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Shop Orders</h1>
          <p className="text-slate-400 text-sm">{orders.length} orders from users</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No orders yet.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {orders.map((o: any) => (
              <div key={o._id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-white text-sm">{o.user_id?.full_name || 'User'}</div>
                    <div className="text-xs text-slate-500">{o.user_id?.email} • {formatDate(o.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-400">₹{o.total}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{o.status}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  {(o.items || []).map((item: any, i: number) => (
                    <span key={i}>{item.name || item.product_name} × {item.quantity || 1}{i < o.items.length - 1 ? ' • ' : ''}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}