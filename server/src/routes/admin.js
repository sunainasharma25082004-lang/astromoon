import express from 'express';
import User from '../models/User.js';
import Astrologer from '../models/Astrologer.js';
import Consultation from '../models/Consultation.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Withdrawal from '../models/Withdrawal.js';
import Review from '../models/Review.js';
import AstrologerApplication from '../models/AstrologerApplication.js';
import Notification from '../models/Notification.js';
import PlatformSettings from '../models/PlatformSettings.js';
import { protect, authorize } from '../middleware/auth.js';
import { createNotification } from '../utils/helpers.js';
import { emitPanelUpdate, RESOURCES } from '../utils/realtime.js';

function adminBroadcast(io, resources, extra = {}) {
  if (!io) return;
  const list = Array.isArray(resources) ? resources : [resources];
  list.forEach((resource) => emitPanelUpdate(io, { resource, admin: true, ...extra }));
}

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers, totalAstrologers, onlineAstrologers, pendingApprovals,
      totalConsultations, revenueAgg, walletTxAgg, pendingWithdrawals,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'astrologer' }),
      Astrologer.countDocuments({ availability_status: 'online', approval_status: 'approved' }),
      Astrologer.countDocuments({ approval_status: 'pending' }),
      Consultation.countDocuments(),
      Consultation.aggregate([{ $group: { _id: null, total: { $sum: '$billed_amount' }, commission: { $sum: '$platform_commission' } } }]),
      WalletTransaction.aggregate([{ $match: { type: 'credit', reference_type: 'recharge' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Withdrawal.countDocuments({ status: 'pending' }),
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [userGrowth, astroGrowth, revenueByDay] = await Promise.all([
      User.countDocuments({ role: 'user', createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ role: 'astrologer', createdAt: { $gte: thirtyDaysAgo } }),
      Consultation.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, status: 'completed' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$billed_amount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      totalUsers, totalAstrologers, onlineAstrologers, pendingApprovals,
      totalConsultations,
      totalRevenue: revenueAgg[0]?.total || 0,
      platformCommission: revenueAgg[0]?.commission || 0,
      totalRecharges: walletTxAgg[0]?.total || 0,
      pendingWithdrawals,
      userGrowth30d: userGrowth,
      astroGrowth30d: astroGrowth,
      revenueByDay,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users', async (req, res) => {
  const { role, search } = req.query;
  let filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { full_name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).limit(200);
  res.json(users);
});

router.patch('/users/:id', async (req, res) => {
  const allowed = ['full_name', 'email', 'phone', 'is_blocked', 'is_suspended', 'wallet_balance'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  adminBroadcast(req.app.get('io'), [RESOURCES.USERS, RESOURCES.STATS]);
  if (updates.wallet_balance !== undefined) {
    emitPanelUpdate(req.app.get('io'), {
      resource: RESOURCES.WALLET,
      userIds: [req.params.id],
      admin: true,
    });
  }
  res.json(user);
});

router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  adminBroadcast(req.app.get('io'), [RESOURCES.USERS, RESOURCES.STATS]);
  res.json({ success: true });
});

router.get('/astrologers', async (req, res) => {
  const { status } = req.query;
  const filter = status ? { approval_status: status } : {};
  const astros = await Astrologer.find(filter).sort({ createdAt: -1 });
  res.json(astros);
});

router.post('/astrologers/:id/approve', async (req, res) => {
  const astro = await Astrologer.findByIdAndUpdate(
    req.params.id,
    { is_verified: true, approval_status: 'approved', is_available: true },
    { new: true }
  );
  await User.updateOne({ astrologer_profile_id: astro._id }, { role: 'astrologer' });
  adminBroadcast(req.app.get('io'), [RESOURCES.ASTROLOGERS, RESOURCES.STATS]);
  res.json({ success: true, astrologer: astro });
});

router.post('/astrologers/:id/reject', async (req, res) => {
  const astro = await Astrologer.findByIdAndUpdate(
    req.params.id,
    { approval_status: 'rejected', rejection_reason: req.body.reason },
    { new: true }
  );
  adminBroadcast(req.app.get('io'), [RESOURCES.ASTROLOGERS, RESOURCES.STATS]);
  res.json({ success: true, astrologer: astro });
});

router.patch('/astrologers/:id', async (req, res) => {
  const astro = await Astrologer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  adminBroadcast(req.app.get('io'), RESOURCES.ASTROLOGERS);
  res.json(astro);
});

router.post('/users/:id/wallet', async (req, res) => {
  const { amount, type = 'credit' } = req.body;
  const user = await User.findById(req.params.id);
  const newBalance = type === 'credit'
    ? (user.wallet_balance || 0) + Number(amount)
    : Math.max(0, (user.wallet_balance || 0) - Number(amount));
  user.wallet_balance = newBalance;
  await user.save();
  await WalletTransaction.create({
    user_id: user._id, type, amount: Number(amount),
    balance_after: newBalance, reference_type: 'refund',
    description: `Admin adjustment (${type})`,
  });
  const io = req.app.get('io');
  if (io) {
    emitPanelUpdate(io, {
      resource: RESOURCES.WALLET,
      userIds: [user._id],
      admin: true,
      payload: { wallet_balance: newBalance },
    });
    adminBroadcast(io, [RESOURCES.USERS, RESOURCES.TRANSACTIONS, RESOURCES.STATS]);
  }
  res.json({ success: true, new_balance: newBalance });
});

router.get('/consultations', async (req, res) => {
  const consultations = await Consultation.find()
    .populate('user_id', 'full_name email')
    .populate('astrologer_id', 'full_name')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(consultations);
});

router.get('/transactions', async (req, res) => {
  const txs = await WalletTransaction.find().populate('user_id', 'full_name email')
    .sort({ createdAt: -1 }).limit(100);
  res.json(txs);
});

router.patch('/consultations/:id/status', async (req, res) => {
  const cons = await Consultation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  const io = req.app.get('io');
  if (io && cons) {
    emitPanelUpdate(io, {
      resource: RESOURCES.CONSULTATIONS,
      userIds: [cons.user_id],
      astroIds: [cons.astrologer_id],
      admin: true,
      payload: { action: 'status', status: cons.status, consultation: cons },
    });
    adminBroadcast(io, RESOURCES.STATS);
  }
  res.json(cons);
});

router.get('/settings', async (req, res) => {
  const settings = await PlatformSettings.getSettings();
  res.json(settings);
});

router.patch('/settings', async (req, res) => {
  const settings = await PlatformSettings.getSettings();
  Object.assign(settings, req.body);
  await settings.save();
  res.json(settings);
});

router.get('/reviews/reported', async (req, res) => {
  const reviews = await Review.find({ is_reported: true })
    .populate('user_id', 'full_name email')
    .populate('astrologer_id', 'full_name')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(reviews);
});

router.patch('/reviews/:id/dismiss', async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { is_reported: false, report_reason: null },
    { new: true }
  );
  adminBroadcast(req.app.get('io'), RESOURCES.REVIEWS);
  res.json(review);
});

router.get('/withdrawals', async (req, res) => {
  const withdrawals = await Withdrawal.find()
    .populate('user_id', 'full_name email')
    .populate('astrologer_id', 'full_name')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(withdrawals);
});

// ── Astrologer Applications (Become Astrologer flow) ──
router.get('/applications', async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const apps = await AstrologerApplication.find(filter)
    .populate('user_id', 'full_name email phone wallet_balance')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(apps);
});

