import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referred_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referral_code: { type: String, required: true },
  bonus_amount: { type: Number, default: 50 },
  status: { type: String, enum: ['pending', 'credited'], default: 'credited' },
}, { timestamps: true });

export default mongoose.model('Referral', referralSchema);