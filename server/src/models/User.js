import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, sparse: true, unique: true },
  avatar_url: String,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  date_of_birth: Date,
  birth_time: String,
  birth_place: String,
  wallet_balance: { type: Number, default: 100 },
  role: { type: String, enum: ['user', 'astrologer', 'admin'], default: 'user' },
  astrologer_profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer' },
  google_id: String,
  referral_code: { type: String, unique: true, sparse: true },
  referred_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  free_trial_used: { type: Boolean, default: false },
  free_minutes_remaining: { type: Number, default: 5 },
  is_blocked: { type: Boolean, default: false },
  is_suspended: { type: Boolean, default: false },
  reset_password_token: String,
  reset_password_expires: Date,
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
