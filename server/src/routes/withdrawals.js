import express from 'express';
import Withdrawal from '../models/Withdrawal.js';
import Astrologer from '../models/Astrologer.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';
import { createNotification } from '../utils/helpers.js';
import { getAstrologerEarningsBreakdown } from '../utils/astroEarnings.js';
import { emitPanelUpdate, RESOURCES } from '../utils/realtime.js';

const router = express.Router();

router.post('/', protect, authorize('astrologer'), async (req, res) => {
  try {
    const { amount, method, account_details } = req.body;
    const astro = await Astrologer.findById(req.user.astrologer_profile_id);
    if (!astro) return res.status(404).json({ message: 'Astrologer profile not found' });
    if (amount < 100) return res.status(400).json({ message: 'Minimum withdrawal is ₹100' });

    const breakdown = await getAstrologerEarningsBreakdown(astro._id);
    if (amount > breakdown.withdrawable_balance) {
      return res.status(400).json({
        message: `Only ₹${breakdown.withdrawable_balance} available. Earnings unlock after ${breakdown.hold_days} days.`,
        withdrawable_balance: breakdown.withdrawable_balance,
        pending_earnings: breakdown.pending_earnings,
        hold_days: breakdown.hold_days,
      });
    }

    const withdrawal = await Withdrawal.create({
      astrologer_id: astro._id,
      user_id: req.user._id,
      amount,
      method,
      account_details,
    });

    await createNotification(Notification, req.user._id, {
      title: 'Withdrawal Requested',
      message: `Your withdrawal of ₹${amount} is being processed.`,
      type: 'withdrawal',
    });

    const io = req.app.get('io');
    if (io) {
      emitPanelUpdate(io, {
        resource: RESOURCES.WITHDRAWALS,
        userIds: [req.user._id],
        astroIds: [astro._id],
        admin: true,
      });
      emitPanelUpdate(io, { resource: RESOURCES.EARNINGS, astroIds: [astro._id] });
      emitPanelUpdate(io, {
        resource: RESOURCES.NOTIFICATIONS,
        userIds: [req.user._id],
        payload: { title: 'Withdrawal Requested', message: `₹${amount} processing` },
      });
    }

    res.status(201).json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my', protect, authorize('astrologer'), async (req, res) => {
  const withdrawals = await Withdrawal.find({ user_id: req.user._id }).sort({ createdAt: -1 });
  res.json(withdrawals);
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  const withdrawals = await Withdrawal.find()
    .populate('user_id', 'full_name email')
    .populate('astrologer_id', 'full_name')
    .sort({ createdAt: -1 });
  res.json(withdrawals);
});

router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  const { status, admin_note } = req.body;
  const withdrawal = await Withdrawal.findByIdAndUpdate(
    req.params.id,
    { status, admin_note, processed_at: status === 'completed' ? new Date() : undefined },
    { new: true }
  );
  if (withdrawal?.user_id) {
    await createNotification(Notification, withdrawal.user_id, {
      title: 'Withdrawal Update',
      message: `Your withdrawal of ₹${withdrawal.amount} is now ${status}.`,
      type: 'withdrawal',
    });
  }
  const io = req.app.get('io');
  if (io && withdrawal) {
    emitPanelUpdate(io, {
      resource: RESOURCES.WITHDRAWALS,
      userIds: [withdrawal.user_id],
      astroIds: withdrawal.astrologer_id ? [withdrawal.astrologer_id] : [],
      admin: true,
    });
    emitPanelUpdate(io, { resource: RESOURCES.EARNINGS, astroIds: withdrawal.astrologer_id ? [withdrawal.astrologer_id] : [] });
  }
  res.json(withdrawal);
});

export default router;