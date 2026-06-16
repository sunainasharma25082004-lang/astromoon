import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['consultation', 'order', 'wallet', 'system', 'promo', 'booking', 'withdrawal'], default: 'system' },
  is_read: { type: Boolean, default: false },
  action_url: String,
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);