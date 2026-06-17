import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Star, Download, ArrowRight, Package, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { AppDownloadCTA } from '../../components/common/AppDownloadCTA';
import { APP_PLAY_STORE_URL } from '../../constants';
import { PanelCard } from '../../components/user/PageHeader';

export default function UserDashboardHome() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  const loadOrders = async () => {
    if (!token) return;
    try {
      const data = await apiFetch('/orders/my', {}, token);
      setOrders(data);
    } catch {}
  };

  useRealtimeData(loadOrders, 'orders', [token]);

  const savedCount = JSON.parse(localStorage.getItem('celestial_saved_astrologers') || '[]').length;

  const stats = [
    { label: 'Shop Orders', value: orders.length, icon: ShoppingBag, gradient: 'from-amber-500 to-orange-500', path: '/dashboard/orders' },
    { label: 'Saved Astrologers', value: savedCount, icon: Heart, gradient: 'from-rose-500 to-pink-500', path: '/dashboard/saved' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 p-6 sm:p-8 text-white shadow-xl shadow-violet-200/40"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-violet-200 text-sm font-medium mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" /> Welcome back
            </p>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">
              {user?.full_name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-white/75 text-sm mt-2 max-w-md">
              Manage orders, saved astrologers & apply to join as an astrologer on Astro Star.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-violet-700 font-semibold rounded-xl hover:bg-violet-50 transition shadow-lg shrink-0"
          >
            Visit Shop <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <Link key={stat.label} to={stat.path}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-lg hover:border-violet-200 transition-all"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Become astrologer CTA */}
      <Link to="/become-astrologer" className="block group">
        <div className="relative overflow-hidden rounded-2xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-5 sm:p-6 hover:border-violet-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <Star className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900">Become an Astrologer</h3>
                <p className="text-sm text-slate-600 mt-0.5">Apply now — admin will review your profile</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-violet-600 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </div>
      </Link>

      <div className="grid lg:grid-cols-2 gap-6">
        <PanelCard>
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-violet-600" /> Recent Orders
            </h2>
            <Link to="/dashboard/orders" className="text-sm text-violet-600 font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No orders yet.{' '}
                <Link to="/shop" className="text-violet-600 font-semibold hover:underline">Browse shop</Link>
              </div>
            ) : (
              orders.slice(0, 4).map((o: any) => (
                <div key={o._id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                  <div>
                    <div className="font-medium text-sm text-slate-800">{(o.items || []).length} item(s)</div>
                    <div className="text-xs text-slate-400 capitalize mt-0.5">{o.status}</div>
                  </div>
                  <div className="font-bold text-sm text-emerald-600">₹{o.total}</div>
                </div>
              ))
            )}
          </div>
        </PanelCard>

        <AppDownloadCTA subtitle="Live chat, call & video with astrologers — available in our mobile app." />
      </div>

      <a
        href={APP_PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg transition group"
      >
        <Download className="w-8 h-8 opacity-90 group-hover:scale-110 transition-transform" />
        <div>
          <h3 className="font-semibold">Download Astro Star App</h3>
          <p className="text-white/80 text-sm">For live consultations with astrologers</p>
        </div>
        <ArrowRight className="w-5 h-5 ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  );
}