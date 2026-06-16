import express from 'express';
import Consultation from '../models/Consultation.js';
import User from '../models/User.js';
import Astrologer from '../models/Astrologer.js';
import PlatformSettings from '../models/PlatformSettings.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';
import { createNotification } from '../utils/helpers.js';
import { emitConsultationUpdate, emitIncomingToAstrologer, emitPanelUpdate, RESOURCES } from '../utils/realtime.js';

const router = express.Router();

router.post('/book', protect, authorize('user'), async (req, res) => {
  try {
    const { astrologer_id, type, package_id } = req.body;
    if (!astrologer_id || !type) {
      return res.status(400).json({ message: 'astrologer_id and type are required' });
    }

    const astro = await Astrologer.findById(astrologer_id);
    if (!astro) return res.status(404).json({ message: 'Astrologer not found' });
    if (astro.approval_status !== 'approved') {
      return res.status(400).json({ message: 'Astrologer not available' });
    }
    if (astro.availability_status === 'offline') {
      return res.status(400).json({ message: 'Astrologer is currently offline' });
    }

    const user = await User.findById(req.user._id);
    const settings = await PlatformSettings.getSettings();
    const rate = astro[`${type === 'call' ? 'call' : type}_price`] || astro.chat_price || 10;
    const hasFreeTrial = !user.free_trial_used;

    astro.availability_status = 'busy';
    await astro.save();

    const consultation = await Consultation.create({
      user_id: req.user._id,
      astrologer_id,
      type,
      status: 'pending',
      per_minute_rate: rate,
      is_free_trial: hasFreeTrial,
      package_id,
      messages: [],
    });

    const populated = await Consultation.findById(consultation._id)
      .populate('user_id', 'full_name email avatar_url')
      .populate('astrologer_id', 'full_name avatar_url chat_price call_price video_price')
      .lean();

    const astroUser = await User.findOne({ astrologer_profile_id: astro._id });
    if (astroUser) {
      await createNotification(Notification, astroUser._id, {
        title: 'New Consultation Request',
        message: `${user.full_name} wants a ${type} consultation.`,
        type: 'consultation',
        action_url: '/astro',
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(consultation._id.toString()).emit('consultation_status_update', {
        consultationId: consultation._id,
        status: 'pending',
      });
      emitConsultationUpdate(io, populated, {
        action: 'incoming',
        type,
        user: { full_name: user.full_name, _id: user._id },
      });
      emitIncomingToAstrologer(io, {
        astroUserId: astroUser?._id,
        astroProfileId: astro._id,
        consultation: populated,
        type,
        user,
      });
      if (astroUser) {
        emitPanelUpdate(io, {
          resource: RESOURCES.NOTIFICATIONS,
          userIds: [astroUser._id],
          payload: {
            title: `New ${type} request`,
            message: `${user.full_name} wants a ${type} consultation.`,
          },
        });
      }
      emitPanelUpdate(io, {
        resource: RESOURCES.ASTROLOGERS,
        admin: true,
        astroIds: [astro._id],
      });
    }

    res.status(201).json({
      success: true,
      consultation: populated,
      free_trial_available: hasFreeTrial,
      free_minutes: hasFreeTrial ? settings.free_trial_minutes : 0,
      rate,
      wallet_balance: user.wallet_balance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/for-astro', protect, authorize('astrologer'), async (req, res) => {
  try {
    const astroId = req.user.astrologer_profile_id;
    const consultations = await Consultation.find({ astrologer_id: astroId })
      .populate('user_id', 'full_name email avatar_url')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const consultations = await Consultation.find({ user_id: req.user._id })
      .populate('astrologer_id', 'full_name avatar_url chat_price video_price call_price rating')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/accept', protect, authorize('astrologer'), async (req, res) => {
  try {
    const cons = await Consultation.findById(req.params.id);
    if (!cons) return res.status(404).json({ message: 'Consultation not found' });
    if (cons.astrologer_id.toString() !== req.user.astrologer_profile_id?.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!['pending', 'payment_required'].includes(cons.status)) {
      return res.status(400).json({ message: 'Session cannot be accepted' });
    }

    cons.status = 'active';
    cons.started_at = new Date();
    await cons.save();

    const astro = await Astrologer.findById(cons.astrologer_id);
    if (astro) {
      astro.availability_status = 'busy';
      await astro.save();
    }

    const populated = await Consultation.findById(cons._id)
      .populate('user_id', 'full_name email avatar_url')
      .populate('astrologer_id', 'full_name avatar_url chat_price call_price video_price')
      .lean();

    const io = req.app.get('io');
    if (io) {
      io.to(cons._id.toString()).emit('consultation_status_update', {
        consultationId: cons._id,
        status: 'active',
      });
      io.to(cons._id.toString()).emit('call_accepted', { consultationId: cons._id });
      emitConsultationUpdate(io, populated, {
        action: 'status',
        status: 'active',
        message: `Your ${cons.type} consultation is now active.`,
      });
      emitPanelUpdate(io, {
        resource: RESOURCES.NOTIFICATIONS,
        userIds: [cons.user_id],
        payload: {
          title: 'Session started',
          message: `Your ${cons.type} consultation is now active.`,
        },
      });
    }

    res.json({ success: true, consultation: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/reject', protect, authorize('astrologer'), async (req, res) => {
  try {
    const cons = await Consultation.findById(req.params.id);
    if (!cons) return res.status(404).json({ message: 'Consultation not found' });
    if (cons.astrologer_id.toString() !== req.user.astrologer_profile_id?.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!['pending', 'payment_required'].includes(cons.status)) {
      return res.status(400).json({ message: 'Session cannot be declined' });
    }

    cons.status = 'cancelled';
    cons.ended_at = new Date();
    await cons.save();

    const astro = await Astrologer.findById(cons.astrologer_id);
    if (astro) {
      const activeCount = await Consultation.countDocuments({
        astrologer_id: astro._id,
        status: { $in: ['pending', 'active', 'payment_required'] },
        _id: { $ne: cons._id },
      });
      astro.availability_status = activeCount > 0 ? 'busy' : 'online';
      await astro.save();
    }

    const populated = await Consultation.findById(cons._id)
      .populate('user_id', 'full_name email avatar_url')
      .populate('astrologer_id', 'full_name avatar_url')
      .lean();

    const typeLabel = cons.type === 'video' ? 'video call' : cons.type === 'call' ? 'audio call' : 'chat';
    const io = req.app.get('io');
    if (io) {
      io.to(cons._id.toString()).emit('consultation_status_update', {
        consultationId: cons._id,
        status: 'cancelled',
      });
      io.to(cons._id.toString()).emit('call_rejected', { consultationId: cons._id });
      emitConsultationUpdate(io, populated, {
        action: 'status',
        status: 'cancelled',
        message: `Astrologer declined your ${typeLabel}.`,
      });
      emitPanelUpdate(io, {
        resource: RESOURCES.NOTIFICATIONS,
        userIds: [cons.user_id],
        payload: {
          title: 'Call declined',
          message: `The astrologer declined your ${typeLabel}.`,
        },
      });
      if (astro) {
        emitPanelUpdate(io, { resource: RESOURCES.ASTROLOGERS, admin: true, astroIds: [astro._id] });
      }
    }

    res.json({ success: true, consultation: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/resume', protect, authorize('user'), async (req, res) => {
  try {
    const cons = await Consultation.findById(req.params.id);
    if (!cons) return res.status(404).json({ message: 'Consultation not found' });
    if (cons.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (cons.status !== 'payment_required') {
      return res.status(400).json({ message: 'Session does not require payment' });
    }

    const user = await User.findById(req.user._id);
    const advanceAmount = Number(req.body.advance_amount) || (cons.per_minute_rate || 10) * 5;

    if ((user.wallet_balance || 0) < advanceAmount) {
      return res.status(400).json({
        message: 'Insufficient wallet balance',
        required: advanceAmount,
        balance: user.wallet_balance,
      });
    }

    user.wallet_balance = (user.wallet_balance || 0) - advanceAmount;
    await user.save();

    cons.status = 'active';
    cons.billed_amount = (cons.billed_amount || 0) + advanceAmount;
    cons.total_amount = cons.billed_amount;
    await cons.save();

    const io = req.app.get('io');
    if (io) {
      io.to(cons._id.toString()).emit('consultation_status_update', {
        consultationId: cons._id,
        status: 'active',
        wallet_balance: user.wallet_balance,
      });
      emitConsultationUpdate(io, cons, { action: 'status', status: 'active' });
      emitPanelUpdate(io, {
        resource: RESOURCES.WALLET,
        userIds: [user._id],
        admin: true,
        payload: { wallet_balance: user.wallet_balance },
      });
      emitPanelUpdate(io, { resource: RESOURCES.TRANSACTIONS, admin: true });
    }

    res.json({
      success: true,
      consultation: cons,
      advance_paid: advanceAmount,
      wallet_balance: user.wallet_balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/complete', protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const cons = await Consultation.findById(req.params.id);
    if (!cons) return res.status(404).json({ message: 'Consultation not found' });

    const astro = await Astrologer.findById(cons.astrologer_id);
    cons.status = 'completed';
    cons.ended_at = new Date();
    if (rating) cons.rating = rating;
    if (review) cons.review = review;
    await cons.save();

    if (astro) {
      astro.total_consultations = (astro.total_consultations || 0) + 1;
      const activeCount = await Consultation.countDocuments({
        astrologer_id: astro._id,
        status: { $in: ['pending', 'active', 'payment_required'] },
      });
      astro.availability_status = activeCount > 0 ? 'busy' : 'online';
      await astro.save();
    }

    const io = req.app.get('io');
    if (io) {
      io.to(cons._id.toString()).emit('consultation_status_update', {
        consultationId: cons._id,
        status: 'completed',
      });
      emitConsultationUpdate(io, cons, { action: 'status', status: 'completed' });
      if (astro) {
        emitPanelUpdate(io, {
          resource: RESOURCES.EARNINGS,
          astroIds: [astro._id],
          admin: true,
        });
        emitPanelUpdate(io, { resource: RESOURCES.STATS, admin: true });
      }
    }

    res.json({ success: true, consultation: cons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/message', protect, async (req, res) => {
  try {
    const { text, type = 'text', image_url } = req.body;
    if (!text && !image_url) return res.status(400).json({ message: 'Message required' });

    const cons = await Consultation.findById(req.params.id);
    if (!cons) return res.status(404).json({ message: 'Consultation not found' });

    const message = {
      sender_id: req.user._id,
      sender_role: req.user.role,
      text: text || '',
      type,
      image_url,
      timestamp: new Date(),
    };

    cons.messages = cons.messages || [];
    cons.messages.push(message);
    await cons.save();

    const io = req.app.get('io');
    if (io) {
      io.to(cons._id.toString()).emit('receive_message', {
        consultationId: cons._id,
        message: { ...message, sender: req.user.full_name },
        timestamp: message.timestamp,
      });
    }

    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/typing', protect, async (req, res) => {
  const io = req.app.get('io');
  if (io) {
    io.to(req.params.id).emit('typing_indicator', {
      consultationId: req.params.id,
      user: req.user.full_name,
      role: req.user.role,
    });
  }
  res.json({ success: true });
});

router.get('/:id', protect, async (req, res) => {
  try {
    const cons = await Consultation.findById(req.params.id)
      .populate('user_id', 'full_name avatar_url')
      .populate('astrologer_id', 'full_name avatar_url chat_price call_price video_price');
    if (!cons) return res.status(404).json({ message: 'Not found' });
    res.json(cons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;