import express from 'express';
import PlatformSettings from '../models/PlatformSettings.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/public', async (req, res) => {
  const settings = await PlatformSettings.getSettings();
  res.json({
    free_trial_minutes: settings.free_trial_minutes,
    signup_bonus: settings.signup_bonus,
    referral_bonus: settings.referral_bonus,
    min_chat_price: settings.min_chat_price,
    max_chat_price: settings.max_chat_price,
    min_audio_price: settings.min_audio_price,
    max_audio_price: settings.max_audio_price,
    min_video_price: settings.min_video_price,
    max_video_price: settings.max_video_price,
    platform_commission_percent: settings.platform_commission_percent,
  });
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  const settings = await PlatformSettings.getSettings();
  res.json(settings);
});

router.patch('/', protect, authorize('admin'), async (req, res) => {
  const settings = await PlatformSettings.getSettings();
  Object.assign(settings, req.body);
  await settings.save();
  res.json(settings);
});

export default router;