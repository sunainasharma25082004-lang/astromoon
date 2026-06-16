import express from 'express';
import User from '../models/User.js';
import Referral from '../models/Referral.js';
import WalletTransaction from '../models/WalletTransaction.js';
import PlatformSettings from '../models/PlatformSettings.js';
import { protect } from '../middleware/auth.js';
import { generateReferralCode } from '../utils/helpers.js';

const router = express.Router();

router.get('/my-code', protect, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user.referral_code) {
      user.referral_code = generateReferralCode(user.full_name);
      await user.save();
    }
    const referrals = await Referral.find({ referrer_id: user._id })
      .populate('referred_id', 'full_name email createdAt');
    res.json({ referral_code: user.referral_code, referrals, total: referrals.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/apply', protect, async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id);
    if (user.referred_by) return res.status(400).json({ message: 'Referral already applied' });

    const referrer = await User.findOne({ referral_code: code?.toUpperCase() });
    if (!referrer) return res.status(404).json({ message: 'Invalid referral code' });
    if (referrer._id.equals(user._id)) return res.status(400).json({ message: 'Cannot use own code' });

    const settings = await PlatformSettings.getSettings();
    const bonus = settings.referral_bonus || 50;

    user.referred_by = referrer._id;
    user.wallet_balance = (user.wallet_balance || 0) + bonus;
    await user.save();

    referrer.wallet_balance = (referrer.wallet_balance || 0) + bonus;
    await referrer.save();

    await Referral.create({
      referrer_id: referrer._id,
      referred_id: user._id,
      referral_code: code.toUpperCase(),
      bonus_amount: bonus,
    });

    await WalletTransaction.create({
      user_id: user._id, type: 'credit', amount: bonus,
      balance_after: user.wallet_balance, reference_type: 'referral',
      description: `Referral bonus using code ${code}`,
    });
    await WalletTransaction.create({
      user_id: referrer._id, type: 'credit', amount: bonus,
      balance_after: referrer.wallet_balance, reference_type: 'referral',
      description: `Referral reward for inviting ${user.full_name}`,
    });

    res.json({ success: true, bonus, new_balance: user.wallet_balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;