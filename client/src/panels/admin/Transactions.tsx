import { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import { formatCurrency, formatDate } from '../../utils/dateUtils';

export default function AdminTransactions() {
  const { token } = useAuth();
  const [txs, setTxs] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const load = () => {
    if (!token) return;
    Promise.all([
      apiFetch('/admin/transactions', {}, token),
      apiFetch('/admin/withdrawals', {}, token),
    ]).then(([t, w]) => { setTxs(t); setWithdrawals(w); }).catch(() => {});
  };

  useRealtimeData(load, ['transactions', 'withdrawals', 'wallet'], [token]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 text-emerald-400 rounded-xl flex items-center justify-center border border-slate-700"><DollarSign className="w-5 h-5" /></div>
        <div><h1 className="text-2xl font-semibold text-white">Financials</h1><p className="text-slate-400 text-sm">Transactions &amp; payouts</p></div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl mb-6 overflow-hidden">
        <div className="p-4 border-b border-slate-800 font-medium text-white text-sm">Wallet Transactions</div>
        <div className="divide-y divide-slate-800 max-h-80 overflow-auto">
          {txs.map((t: any) => (
            <div key={t._id} className="p-3 flex justify-between text-xs">
              <span className="text-slate-400">{t.user_id?.full_name || 'User'} — {t.description}</span>
              <span className={t.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}>{t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}</span>
              <span className="text-slate-600">{formatDate(t.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 font-medium text-white text-sm">Withdrawal Requests</div>
        <div className="divide-y divide-slate-800">
          {withdrawals.length === 0 ? <div className="p-8 text-center text-slate-500 text-sm">No pending withdrawals</div> : withdrawals.map((w: any) => (
            <div key={w._id} className="p-3 flex justify-between text-xs items-center">
              <span className="text-slate-300">{w.astrologer_id?.full_name || w.user_id?.full_name}</span>
              <span className="text-amber-400">{formatCurrency(w.amount)}</span>
              <span className="capitalize text-slate-500">{w.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}