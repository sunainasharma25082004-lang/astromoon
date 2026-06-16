import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const notifications = await Notification.find({ user_id: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifications);
});

router.get('/unread-count', protect, async (req, res) => {
  const count = await Notification.countDocuments({ user_id: req.user._id, is_read: false });
  res.json({ count });
});

router.patch('/:id/read', protect, async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    { is_read: true },
    { new: true }
  );
  res.json(n);
});

router.patch('/read-all', protect, async (req, res) => {
  await Notification.updateMany({ user_id: req.user._id }, { is_read: true });
  res.json({ success: true });
});

export default router;