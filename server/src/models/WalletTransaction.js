import mongoose from 'mongoose';

const walletTxSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit', 'refund'], required: true },
  amount: { type: Number, required: true },
  balance_after: Number,
  reference_type: { type: String, enum: ['recharge', 'consultation', 'refund', 'order', 'referral', 'withdrawal', 'coupon'], default: 'consultation' },
  description: String,
  status: { type: String, default: 'completed' },
  payment_id: String,
  payment_method: String,
  razorpay_order_id: String,
}, { timestamps: true });

export default mongoose.model('WalletTransaction', walletTxSchema);