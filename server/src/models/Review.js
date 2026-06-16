import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  astrologer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
  consultation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  consultation_type: { type: String, enum: ['chat', 'call', 'video'], default: 'chat' },
  is_reported: { type: Boolean, default: false },
  report_reason: String,
}, { timestamps: true });

reviewSchema.index({ astrologer_id: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);