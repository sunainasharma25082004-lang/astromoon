import express from 'express';
import Coupon from '../models/Coupon.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/validate', protect, async (req, res) => {
  try {
    const { code, amount = 0 } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase(), is_active: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });

    const now = new Date();
    if (now < coupon.valid_from || now > coupon.valid_until) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }
    if (coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }
    if (amount < coupon.min_order_value) {
      return res.status(400).json({ message: `Minimum order value is ₹${coupon.min_order_value}` });
    }

    let discount = coupon.type === 'percentage'
      ? (amount * coupon.value) / 100
      : coupon.value;
    if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);

    res.json({ valid: true, coupon, discount: Math.round(discount * 100) / 100 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(coupon);
});

export default router;