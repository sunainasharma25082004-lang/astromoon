import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { PageHeader, PanelCard } from '../../components/user/PageHeader';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-100',
  shipped: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-red-50 text-red-700 border-red-100',
};

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
      <PageHeader
        icon={ShoppingBag}
        title="My Orders"
        subtitle="Your spiritual shop purchase history"
      />

      <PanelCard className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-violet-400" />
            </div>
            <p className="text-slate-600 font-medium mb-1">No orders yet</p>
            <p className="text-slate-400 text-sm mb-5">Browse our spiritual products and place your first order.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition"
            >
              Visit Shop <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((o: any) => (
              <div key={o._id} className="p-5 flex justify-between items-center hover:bg-slate-50/60 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-800">
                      {o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{formatDate(o.createdAt)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatCurrency(o.total)}</div>
                  <span className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize ${statusStyles[o.status] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}