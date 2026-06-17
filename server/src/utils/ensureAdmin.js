import User from '../models/User.js';

export const ADMIN_EMAIL = 'admin@celestialguidance.com';
export const ADMIN_PASSWORD = 'Admin@2026';

export async function ensureAdmin() {
  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    await User.create({
      full_name: 'Site Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      wallet_balance: 0,
    });
    console.log(`✅ Admin created → ${ADMIN_EMAIL}`);
    return;
  }

  let changed = false;
  if (admin.role !== 'admin') {
    admin.role = 'admin';
    changed = true;
  }
  const passwordOk = await admin.comparePassword(ADMIN_PASSWORD);
  if (!passwordOk) {
    admin.password = ADMIN_PASSWORD;
    changed = true;
    console.log(`🔑 Admin password reset → ${ADMIN_EMAIL}`);
  }
  if (changed) await admin.save();
  console.log(`✅ Admin ready → ${ADMIN_EMAIL}`);
}