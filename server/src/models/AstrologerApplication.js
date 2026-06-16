import mongoose from 'mongoose';

const astrologerApplicationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  experience: { type: Number, default: 0 },
  expertise: [String],
  languages: [String],
  bio: String,
  education: String,
  documents: {
    aadhaar_url: String,
    pan_url: String,
    certificate_url: String,
  },
  status: {
    type: String,
    enum: ['pending', 'interview_scheduled', 'approved', 'rejected'],
    default: 'pending',
  },
  interview_date: Date,
  interview_notes: String,
  admin_notes: String,
  rejection_reason: String,
  astrologer_profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer' },
  approved_at: Date,
}, { timestamps: true });

astrologerApplicationSchema.index({ user_id: 1 });
astrologerApplicationSchema.index({ status: 1 });

export default mongoose.model('AstrologerApplication', astrologerApplicationSchema);