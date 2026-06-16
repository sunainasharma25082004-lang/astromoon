import { useEffect, useState } from 'react';
import { DollarSign, ArrowDownLeft } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

export default function AstroEarnings() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!token) return;
    Promise.all([
      apiFetch('/astrologers/earnings/summary', {}, token),
      apiFetch('/withdrawals/my', {}, token),
    ]).then(([s, w]) => { setSummary(s); setWithdrawals(w); }).catch(() => {});
  };

  useRealtimeData(load, ['earnings', 'withdrawals'], [token]);

  const requestWithdrawal = async () => {
    const amt = parseInt(amount);
    if (!amt || amt < 100) { toast.error('Minimum withdrawal is ₹100'); return; }
    setLoading(true);
    try {
      await apiFetch('/withdrawals', { method: 'POST', body: JSON.stringify({ amount: amt, method: 'bank', account_details: { demo: true } }) }, token);
      toast.success('Withdrawal requested!');
      setAmount('');
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-500 text-sm">Income &amp; withdrawals</p>
        </div>
      </div>

      {summary && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Earnings', value: formatCurrency(summary.total_earnings || 0) },
            { label: 'Withdrawable Now', value: formatCurrency(summary.withdrawable_balance || 0), hint: `Unlocks after ${summary.hold_days || 7} days` },
            { label: 'Pending (7-day hold)', value: formatCurrency(summary.pending_earnings || 0) },
            { label: 'Wallet Balance', value: formatCurrency(summary.wallet_balance || 0) },
            { label: 'This Month', value: formatCurrency(summary.monthly || 0) },
            { label: 'Today', value: formatCurrency(summary.daily || 0) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-amber-100 p-4">
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{s.value}</div>
              {'hint' in s && s.hint && <div className="text-[10px] text-gray-400 mt-1">{s.hint}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-amber-100 p-5 mb-6">
        <h3 className="font-semibold mb-1">Request Withdrawal</h3>
        <p className="text-xs text-gray-500 mb-3">
          Only earnings older than {summary?.hold_days || 7} days can be withdrawn. Available: {formatCurrency(summary?.withdrawable_balance || 0)}
        </p>
        <div className="flex gap-3">
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (min ₹100)" className="flex-1 border rounded-xl px-4 py-2.5 text-sm" min={100} />
          <button onClick={requestWithdrawal} disabled={loading} className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 disabled:opacity-60">
            {loading ? '...' : 'Withdraw'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
        <div className="p-4 border-b border-amber-50 font-semibold text-sm">Withdrawal History</div>
        {withdrawals.length === 0 ? <div className="p-8 text-center text-gray-500 text-sm">No withdrawals yet</div> : (
          <div className="divide-y divide-amber-50">
            {withdrawals.map((w: any) => (
              <div key={w._id} className="p-4 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2"><ArrowDownLeft className="w-4 h-4 text-emerald-600" />{formatCurrency(w.amount)}</div>
                <span className="capitalize text-gray-500">{w.status}</span>
                <span className="text-xs text-gray-400">{formatDate(w.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}