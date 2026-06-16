import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  type: { type: String, enum: ['banner', 'faq', 'terms', 'privacy'], required: true },
  title: String,
  content: String,
  image_url: String,
  link_url: String,
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  metadata: { type: Object, default: {} },
}, { timestamps: true });

export default mongoose.model('Content', contentSchema);