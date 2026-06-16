import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, ShoppingBag, Heart, Users, Download } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { AppDownloadCTA } from '../../components/common/AppDownloadCTA';
import { APP_PLAY_STORE_URL } from '../../constants';

export default function UserDashboardHome() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  const wallet = user?.wallet_balance || 0;

  const loadOrders = async () => {
    if (!token) return;
    try {
      const data = await apiFetch('/orders/my', {}, token);
      setOrders(data);
    } catch {}
  };

  useRealtimeData(loadOrders, 'orders', [token]);

  const stats = [
    { label: 'Wallet Balance', value: `₹${Math.floor(wallet)}`, icon: Wallet, color: 'bg-sky-100 text-sky-600', path: '/wallet' },
    { label: 'Shop Orders', value: orders.length.toString(), icon: ShoppingBag, color: 'bg-amber-100 text-amber-600', path: '/dashboard/orders' },
    { label: 'Saved Astrologers', value: JSON.parse(localStorage.getItem('celestial_saved_astrologers') || '[]').length.toString(), icon: Heart, color: 'bg-rose-100 text-rose-600', path: '/dashboard/saved' },
  ];

  return (
    <>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Welcome, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account, shop orders & saved astrologers</p>
        </div>
        <Link to="/astrologers" className="text-sm px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-medium">
          Browse Astrologers →
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.path}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm border border-sky-100 p-5 hover:shadow-md transition">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-sky-50">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-sm text-sky-600 font-medium">View All</Link>
          </div>
          <div className="divide-y divide-sky-50">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No orders yet. <Link to="/shop" className="text-sky-600 font-medium">Visit the shop</Link>
              </div>
            ) : (
              orders.slice(0, 3).map((o: any) => (
                <div key={o._id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{(o.items || []).length} item(s)</div>
                    <div className="text-xs text-gray-500 capitalize">{o.status}</div>
                  </div>
                  <div className="font-semibold text-sm text-emerald-600">₹{o.total}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <AppDownloadCTA subtitle="Chat, audio call & video consultations are available in our mobile app — not on the website." />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/astrologers" className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl p-5 text-white hover:shadow-lg transition">
          <Users className="w-6 h-6 mb-2 opacity-80" />
          <h3 className="font-semibold mb-1">Explore Astrologers</h3>
          <p className="text-white/80 text-sm">Read profiles, reviews & expertise details</p>
        </Link>
        <a href={APP_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-5 text-white hover:shadow-lg transition">
          <Download className="w-6 h-6 mb-2 opacity-80" />
          <h3 className="font-semibold mb-1">Download App</h3>
          <p className="text-white/80 text-sm">For live chat, call & video consultations</p>
        </a>
      </div>
    </>
  );
}