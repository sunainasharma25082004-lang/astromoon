import User from '../models/User.js';
import Astrologer from '../models/Astrologer.js';
import Consultation from '../models/Consultation.js';
import WalletTransaction from '../models/WalletTransaction.js';
import PlatformSettings from '../models/PlatformSettings.js';
import { calcCommission } from './helpers.js';
import { emitPanelUpdate, RESOURCES } from './realtime.js';

export async function processMinuteBilling(consultationId, io) {
  const cons = await Consultation.findById(consultationId);
  if (!cons || cons.status !== 'active') return null;

  const [user, astro, settings] = await Promise.all([
    User.findById(cons.user_id),
    Astrologer.findById(cons.astrologer_id),
    PlatformSettings.getSettings(),
  ]);

  if (!user || !astro) return null;

  const rate = cons.per_minute_rate || astro[`${cons.type}_price`] || 10;
  const freeMinutesAllowed = user.free_trial_used ? 0 : settings.free_trial_minutes;
  const elapsedMinutes = Math.floor((cons.duration_seconds || 0) / 60);

  let chargeThisMinute = 0;
  let isFreeMinute = false;

  if (elapsedMinutes < freeMinutesAllowed && !user.free_trial_used) {
    isFreeMinute = true;
    cons.is_free_trial = true;
    cons.free_minutes_used = elapsedMinutes + 1;
  } else {
    chargeThisMinute = rate;
    if (!user.free_trial_used && elapsedMinutes >= freeMinutesAllowed) {
      user.free_trial_used = true;
      user.free_minutes_remaining = 0;
    }
  }

  if (chargeThisMinute > 0) {
    if ((user.wallet_balance || 0) < chargeThisMinute) {
      cons.status = 'payment_required';
      await cons.save();
      if (io) {
        io.to(consultationId).emit('consultation_status_update', {
          consultationId,
          status: 'payment_required',
          message: 'Insufficient wallet balance. Please recharge to continue.',
          wallet_balance: user.wallet_balance,
        });
        io.to(consultationId).emit('free_trial_ended', {
          consultationId,
          message: 'Your free consultation has ended.',
        });
        emitPanelUpdate(io, {
          resource: RESOURCES.CONSULTATIONS,
          userIds: [user._id],
          astroIds: [astro._id],
          admin: true,
          payload: { action: 'status', status: 'payment_required', consultationId },
        });
      }
      return { status: 'payment_required', balance: user.wallet_balance };
    }

    user.wallet_balance = (user.wallet_balance || 0) - chargeThisMinute;
    await user.save();

    const { commission, astroEarnings } = calcCommission(chargeThisMinute, settings.platform_commission_percent);
    cons.billed_amount = (cons.billed_amount || 0) + chargeThisMinute;
    cons.platform_commission = (cons.platform_commission || 0) + commission;
    cons.astro_earnings = (cons.astro_earnings || 0) + astroEarnings;
    cons.total_amount = cons.billed_amount;

    astro.wallet_balance = (astro.wallet_balance || 0) + astroEarnings;
    astro.total_earnings = (astro.total_earnings || 0) + astroEarnings;
    await astro.save();

    await WalletTransaction.create({
      user_id: user._id,
      type: 'debit',
      amount: chargeThisMinute,
      balance_after: user.wallet_balance,
      reference_type: 'consultation',
      description: `${cons.type} consultation - 1 min with ${astro.full_name}`,
    });
  }

  cons.duration_seconds = (cons.duration_seconds || 0) + 60;
  cons.duration_minutes = Math.ceil(cons.duration_seconds / 60);
  await cons.save();

  const payload = {
    consultationId,
    duration_seconds: cons.duration_seconds,
    free_minutes_remaining: Math.max(0, freeMinutesAllowed - cons.free_minutes_used),
    is_free_minute: isFreeMinute,
    wallet_balance: user.wallet_balance,
    billed_amount: cons.billed_amount,
    rate,
  };

  if (io) {
    io.to(consultationId).emit('billing_tick', payload);
    if (chargeThisMinute > 0) {
      emitPanelUpdate(io, {
        resource: RESOURCES.WALLET,
        userIds: [user._id],
        payload: { wallet_balance: user.wallet_balance },
      });
      emitPanelUpdate(io, {
        resource: RESOURCES.EARNINGS,
        astroIds: [astro._id],
        admin: true,
      });
      emitPanelUpdate(io, { resource: RESOURCES.TRANSACTIONS, admin: true });
      emitPanelUpdate(io, { resource: RESOURCES.STATS, admin: true });
    }
  }
  return payload;
}