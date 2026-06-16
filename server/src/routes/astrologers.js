import express from 'express';
import Astrologer from '../models/Astrologer.js';
import AstrologerPackage from '../models/AstrologerPackage.js';
import Review from '../models/Review.js';
import PlatformSettings from '../models/PlatformSettings.js';
import { protect, authorize } from '../middleware/auth.js';
import { clampPrice, isValidObjectId } from '../utils/helpers.js';
import { emitPanelUpdate, RESOURCES } from '../utils/realtime.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { online, language, expertise, min_rating, min_experience, max_price, category, search } = req.query;
    let query = { approval_status: 'approved', is_verified: true };

    if (online === 'true') query.availability_status = 'online';
    if (language) query.languages = language;
    if (expertise) query.expertise = expertise;
    if (min_rating) query.rating = { $gte: Number(min_rating) };
    if (min_experience) query.experience = { $gte: Number(min_experience) };
    if (max_price) query.chat_price = { $lte: Number(max_price) };
    if (category === 'featured') query.is_featured = true;
    if (category === 'new') query.is_new = true;
    if (category === 'top-rated') query.rating = { $gte: 4.5 };
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { expertise: { $regex: search, $options: 'i' } },
      ];
    }

    const astrologers = await Astrologer.find(query).sort({ rating: -1, total_consultations: -1 });
    res.json(astrologers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/sections/home', async (req, res) => {
  try {
    const base = { approval_status: 'approved', is_verified: true };
    const [featured, online, topRated, newest] = await Promise.all([
      Astrologer.find({ ...base, is_featured: true }).limit(6),
      Astrologer.find({ ...base, availability_status: 'online' }).limit(8),
      Astrologer.find({ ...base, rating: { $gte: 4.5 } }).sort({ rating: -1 }).limit(6),
      Astrologer.find({ ...base, is_new: true }).sort({ createdAt: -1 }).limit(6),
    ]);
    res.json({ featured, online, topRated, newest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/packages/my', protect, authorize('astrologer'), async (req, res) => {
  const packages = await AstrologerPackage.find({ astrologer_id: req.user.astrologer_profile_id });
  res.json(packages);
});

router.post('/packages', protect, authorize('astrologer'), async (req, res) => {
  const pkg = await AstrologerPackage.create({
    ...req.body,
    astrologer_id: req.user.astrologer_profile_id,
  });
  res.status(201).json(pkg);
});

router.patch('/packages/:id', protect, authorize('astrologer'), async (req, res) => {
  const pkg = await AstrologerPackage.findOneAndUpdate(
    { _id: req.params.id, astrologer_id: req.user.astrologer_profile_id },
    req.body,
    { new: true }
  );
  res.json(pkg);
});

router.get('/earnings/summary', protect, authorize('astrologer'), async (req, res) => {
  try {
    const astro = await Astrologer.findById(req.user.astrologer_profile_id);
    const { getAstrologerEarningsBreakdown } = await import('../utils/astroEarnings.js');
    const breakdown = await getAstrologerEarningsBreakdown(astro._id);
    const Consultation = (await import('../models/Consultation.js')).default;
    const now = new Date();
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [daily, weekly, monthly] = await Promise.all([
      Consultation.aggregate([
        { $match: { astrologer_id: astro._id, status: 'completed', ended_at: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$astro_earnings' } } },
      ]),
      Consultation.aggregate([
        { $match: { astrologer_id: astro._id, status: 'completed', ended_at: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$astro_earnings' } } },
      ]),
      Consultation.aggregate([
        { $match: { astrologer_id: astro._id, status: 'completed', ended_at: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$astro_earnings' } } },
      ]),
    ]);

    res.json({
      total_earnings: astro.total_earnings,
      wallet_balance: astro.wallet_balance,
      withdrawable_balance: breakdown.withdrawable_balance,
      pending_earnings: breakdown.pending_earnings,
      hold_days: breakdown.hold_days,
      already_withdrawn: breakdown.already_withdrawn,
      total_consultations: astro.total_consultations,
      rating: astro.rating,
      daily: daily[0]?.total || 0,
      weekly: weekly[0]?.total || 0,
      monthly: monthly[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid astrologer id' });
    }
    const astro = await Astrologer.findById(req.params.id);
    if (!astro) return res.status(404).json({ message: 'Astrologer not found' });

    const [packages, reviews] = await Promise.all([
      AstrologerPackage.find({ astrologer_id: astro._id, is_active: true }),
      Review.find({ astrologer_id: astro._id, is_reported: false })
        .populate('user_id', 'full_name avatar_url')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({ ...astro.toObject(), packages, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/profile', protect, authorize('astrologer'), async (req, res) => {
  try {
    const allowed = ['full_name', 'bio', 'expertise', 'languages', 'skills', 'experience', 'education', 'certifications', 'avatar_url', 'available_slots'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const astro = await Astrologer.findByIdAndUpdate(req.user.astrologer_profile_id, updates, { new: true });
    res.json(astro);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/pricing', protect, authorize('astrologer'), async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    const { chat_price, call_price, video_price } = req.body;
    const updates = {};

    if (chat_price !== undefined) updates.chat_price = clampPrice(chat_price, settings.min_chat_price, settings.max_chat_price);
    if (call_price !== undefined) updates.call_price = clampPrice(call_price, settings.min_audio_price, settings.max_audio_price);
    if (video_price !== undefined) updates.video_price = clampPrice(video_price, settings.min_video_price, settings.max_video_price);

    const astro = await Astrologer.findByIdAndUpdate(req.user.astrologer_profile_id, updates, { new: true });
    res.json(astro);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/availability', protect, authorize('astrologer'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['online', 'offline', 'busy'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const astro = await Astrologer.findByIdAndUpdate(
      req.user.astrologer_profile_id,
      { availability_status: status, is_online: status === 'online' },
      { new: true }
    );
    const io = req.app.get('io');
    if (io && astro) {
      emitPanelUpdate(io, {
        resource: RESOURCES.ASTROLOGERS,
        astroIds: [astro._id],
        admin: true,
      });
      emitPanelUpdate(io, { resource: RESOURCES.STATS, admin: true });
    }
    res.json(astro);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;