import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  free_trial_minutes: { type: Number, default: 5 },
  platform_commission_percent: { type: Number, default: 30 },
  min_chat_price: { type: Number, default: 5 },
  max_chat_price: { type: Number, default: 100 },
  min_audio_price: { type: Number, default: 10 },
  max_audio_price: { type: Number, default: 150 },
  min_video_price: { type: Number, default: 15 },
  max_video_price: { type: Number, default: 200 },
  referral_bonus: { type: Number, default: 50 },
  signup_bonus: { type: Number, default: 100 },
  razorpay_key_id: String,
  razorpay_key_secret: String,
}, { timestamps: true });

platformSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ key: 'global' });
  if (!settings) settings = await this.create({ key: 'global' });
  return settings;
};

export default mongoose.model('PlatformSettings', platformSettingsSchema);