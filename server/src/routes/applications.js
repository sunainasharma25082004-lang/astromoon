import express from 'express';
import AstrologerApplication from '../models/AstrologerApplication.js';
import User from '../models/User.js';
import Astrologer from '../models/Astrologer.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';
import { createNotification } from '../utils/helpers.js';
import { emitPanelUpdate, RESOURCES } from '../utils/realtime.js';

const router = express.Router();

// User: submit become-astrologer request
router.post('/astrologer', protect, authorize('user'), async (req, res) => {
  try {
    const existing = await AstrologerApplication.findOne({
      user_id: req.user._id,
      status: { $in: ['pending', 'interview_scheduled'] },
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending application' });
    }

    const approved = await AstrologerApplication.findOne({ user_id: req.user._id, status: 'approved' });
    if (approved || req.user.role === 'astrologer') {
      return res.status(400).json({ message: 'You are already an astrologer' });
    }

    const { experience, expertise, languages, bio, education, phone, documents } = req.body;

    const application = await AstrologerApplication.create({
      user_id: req.user._id,
      full_name: req.user.full_name,
      email: req.user.email,
      phone: phone || req.user.phone,
      experience: experience || 0,
      expertise: expertise || ['Vedic Astrology'],
      languages: languages || ['Hindi', 'English'],
      bio: bio || '',
      education: education || '',
      documents: documents || {},
      status: 'pending',
    });

    await createNotification(Notification, req.user._id, {
      title: 'Application Submitted',
      message: 'Your astrologer application has been sent to admin for review.',
      type: 'system',
      action_url: '/dashboard/become-astrologer',
    });

    const io = req.app.get('io');
    if (io) {
      emitPanelUpdate(io, {
        resource: RESOURCES.APPLICATIONS,
        userIds: [req.user._id],
        admin: true,
        payload: { application },
      });
      emitPanelUpdate(io, {
        resource: RESOURCES.NOTIFICATIONS,
        userIds: [req.user._id],
        payload: { title: 'Application Submitted', message: 'Sent to admin for review' },
      });
      emitPanelUpdate(io, { resource: RESOURCES.STATS, admin: true });
    }

    res.status(201).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User: check own application status
router.get('/astrologer/my', protect, async (req, res) => {
  const application = await AstrologerApplication.findOne({ user_id: req.user._id })
    .sort({ createdAt: -1 });
  res.json(application || null);
});

export default router;