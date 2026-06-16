import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  astrologer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
  type: { type: String, enum: ['chat', 'call', 'video'], default: 'chat' },
  scheduled_date: { type: Date, required: true },
  scheduled_time: { type: String, required: true },
  duration_minutes: { type: Number, default: 30 },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  notes: String,
  reminder_sent: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);