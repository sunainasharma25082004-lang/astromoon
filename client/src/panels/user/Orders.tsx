import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { formatCurrency, formatDate } from '../../utils/dateUtils';

export default function UserOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!token) return;
    apiFetch('/orders/my', {}, token)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useRealtimeData(load, 'orders', [token]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center"><ShoppingBag className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 text-sm">Shop purchases from your wallet</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
        {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : orders.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">No orders yet. <Link to="/shop" className="text-sky-600 font-medium">Visit Shop →</Link></div>
        ) : (
          <div className="divide-y divide-sky-50">
            {orders.map((o: any) => (
              <div key={o._id} className="p-5 flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">{o.items?.length || 0} item(s)</div>
                  <div className="text-xs text-gray-500">{formatDate(o.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(o.total)}</div>
                  <div className="text-xs capitalize text-emerald-600">{o.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}