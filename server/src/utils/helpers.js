import crypto from 'crypto';

export function generateReferralCode(name = 'USER') {
  const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'STAR';
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${suffix}`;
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function clampPrice(price, min, max) {
  return Math.max(min, Math.min(max, price));
}

export function calcCommission(amount, percent) {
  const commission = Math.round((amount * percent) / 100 * 100) / 100;
  const astroEarnings = Math.round((amount - commission) * 100) / 100;
  return { commission, astroEarnings };
}

export async function createNotification(Notification, userId, { title, message, type = 'system', action_url }) {
  return Notification.create({ user_id: userId, title, message, type, action_url });
}