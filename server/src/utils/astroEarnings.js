import Consultation from '../models/Consultation.js';
import Withdrawal from '../models/Withdrawal.js';

const HOLD_DAYS = 7;

export async function getAstrologerEarningsBreakdown(astrologerId) {
  const holdMs = HOLD_DAYS * 24 * 60 * 60 * 1000;
  const holdCutoff = new Date(Date.now() - holdMs);

  const completed = await Consultation.find({
    astrologer_id: astrologerId,
    status: 'completed',
  }).select('astro_earnings ended_at createdAt');

  let totalEarned = 0;
  let withdrawable = 0;
  let pending = 0;

  for (const c of completed) {
    const amt = c.astro_earnings || 0;
    totalEarned += amt;
    const ended = c.ended_at || c.createdAt;
    if (ended && new Date(ended) <= holdCutoff) {
      withdrawable += amt;
    } else {
      pending += amt;
    }
  }

  const withdrawnAgg = await Withdrawal.aggregate([
    { $match: { astrologer_id: astrologerId, status: { $in: ['pending', 'processing', 'completed'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const alreadyWithdrawn = withdrawnAgg[0]?.total || 0;
  const availableToWithdraw = Math.max(0, withdrawable - alreadyWithdrawn);

  return {
    total_earned: totalEarned,
    pending_earnings: pending,
    withdrawable_balance: availableToWithdraw,
    already_withdrawn: alreadyWithdrawn,
    hold_days: HOLD_DAYS,
  };
}