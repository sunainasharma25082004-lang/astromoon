import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  value: { type: Number, required: true },
  min_order_value: { type: Number, default: 0 },
  max_discount: Number,
  usage_limit: { type: Number, default: 100 },
  used_count: { type: Number, default: 0 },
  valid_from: { type: Date, default: Date.now },
  valid_until: { type: Date, required: true },
  is_active: { type: Boolean, default: true },
  applicable_to: { type: String, enum: ['wallet', 'order', 'all'], default: 'all' },
}, { timestamps: true });

export default mongoose.model('Coupon', couponSchema);