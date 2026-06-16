import express from 'express';
import Review from '../models/Review.js';
import Astrologer from '../models/Astrologer.js';
import { protect, authorize } from '../middleware/auth.js';
import { emitPanelUpdate, RESOURCES } from '../utils/realtime.js';

const router = express.Router();

router.get('/astrologer/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ astrologer_id: req.params.id, is_reported: false })
      .populate('user_id', 'full_name avatar_url')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { astrologer_id, consultation_id, rating, comment, consultation_type } = req.body;
    if (!astrologer_id || !rating || !comment) {
      return res.status(400).json({ message: 'astrologer_id, rating, and comment required' });
    }

    const existing = consultation_id
      ? await Review.findOne({ user_id: req.user._id, consultation_id })
      : null;

    let review;
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
      review = existing;
    } else {
      review = await Review.create({
        user_id: req.user._id,
        astrologer_id,
        consultation_id,
        rating,
        comment,
        consultation_type: consultation_type || 'chat',
      });
    }

    const allReviews = await Review.find({ astrologer_id, is_reported: false });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await Astrologer.findByIdAndUpdate(astrologer_id, {
      rating: Math.round(avg * 10) / 10,
      total_reviews: allReviews.length,
    });

    const io = req.app.get('io');
    if (io) {
      emitPanelUpdate(io, {
        resource: RESOURCES.REVIEWS,
        astroIds: [astrologer_id],
        admin: true,
      });
      emitPanelUpdate(io, { resource: RESOURCES.ASTROLOGERS, admin: true });
      emitPanelUpdate(io, { resource: RESOURCES.STATS, admin: true });
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('astrologer'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const astro = await Astrologer.findById(req.user.astrologer_profile_id);
    if (!astro || review.astrologer_id.toString() !== astro._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.id);

    const remaining = await Review.find({ astrologer_id: astro._id, is_reported: false });
    const avg = remaining.length
      ? remaining.reduce((s, r) => s + r.rating, 0) / remaining.length
      : astro.rating;
    astro.rating = Math.round(avg * 10) / 10;
    astro.total_reviews = remaining.length;
    await astro.save();

    const io = req.app.get('io');
    if (io) {
      emitPanelUpdate(io, {
        resource: RESOURCES.REVIEWS,
        astroIds: [astro._id],
        admin: true,
      });
      emitPanelUpdate(io, { resource: RESOURCES.ASTROLOGERS, admin: true });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/report', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { is_reported: true, report_reason: reason },
      { new: true }
    );
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;