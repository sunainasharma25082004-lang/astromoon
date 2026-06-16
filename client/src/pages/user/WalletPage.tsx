import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, History, Gift, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { useAuth } from '../../context/Auth';
import { apiFetch } from '../../config/api';
import { useRealtimeData } from '../../hooks/useRealtimeData';
import toast from 'react-hot-toast';

const quickAmounts = [100, 200, 500, 1000];

export default function WalletPage() {
  const { user, token, refreshUser } = useAuth();
  const [showRecharge, setShowRecharge] = useState(false);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const walletBalance = user?.wallet_balance ?? 0;

  const loadTransactions = () => {
    if (!token) return;
    apiFetch('/wallet/transactions', {}, token)
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useRealtimeData(loadTransactions, ['wallet', 'transactions'], [token]);

  const handleRecharge = async () => {
    if (!amount) return;
    setIsLoading(true);
    try {
      const data = await apiFetch('/wallet/recharge', {
        method: 'POST',
        body: JSON.stringify({ amount: parseInt(amount), payment_method: 'demo_razorpay' }),
      }, token);
      await refreshUser();
      toast.success(`₹${data.credited || amount} added to wallet (Demo Payment)`);
      setShowRecharge(false);
      setAmount('');
    } catch {
      toast.error('Recharge failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">Wallet</h1>
        <p className="text-gray-500 text-sm">Manage balance — demo payment active (Razorpay keys pending)</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-sky-500 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative">
          <div className="flex items-center mb-4">
            <Wallet className="w-6 h-6 mr-2" />
            <span className="text-white/80">Available Balance</span>
          </div>
          <div className="text-4xl font-bold mb-6">{formatCurrency(walletBalance)}</div>
          <Button variant="gold" onClick={() => setShowRecharge(true)} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Add Money (Demo)
          </Button>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-amber-50 rounded-xl p-4 flex items-center border border-amber-100">
          <Gift className="w-8 h-8 text-amber-500 mr-3" />
          <div>
            <div className="font-semibold text-gray-900">Sign-up Bonus</div>
            <div className="text-sm text-gray-600">₹100 on registration</div>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 flex items-center border border-green-100">
          <ShieldCheck className="w-8 h-8 text-green-500 mr-3" />
          <div>
            <div className="font-semibold text-gray-900">Demo Payment</div>
            <div className="text-sm text-gray-600">No real charge — admin will add Razorpay keys</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-sky-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <History className="w-5 h-5 mr-2" />
            Transaction History
          </h2>
        </div>
        <div className="divide-y divide-sky-50">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No transactions yet. Recharge your wallet to get started.</div>
          ) : (
            transactions.map((tx: any) => (
              <div key={tx._id} className="p-5 flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{tx.description}</h3>
                  <div className="text-xs text-gray-500">{formatDate(tx.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  <div className="text-xs text-gray-500">Bal: {formatCurrency(tx.balance_after)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showRecharge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRecharge(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Add Money to Wallet</h2>
            <p className="text-xs text-amber-600 mb-4">Demo mode — no real payment charged</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {quickAmounts.map((amt) => (
                <button key={amt} onClick={() => setAmount(amt.toString())} className={`py-3 rounded-xl font-medium text-sm transition ${amount === amt.toString() ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {formatCurrency(amt)}
                </button>
              ))}
            </div>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-lg font-medium focus:outline-none focus:border-sky-500" min={10} />
            </div>
            <Button variant="cosmic" size="lg" className="w-full" onClick={handleRecharge} disabled={!amount || parseInt(amount) < 10} isLoading={isLoading}>
              <CreditCard className="w-5 h-5 mr-2" />
              Pay ₹{amount || '0'} (Demo)
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}