import express from 'express';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { createNotification } from '../utils/helpers.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { astrologer_id, type, scheduled_date, scheduled_time, duration_minutes, notes } = req.body;
    if (!astrologer_id || !scheduled_date || !scheduled_time) {
      return res.status(400).json({ message: 'astrologer_id, scheduled_date, and scheduled_time required' });
    }

    const appointment = await Appointment.create({
      user_id: req.user._id,
      astrologer_id,
      type: type || 'chat',
      scheduled_date,
      scheduled_time,
      duration_minutes: duration_minutes || 30,
      notes,
      status: 'confirmed',
    });

    await createNotification(Notification, req.user._id, {
      title: 'Booking Confirmed',
      message: `Your appointment on ${scheduled_date} at ${scheduled_time} is confirmed.`,
      type: 'booking',
      action_url: '/dashboard',
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my', protect, async (req, res) => {
  const appointments = await Appointment.find({ user_id: req.user._id })
    .populate('astrologer_id', 'full_name avatar_url chat_price call_price video_price')
    .sort({ scheduled_date: 1 });
  res.json(appointments);
});

router.get('/astro', protect, async (req, res) => {
  const user = req.user;
  const appointments = await Appointment.find({ astrologer_id: user.astrologer_profile_id })
    .populate('user_id', 'full_name email phone')
    .sort({ scheduled_date: 1 });
  res.json(appointments);
});

router.patch('/:id/cancel', protect, async (req, res) => {
  const appt = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled' },
    { new: true }
  );
  res.json(appt);
});

export default router;