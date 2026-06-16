import mongoose from 'mongoose';

const otpSessionSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expires_at: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
}, { timestamps: true });

otpSessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('OtpSession', otpSessionSchema);