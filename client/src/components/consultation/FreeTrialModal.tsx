import { useState } from 'react';
import { MessageCircle, Phone, Video, Wallet, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { API_BASE } from '../../config/api';
import toast from 'react-hot-toast';

interface Props {
  consultationId: string;
  type: 'chat' | 'call' | 'video';
  rate: number;
  advanceAmount: number;
  onContinue: () => void;
  onClose: () => void;
}

export default function FreeTrialModal({ consultationId, type, rate, advanceAmount, onContinue, onClose }: Props) {
  const { token, user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const typeLabel = type === 'chat' ? 'Chat' : type === 'call' ? 'Audio Call' : 'Video Call';
  const TypeIcon = type === 'chat' ? MessageCircle : type === 'call' ? Phone : Video;
  const walletBal = user?.wallet_balance ?? 0;
  const needsRecharge = walletBal < advanceAmount;

  const handleDummyPayment = async () => {
    setLoading(true);
    try {
      if (needsRecharge) {
        const rechargeAmount = advanceAmount - walletBal;
        const rechargeRes = await fetch(`${API_BASE}/wallet/recharge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ amount: rechargeAmount, payment_method: 'demo_razorpay' }),
        });
        const rechargeData = await rechargeRes.json();
        if (!rechargeRes.ok) throw new Error(rechargeData.message || 'Payment failed');
        toast.success(`Demo payment successful! ₹${rechargeAmount} added to wallet`);
      }

      const resumeRes = await fetch(`${API_BASE}/consultations/${consultationId}/resume`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ advance_amount: advanceAmount }),
      });
      const resumeData = await resumeRes.json();
      if (!resumeRes.ok) throw new Error(resumeData.message || 'Could not resume session');

      await refreshUser();
      toast.success(`₹${advanceAmount} advance paid. ${typeLabel} session resumed!`);
      onContinue();
    } catch (e: any) {
      toast.error(e.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-2">5 Min Free Ended!</h2>
        <p className="text-gray-600 mb-2">Your free consultation time is over.</p>
        <p className="text-gray-500 text-sm mb-6">
          Pay <strong>₹{advanceAmount}</strong> (5 min advance at ₹{rate}/min) to continue your <strong>{typeLabel}</strong>.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Your wallet balance</span>
            <span className="font-semibold">₹{walletBal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Required advance (5 min)</span>
            <span className="font-semibold text-amber-600">₹{advanceAmount}</span>
          </div>
          {needsRecharge && (
            <div className="mt-2 text-xs text-amber-600">
              ₹{advanceAmount - walletBal} will be added via demo payment
            </div>
          )}
        </div>

        <button
          onClick={handleDummyPayment}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold mb-3 disabled:opacity-60"
        >
          <CreditCard className="w-4 h-4" />
          {loading ? 'Processing...' : `Pay ₹${advanceAmount} (Demo Payment)`}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-4">
          <TypeIcon className="w-3.5 h-3.5" />
          Continue same {typeLabel} session — no mode change
        </div>

        <button onClick={onClose} className="text-gray-400 text-sm hover:underline">End Session</button>
      </div>
    </div>
  );
}