router.patch('/applications/:id/interview', async (req, res) => {
  try {
    const { interview_date, interview_notes, admin_notes } = req.body;
    const app = await AstrologerApplication.findByIdAndUpdate(
      req.params.id,
      {
        status: 'interview_scheduled',
        interview_date: interview_date ? new Date(interview_date) : undefined,
        interview_notes,
        admin_notes,
      },
      { new: true }
    ).populate('user_id', 'full_name email');

    if (app?.user_id) {
      await createNotification(Notification, app.user_id._id, {
        title: 'Interview Scheduled',
        message: `Your astrologer interview is scheduled${interview_date ? ` for ${new Date(interview_date).toLocaleString()}` : ''}.`,
        type: 'system',
        action_url: '/dashboard/become-astrologer',
      });
    }
    const io = req.app.get('io');
    if (io && app) {
      emitPanelUpdate(io, {
        resource: RESOURCES.APPLICATIONS,
        userIds: [app.user_id?._id || app.user_id],
        admin: true,
      });
      emitPanelUpdate(io, {
        resource: RESOURCES.NOTIFICATIONS,
        userIds: [app.user_id?._id || app.user_id],
        payload: { title: 'Interview Scheduled', message: 'Check your application status' },
      });
    }
    res.json({ success: true, application: app });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/applications/:id/approve', async (req, res) => {
  try {
    const { password, chat_price, call_price, video_price } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Set a login password (min 6 characters) for the astrologer' });
    }

    const app = await AstrologerApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.status === 'approved') return res.status(400).json({ message: 'Already approved' });

    const user = await User.findById(app.user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let astro = app.astrologer_profile_id
      ? await Astrologer.findById(app.astrologer_profile_id)
      : null;

    if (!astro) {
      astro = await Astrologer.create({
        full_name: app.full_name,
        expertise: app.expertise,
        languages: app.languages,
        experience: app.experience,
        bio: app.bio,
        education: app.education,
        documents: app.documents,
        chat_price: chat_price || 20,
        call_price: call_price || 30,
        video_price: video_price || 50,
        approval_status: 'approved',
        is_verified: true,
        is_available: true,
        availability_status: 'offline',
        is_new: true,
      });
    } else {
      astro.approval_status = 'approved';
      astro.is_verified = true;
      astro.is_available = true;
      await astro.save();
    }

    user.role = 'astrologer';
    user.astrologer_profile_id = astro._id;
    user.password = password;
    await user.save();

    app.status = 'approved';
    app.approved_at = new Date();
    app.astrologer_profile_id = astro._id;
    await app.save();

    const credMessage = `Login ID: ${user.email} — use the password set by admin at /auth/login → Astrologer Panel.`;

    await createNotification(Notification, user._id, {
      title: 'Congratulations! You are now an Astrologer',
      message: `Your application is approved. ${credMessage}`,
      type: 'system',
      action_url: '/astro',
    });

    const io = req.app.get('io');
    if (io) {
      emitPanelUpdate(io, {
        resource: RESOURCES.APPLICATIONS,
        userIds: [user._id],
        admin: true,
      });
      adminBroadcast(io, [RESOURCES.ASTROLOGERS, RESOURCES.USERS, RESOURCES.STATS]);
      emitPanelUpdate(io, {
        resource: RESOURCES.NOTIFICATIONS,
        userIds: [user._id],
        payload: { title: 'You are now an Astrologer!', message: credMessage },
      });
    }

    res.json({
      success: true,
      application: app,
      astrologer: astro,
      login_id: user.email,
      login_email: user.email,
      login_password: password,
      message: 'Astrologer approved. Share login ID and password with the astrologer.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/applications/:id/reject', async (req, res) => {
  try {
    const app = await AstrologerApplication.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejection_reason: req.body.reason || 'Not selected' },
      { new: true }
    );
    if (app?.user_id) {
      await createNotification(Notification, app.user_id, {
        title: 'Application Update',
        message: `Your astrologer application was not approved. Reason: ${req.body.reason || 'Contact support'}`,
        type: 'system',
        action_url: '/dashboard/become-astrologer',
      });
    }
    const io = req.app.get('io');
    if (io && app) {
      emitPanelUpdate(io, {
        resource: RESOURCES.APPLICATIONS,
        userIds: [app.user_id],
        admin: true,
      });
      emitPanelUpdate(io, {
        resource: RESOURCES.NOTIFICATIONS,
        userIds: [app.user_id],
        payload: { title: 'Application Update', message: req.body.reason || 'Not approved' },
      });
    }
    res.json({ success: true, application: app });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/withdrawals/:id/status', async (req, res) => {
  const { status, admin_note } = req.body;
  const withdrawal = await Withdrawal.findByIdAndUpdate(
    req.params.id,
    { status, admin_note, processed_at: status === 'completed' ? new Date() : undefined },
    { new: true }
  );
  const io = req.app.get('io');
  if (io && withdrawal) {
    emitPanelUpdate(io, {
      resource: RESOURCES.WITHDRAWALS,
      userIds: [withdrawal.user_id],
      astroIds: withdrawal.astrologer_id ? [withdrawal.astrologer_id] : [],
      admin: true,
    });
    adminBroadcast(io, RESOURCES.STATS);
  }
  res.json(withdrawal);
});

export default router;