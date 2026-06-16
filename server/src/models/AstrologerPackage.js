import mongoose from 'mongoose';

const astrologerPackageSchema = new mongoose.Schema({
  astrologer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
  name: { type: String, required: true },
  duration_minutes: { type: Number, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['chat', 'call', 'video', 'all'], default: 'all' },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('AstrologerPackage', astrologerPackageSchema);