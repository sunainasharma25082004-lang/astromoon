import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { formatCurrency } from '../../utils/dateUtils';

export default function AdminReports() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (token) apiFetch('/admin/stats', {}, token).then(setStats).catch(() => {});
  }, [token]);

  if (!stats) return <div className="text-slate-500 p-10 text-center">Loading reports...</div>;

  const cards = [
    { label: 'Users (30d growth)', value: `+${stats.userGrowth30d}` },
    { label: 'Astrologers (30d)', value: `+${stats.astroGrowth30d}` },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue || 0) },
    { label: 'Platform Commission', value: formatCurrency(stats.platformCommission || 0) },
    { label: 'Total Recharges', value: formatCurrency(stats.totalRecharges || 0) },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals },
    { label: 'Online Astrologers', value: stats.onlineAstrologers },
    { label: 'Pending Approvals', value: stats.pendingApprovals },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 text-blue-400 rounded-xl flex items-center justify-center border border-slate-700"><BarChart3 className="w-5 h-5" /></div>
        <div><h1 className="text-2xl font-semibold text-white">Reports</h1><p className="text-slate-400 text-sm">Platform analytics</p></div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-xs text-slate-500 mb-2">{c.label}</div>
            <div className="text-2xl font-semibold text-white">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}