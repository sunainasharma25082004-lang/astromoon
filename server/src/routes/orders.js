import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { protect } from '../middleware/auth.js';
import { emitPanelUpdate, RESOURCES } from '../utils/realtime.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { items, total } = req.body;
    if (!items || !total) return res.status(400).json({ message: 'Invalid order' });

    const user = await User.findById(req.user._id);

    // Optional: deduct wallet for shop purchase (or keep separate payment)
    // For now we allow and log as order
    const newBalance = Math.max(0, (user.wallet_balance || 0) - total);
    user.wallet_balance = newBalance;
    await user.save();

    await WalletTransaction.create({
      user_id: user._id,
      type: 'debit',
      amount: total,
      balance_after: newBalance,
      reference_type: 'order',
      description: `Shop order - ${items.length} item(s)`
    });

    const order = await Order.create({
      user_id: user._id,
      items,
      total,
      status: 'completed'
    });

    const io = req.app.get('io');
    if (io) {
      emitPanelUpdate(io, {
        resource: RESOURCES.ORDERS,
        userIds: [user._id],
        admin: true,
      });
      emitPanelUpdate(io, {
        resource: RESOURCES.WALLET,
        userIds: [user._id],
        payload: { wallet_balance: newBalance },
      });
      emitPanelUpdate(io, { resource: RESOURCES.TRANSACTIONS, userIds: [user._id], admin: true });
    }

    res.status(201).json({ success: true, order, new_balance: newBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
