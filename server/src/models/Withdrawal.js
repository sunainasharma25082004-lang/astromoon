import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  astrologer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['bank', 'upi'], required: true },
  account_details: {
    account_number: String,
    ifsc: String,
    bank_name: String,
    upi_id: String,
    account_holder: String,
  },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected'], default: 'pending' },
  admin_note: String,
  processed_at: Date,
}, { timestamps: true });

export default mongoose.model('Withdrawal', withdrawalSchema);