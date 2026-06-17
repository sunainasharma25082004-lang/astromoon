import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Astrologer from '../models/Astrologer.js';
import OtpSession from '../models/OtpSession.js';
import PlatformSettings from '../models/PlatformSettings.js';
import { protect } from '../middleware/auth.js';
import { generateReferralCode, generateOtp, normalizePhone, normalizeEmail } from '../utils/helpers.js';

const router = express.Router();

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const formatUser = (user) => ({
  id: user._id,
  email: user.email,
  full_name: user.full_name,
  phone: user.phone,
  avatar_url: user.avatar_url,
  gender: user.gender,
  date_of_birth: user.date_of_birth,
  birth_time: user.birth_time,
  birth_place: user.birth_place,
  wallet_balance: user.wallet_balance,
  role: user.role,
  referral_code: user.referral_code,
  free_trial_used: user.free_trial_used,
  free_minutes_remaining: user.free_minutes_remaining,
  astrologer_profile_id: user.astrologer_profile_id || null,
});

async function checkUserAccess(user, res) {
  if (user.is_blocked) { res.status(403).json({ message: 'Account blocked' }); return false; }
  if (user.is_suspended) { res.status(403).json({ message: 'Account suspended' }); return false; }
  return true;
}

function duplicateKeyMessage(error) {
  if (error?.code !== 11000) return null;
  const field = Object.keys(error.keyPattern || {})[0];
  if (field === 'email') return 'This email is already registered. Please login instead.';
  if (field === 'phone') return 'This phone number is already linked to another account.';
  return 'Account already exists with these details.';
}

