import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import PlatformSettings from '../models/PlatformSettings.js';
import { protect } from '../middleware/auth.js';
import { createNotification } from '../utils/helpers.js';
import { emitPanelUpdate, RESOURCES } from '../utils/realtime.js';

const router = express.Router();

router.post('/recharge', protect, async (req, res) => {
  try {
    const { amount, payment_method = 'demo', payment_id, coupon_code } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    let creditAmount = Number(amount);
    let couponDiscount = 0;

    if (coupon_code) {
      const coupon = await Coupon.findOne({ code: coupon_code.toUpperCase(), is_active: true });
      if (coupon) {
        couponDiscount = coupon.type === 'percentage'
          ? (creditAmount * coupon.value) / 100
          : coupon.value;
        if (coupon.max_discount) couponDiscount = Math.min(couponDiscount, coupon.max_discount);
        coupon.used_count += 1;
        await coupon.save();
      }
    }

    const totalCredit = creditAmount + couponDiscount;
    const user = await User.findById(req.user._id);
    const newBalance = (user.wallet_balance || 0) + totalCredit;

    user.wallet_balance = newBalance;
    await user.save();

    await WalletTransaction.create({
      user_id: user._id,
      type: 'credit',
      amount: totalCredit,
      balance_after: newBalance,
      reference_type: coupon_code ? 'coupon' : 'recharge',
      payment_method,
      payment_id,
      description: coupon_code
        ? `Wallet recharge ₹${creditAmount} + coupon bonus ₹${couponDiscount}`
        : `Wallet recharge via ${payment_method}`,
    });

    await createNotification(Notification, user._id, {
      title: 'Wallet Recharged',
      message: `₹${totalCredit} added to your wallet. New balance: ₹${newBalance}`,
      type: 'wallet',
      action_url: '/wallet',
    });

    const io = req.app.get('io');
    if (io) {
      emitPanelUpdate(io, {
        resource: RESOURCES.WALLET,
        userIds: [user._id],
        admin: true,
        payload: { wallet_balance: newBalance },
      });
      emitPanelUpdate(io, { resource: RESOURCES.TRANSACTIONS, userIds: [user._id], admin: true });
      emitPanelUpdate(io, {
        resource: RESOURCES.NOTIFICATIONS,
        userIds: [user._id],
        payload: { title: 'Wallet Recharged', message: `₹${totalCredit} added` },
      });
      emitPanelUpdate(io, { resource: RESOURCES.STATS, admin: true });
    }

    res.json({ success: true, new_balance: newBalance, credited: totalCredit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/razorpay/create-order', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    const settings = await PlatformSettings.getSettings();
    const keyId = settings.razorpay_key_id || process.env.RAZORPAY_KEY_ID;

    if (!keyId) {
      const orderId = `order_demo_${Date.now()}`;
      return res.json({
        order_id: orderId,
        amount: amount * 100,
        currency: 'INR',
        key_id: 'demo',
        demo_mode: true,
      });
    }

    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    res.json({
      order_id: orderId,
      amount: amount * 100,
      currency: 'INR',
      key_id: keyId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const settings = await PlatformSettings.getSettings();
    const secret = settings.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET;

    if (secret && razorpay_signature) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
      if (expected !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }

    const user = await User.findById(req.user._id);
    const newBalance = (user.wallet_balance || 0) + Number(amount);
    user.wallet_balance = newBalance;
    await user.save();

    await WalletTransaction.create({
      user_id: user._id,
      type: 'credit',
      amount: Number(amount),
      balance_after: newBalance,
      reference_type: 'recharge',
      payment_method: 'razorpay',
      payment_id: razorpay_payment_id,
      razorpay_order_id,
      description: 'Razorpay wallet recharge',
    });

    res.json({ success: true, new_balance: newBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/transactions', protect, async (req, res) => {
  try {
    const txs = await WalletTransaction.find({ user_id: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(txs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;