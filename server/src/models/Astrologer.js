import mongoose from 'mongoose';

const astrologerSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  avatar_url: String,
  expertise: [String],
  languages: [String],
  skills: [String],
  experience: { type: Number, default: 0 },
  bio: String,
  education: String,
  certifications: [String],
  chat_price: { type: Number, default: 10 },
  call_price: { type: Number, default: 15 },
  video_price: { type: Number, default: 20 },
  rating: { type: Number, default: 4.7 },
  total_reviews: { type: Number, default: 0 },
  total_consultations: { type: Number, default: 0 },
  total_earnings: { type: Number, default: 0 },
  wallet_balance: { type: Number, default: 0 },
  is_online: { type: Boolean, default: false },
  is_verified: { type: Boolean, default: false },
  is_available: { type: Boolean, default: true },
  availability_status: { type: String, enum: ['online', 'offline', 'busy'], default: 'offline' },
  approval_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejection_reason: String,
  documents: {
    aadhaar_url: String,
    pan_url: String,
    certificate_url: String,
    experience_proof_url: String,
    profile_photo_url: String,
  },
  available_slots: [{
    day: String,
    start_time: String,
    end_time: String,
  }],
  is_featured: { type: Boolean, default: false },
  is_new: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Astrologer', astrologerSchema);