router.post('/register', async (req, res) => {
  try {
    const full_name = String(req.body.full_name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const phone = normalizePhone(req.body.phone);

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10-digit phone number is required' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'This email is already registered. Please login instead.' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'This phone number is already linked to another account.' });
    }

    const settings = await PlatformSettings.getSettings();
    const role = ['user', 'astrologer'].includes(req.body.role) ? req.body.role : 'user';
    let astrologer_profile_id = null;

    if (role === 'astrologer') {
      const astroProfile = await Astrologer.create({
        full_name,
        expertise: req.body.expertise || ['Vedic Astrology'],
        languages: req.body.languages || ['Hindi', 'English'],
        bio: req.body.bio || 'New astrologer on Celestial Guidance.',
        experience: req.body.experience || 0,
        documents: req.body.documents || {},
        approval_status: 'pending',
        is_verified: false,
        availability_status: 'offline',
      });
      astrologer_profile_id = astroProfile._id;
    }

    const user = await User.create({
      full_name,
      email,
      password,
      phone,
      wallet_balance: settings.signup_bonus || 0,
      role,
      astrologer_profile_id,
      referral_code: generateReferralCode(full_name),
      free_minutes_remaining: settings.free_trial_minutes || 5,
    });

    const { referral_code } = req.body;
    if (referral_code) {
      const referrer = await User.findOne({ referral_code: referral_code.toUpperCase() });
      if (referrer && !referrer._id.equals(user._id)) {
        const bonus = settings.referral_bonus || 50;
        user.referred_by = referrer._id;
        user.wallet_balance += bonus;
        referrer.wallet_balance = (referrer.wallet_balance || 0) + bonus;
        await referrer.save();
        await user.save();
      }
    }

    const token = generateToken(user._id);
    res.status(201).json({ token, user: formatUser(user) });
  } catch (error) {
    const dup = duplicateKeyMessage(error);
    res.status(dup ? 400 : 500).json({ message: dup || error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!await checkUserAccess(user, res)) return;

    const token = generateToken(user._id);
    const userData = formatUser(user);
    if (user.role === 'astrologer' && user.astrologer_profile_id) {
      userData.astrologer_profile = await Astrologer.findById(user.astrologer_profile_id).lean();
    }
    res.json({ token, user: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/otp/send', async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10-digit phone number required' });
    }

    const otp = generateOtp();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);
    await OtpSession.deleteMany({ phone });
    await OtpSession.create({ phone, otp, expires_at });

    console.log(`[OTP] Phone: ${phone} OTP: ${otp}`);
    res.json({ success: true, message: 'OTP sent successfully', dev_otp: process.env.NODE_ENV !== 'production' ? otp : undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/otp/verify', async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || '').trim();
    const full_name = String(req.body.full_name || '').trim();

    if (!phone || phone.length !== 10) {
      return res.status(400).json({ message: 'Valid 10-digit phone number required' });
    }

    const session = await OtpSession.findOne({ phone, verified: false }).sort({ createdAt: -1 });
    if (!session || session.expires_at < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request again.' });
    }
    if (session.otp !== otp) {
      session.attempts += 1;
      await session.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    session.verified = true;
    await session.save();

    let user = await User.findOne({ phone });
    if (!user) {
      if (!full_name) {
        return res.status(400).json({ message: 'Full name is required for new account' });
      }
      const settings = await PlatformSettings.getSettings();
      user = await User.create({
        full_name,
        email: `${phone}@phone.user`,
        password: crypto.randomBytes(16).toString('hex'),
        phone,
        wallet_balance: settings.signup_bonus || 0,
        referral_code: generateReferralCode(full_name),
        free_minutes_remaining: settings.free_trial_minutes || 5,
      });
    }

    if (!await checkUserAccess(user, res)) return;
    const token = generateToken(user._id);
    res.json({ token, user: formatUser(user) });
  } catch (error) {
    const dup = duplicateKeyMessage(error);
    res.status(dup ? 400 : 500).json({ message: dup || error.message });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { google_id, email, full_name, avatar_url } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!google_id || !normalizedEmail) {
      return res.status(400).json({ message: 'Google credentials required' });
    }

    let user = await User.findOne({ $or: [{ google_id }, { email: normalizedEmail }] });
    if (!user) {
      const settings = await PlatformSettings.getSettings();
      user = await User.create({
        google_id,
        email: normalizedEmail,
        full_name: full_name || 'Google User',
        password: crypto.randomBytes(16).toString('hex'),
        avatar_url,
        wallet_balance: settings.signup_bonus || 0,
        referral_code: generateReferralCode(full_name || 'USER'),
        free_minutes_remaining: settings.free_trial_minutes || 5,
      });
    } else if (!user.google_id) {
      user.google_id = google_id;
      if (avatar_url) user.avatar_url = avatar_url;
      await user.save();
    }

    if (!await checkUserAccess(user, res)) return;
    const token = generateToken(user._id);
    res.json({ token, user: formatUser(user) });
  } catch (error) {
    const dup = duplicateKeyMessage(error);
    res.status(dup ? 400 : 500).json({ message: dup || error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: normalizeEmail(req.body.email) });
    if (!user) return res.json({ success: true, message: 'If account exists, reset link sent' });

    const token = crypto.randomBytes(32).toString('hex');
    user.reset_password_token = token;
    user.reset_password_expires = new Date(Date.now() + 3600000);
    await user.save();

    console.log(`[RESET] Email: ${user.email} Token: ${token}`);
    res.json({ success: true, message: 'Reset instructions sent', dev_token: process.env.NODE_ENV !== 'production' ? token : undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.findOne({
      reset_password_token: token,
      reset_password_expires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = password;
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  let userData = req.user.toObject ? req.user.toObject() : { ...req.user };
  delete userData.password;
  if (userData.role === 'astrologer' && userData.astrologer_profile_id) {
    userData.astrologer_profile = await Astrologer.findById(userData.astrologer_profile_id).lean();
  }
  const settings = await PlatformSettings.getSettings();
  userData.free_minutes_remaining = userData.free_trial_used ? 0 : settings.free_trial_minutes;
  res.json({ user: userData });
});

router.patch('/profile', protect, async (req, res) => {
  try {
    const allowed = ['full_name', 'phone', 'avatar_url', 'gender', 'date_of_birth', 'birth_time', 'birth_place'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (updates.phone) {
      const phone = normalizePhone(updates.phone);
      if (phone.length !== 10) {
        return res.status(400).json({ message: 'Valid 10-digit phone number required' });
      }
      const existingPhone = await User.findOne({ phone, _id: { $ne: req.user._id } });
      if (existingPhone) {
        return res.status(400).json({ message: 'This phone number is already linked to another account.' });
      }
      updates.phone = phone;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user: formatUser(user) });
  } catch (error) {
    const dup = duplicateKeyMessage(error);
    res.status(dup ? 400 : 500).json({ message: dup || error.message });
  }
});

export default router;