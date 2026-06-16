import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sender_role: { type: String, enum: ['user', 'astrologer', 'admin'] },
  text: String,
  type: { type: String, enum: ['text', 'image', 'emoji'], default: 'text' },
  image_url: String,
  is_read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const consultationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  astrologer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
  type: { type: String, enum: ['chat', 'call', 'video'], required: true },
  status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled', 'payment_required'], default: 'pending' },
  duration_minutes: { type: Number, default: 0 },
  duration_seconds: { type: Number, default: 0 },
  total_amount: { type: Number, default: 0 },
  billed_amount: { type: Number, default: 0 },
  astro_earnings: { type: Number, default: 0 },
  platform_commission: { type: Number, default: 0 },
  per_minute_rate: Number,
  free_minutes_used: { type: Number, default: 0 },
  is_free_trial: { type: Boolean, default: false },
  started_at: Date,
  ended_at: Date,
  rating: { type: Number, min: 1, max: 5 },
  review: String,
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AstrologerPackage' },
  messages: [messageSchema],
}, { timestamps: true });

export default mongoose.model('Consultation', consultationSchema);