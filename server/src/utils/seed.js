import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Astrologer from '../models/Astrologer.js';
import Product from '../models/Product.js';
import Blog from '../models/Blog.js';
import Consultation from '../models/Consultation.js';
import WalletTransaction from '../models/WalletTransaction.js';
import PlatformSettings from '../models/PlatformSettings.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import Referral from '../models/Referral.js';
import Appointment from '../models/Appointment.js';
import Withdrawal from '../models/Withdrawal.js';
import Notification from '../models/Notification.js';
import Content from '../models/Content.js';
import AstrologerPackage from '../models/AstrologerPackage.js';
import { generateReferralCode } from './helpers.js';

dotenv.config();

const DEMO_EMAILS = [
  'demo@user.com', 'demo@astro.com', 'admin@panel.com',
  'rahul@test.com', 'priya@test.com', 'amit@test.com',
  'pending@astro.com',
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is missing in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected for seeding');

    console.log('🧹 Clearing old demo data...');
    const demoUsers = await User.find({ email: { $in: DEMO_EMAILS } }).select('_id');
    const demoUserIds = demoUsers.map(u => u._id);

    await Promise.all([
      Astrologer.deleteMany({}),
      Product.deleteMany({}),
      Blog.deleteMany({}),
      Consultation.deleteMany({}),
      WalletTransaction.deleteMany({ user_id: { $in: demoUserIds } }),
      Review.deleteMany({}),
      Coupon.deleteMany({}),
      Referral.deleteMany({}),
      Appointment.deleteMany({}),
      Withdrawal.deleteMany({}),
      Notification.deleteMany({ user_id: { $in: demoUserIds } }),
      Content.deleteMany({}),
      AstrologerPackage.deleteMany({}),
      User.deleteMany({ email: { $in: DEMO_EMAILS } }),
    ]);

    // ============================================
    // 1. Platform Settings
    // ============================================
    await PlatformSettings.deleteMany({});
    await PlatformSettings.create({
      key: 'global',
      free_trial_minutes: 5,
      platform_commission_percent: 30,
      min_chat_price: 5,
      max_chat_price: 100,
      min_audio_price: 10,
      max_audio_price: 150,
      min_video_price: 15,
      max_video_price: 200,
      referral_bonus: 50,
      signup_bonus: 100,
    });
    console.log('✅ Platform settings seeded');

    // ============================================
    // 2. Astrologer Profiles
    // ============================================
    const astrologers = await Astrologer.insertMany([
      {
        full_name: 'Acharya Rajesh Kumar',
        avatar_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
        expertise: ['Vedic Astrology', 'Kundli Matching', 'Career'],
        languages: ['Hindi', 'English'],
        skills: ['Marriage', 'Career', 'Health'],
        experience: 15,
        bio: 'Expert in Vedic astrology with 15+ years of experience. Specializes in marriage and career guidance.',
        education: 'M.A. Astrology, Banaras Hindu University',
        chat_price: 20, call_price: 30, video_price: 50,
        rating: 4.8, total_reviews: 1250, total_consultations: 3500,
        total_earnings: 87500, wallet_balance: 12400,
        is_online: true, is_verified: true, is_available: true,
        availability_status: 'online', approval_status: 'approved',
        is_featured: true, is_new: false,
        available_slots: [
          { day: 'Monday', start_time: '09:00', end_time: '18:00' },
          { day: 'Wednesday', start_time: '10:00', end_time: '20:00' },
        ],
      },
      {
        full_name: 'Dr. Priya Sharma',
        avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
        expertise: ['Numerology', 'Tarot', 'Vastu'],
        languages: ['English', 'Hindi'],
        skills: ['Love', 'Finance', 'Vastu'],
        experience: 12,
        bio: 'PhD in Astrology. Expert numerologist and tarot reader with 12+ years experience.',
        chat_price: 25, call_price: 35, video_price: 55,
        rating: 4.9, total_reviews: 980, total_consultations: 2100,
        total_earnings: 62000, wallet_balance: 8900,
        is_online: true, is_verified: true, is_available: true,
        availability_status: 'online', approval_status: 'approved',
        is_featured: true, is_new: false,
      },
      {
        full_name: 'Pt. Anand Shastri',
        avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
        expertise: ['Lal Kitab', 'Remedies', 'Palmistry'],
        languages: ['Hindi'],
        skills: ['Remedies', 'Palmistry', 'Dosha'],
        experience: 20,
        bio: 'Renowned Lal Kitab expert with deep knowledge of remedies and palmistry.',
        chat_price: 18, call_price: 28, video_price: 45,
        rating: 4.7, total_reviews: 2100, total_consultations: 5200,
        total_earnings: 95000, wallet_balance: 15200,
        is_online: false, is_verified: true, is_available: true,
        availability_status: 'offline', approval_status: 'approved',
        is_featured: false, is_new: false,
      },
      {
        full_name: 'Guru Ramesh Iyer',
        avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
        expertise: ['Vedic Astrology', 'Kundli', 'Muhurat'],
        languages: ['Tamil', 'English', 'Hindi'],
        skills: ['Muhurat', 'Kundli', 'Marriage'],
        experience: 25,
        bio: 'South Indian Vedic astrology expert. Master of Muhurat and detailed Kundli analysis.',
        chat_price: 35, call_price: 45, video_price: 65,
        rating: 4.9, total_reviews: 3200, total_consultations: 7500,
        total_earnings: 142000, wallet_balance: 22100,
        is_online: true, is_verified: true, is_available: true,
        availability_status: 'busy', approval_status: 'approved',
        is_featured: true, is_new: false,
      },
      {
        full_name: 'Meera Joshi',
        avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
        expertise: ['Tarot', 'Love & Relationships'],
        languages: ['Hindi', 'English', 'Marathi'],
        skills: ['Love', 'Relationships'],
        experience: 6,
        bio: 'Young and intuitive tarot reader specializing in love and relationship guidance.',
        chat_price: 10, call_price: 15, video_price: 20,
        rating: 4.6, total_reviews: 180, total_consultations: 420,
        total_earnings: 8400, wallet_balance: 2100,
        is_online: true, is_verified: true, is_available: true,
        availability_status: 'online', approval_status: 'approved',
        is_featured: false, is_new: true,
      },
      {
        full_name: 'Vikram Singh (Pending)',
        avatar_url: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=300',
        expertise: ['Vedic Astrology'],
        languages: ['Hindi', 'Punjabi'],
        experience: 3,
        bio: 'New astrologer awaiting admin approval.',
        chat_price: 10, call_price: 15, video_price: 20,
        rating: 0, total_reviews: 0, total_consultations: 0,
        is_online: false, is_verified: false, is_available: false,
        availability_status: 'offline', approval_status: 'pending',
        is_new: true,
        documents: {
          aadhaar_url: 'https://via.placeholder.com/400x250?text=Aadhaar',
          pan_url: 'https://via.placeholder.com/400x250?text=PAN',
          certificate_url: 'https://via.placeholder.com/400x250?text=Certificate',
        },
      },
    ]);
    console.log(`✅ ${astrologers.length} astrologers seeded`);

    // ============================================
    // 3. Astrologer Packages
    // ============================================
    await AstrologerPackage.insertMany([
      { astrologer_id: astrologers[0]._id, name: 'Quick Chat', duration_minutes: 5, price: 49, type: 'chat' },
      { astrologer_id: astrologers[0]._id, name: 'Standard Session', duration_minutes: 10, price: 99, type: 'all' },
      { astrologer_id: astrologers[0]._id, name: 'Deep Dive', duration_minutes: 15, price: 149, type: 'all' },
      { astrologer_id: astrologers[0]._id, name: 'Premium Consultation', duration_minutes: 30, price: 299, type: 'video' },
      { astrologer_id: astrologers[1]._id, name: '5 Min Tarot', duration_minutes: 5, price: 59, type: 'chat' },
      { astrologer_id: astrologers[1]._id, name: '15 Min Reading', duration_minutes: 15, price: 149, type: 'all' },
      { astrologer_id: astrologers[4]._id, name: 'Love Reading', duration_minutes: 10, price: 49, type: 'chat' },
    ]);
    console.log('✅ Astrologer packages seeded');

    // ============================================
    // 4. Demo User Accounts
    // ============================================
    const DEMO_PASSWORD = 'demo1234';

    const demoUser = await User.create({
      full_name: 'Demo User',
      email: 'demo@user.com',
      password: DEMO_PASSWORD,
      phone: '9876543210',
      gender: 'male',
      date_of_birth: new Date('1995-03-15'),
      birth_time: '10:30',
      birth_place: 'New Delhi, India',
      wallet_balance: 2450,
      role: 'user',
      referral_code: generateReferralCode('DEMO'),
      free_trial_used: false,
      free_minutes_remaining: 5,
    });

    const demoAstroUser = await User.create({
      full_name: 'Demo Astrologer',
      email: 'demo@astro.com',
      password: DEMO_PASSWORD,
      phone: '9876543211',
      wallet_balance: 500,
      role: 'astrologer',
      astrologer_profile_id: astrologers[0]._id,
      referral_code: generateReferralCode('ASTRO'),
    });

    const demoAdmin = await User.create({
      full_name: 'Platform Admin',
      email: 'admin@panel.com',
      password: DEMO_PASSWORD,
      wallet_balance: 0,
      role: 'admin',
    });

    const rahul = await User.create({
      full_name: 'Rahul Verma',
      email: 'rahul@test.com',
      password: DEMO_PASSWORD,
      phone: '9123456780',
      gender: 'male',
      wallet_balance: 850,
      role: 'user',
      referral_code: generateReferralCode('RAHU'),
      referred_by: demoUser._id,
      free_trial_used: true,
    });

    const priya = await User.create({
      full_name: 'Priya Nair',
      email: 'priya@test.com',
      password: DEMO_PASSWORD,
      phone: '9123456781',
      gender: 'female',
      wallet_balance: 1200,
      role: 'user',
      referral_code: generateReferralCode('PRIY'),
      free_trial_used: false,
      free_minutes_remaining: 5,
    });

    const amit = await User.create({
      full_name: 'Amit Kapoor',
      email: 'amit@test.com',
      password: DEMO_PASSWORD,
      wallet_balance: 350,
      role: 'user',
      referral_code: generateReferralCode('AMIT'),
      free_trial_used: true,
    });

    const pendingAstroUser = await User.create({
      full_name: 'Vikram Singh',
      email: 'pending@astro.com',
      password: DEMO_PASSWORD,
      role: 'astrologer',
      astrologer_profile_id: astrologers[5]._id,
      referral_code: generateReferralCode('VIKR'),
    });

    console.log('✅ Demo accounts created');

    // ============================================
    // 5. Consultations
    // ============================================
    const now = new Date();

    const pastChat = await Consultation.create({
      user_id: demoUser._id,
      astrologer_id: astrologers[1]._id,
      type: 'chat',
      status: 'completed',
      duration_minutes: 18,
      duration_seconds: 1080,
      total_amount: 450,
      billed_amount: 450,
      astro_earnings: 315,
      platform_commission: 135,
      per_minute_rate: 25,
      free_minutes_used: 5,
      is_free_trial: true,
      started_at: new Date(now.getTime() - 1000 * 60 * 30),
      ended_at: new Date(now.getTime() - 1000 * 60 * 12),
      rating: 5,
      review: 'Very accurate reading. Helped me a lot with career decisions.',
      messages: [
        { sender_id: demoUser._id, sender_role: 'user', text: 'Hello mam, I wanted to discuss my career options.', timestamp: new Date(now.getTime() - 1000 * 60 * 25) },
        { sender_id: astrologers[1]._id, sender_role: 'astrologer', text: 'Namaste! Please share your birth details.', timestamp: new Date(now.getTime() - 1000 * 60 * 24) },
        { sender_id: demoUser._id, sender_role: 'user', text: 'My DOB is 15 March 1995, 10:30 AM, Delhi.', timestamp: new Date(now.getTime() - 1000 * 60 * 20) },
        { sender_id: astrologers[1]._id, sender_role: 'astrologer', text: 'You have strong Saturn influence. Next 2 years are good for growth in tech.', timestamp: new Date(now.getTime() - 1000 * 60 * 15) },
        { sender_id: demoUser._id, sender_role: 'user', text: 'Thank you so much! This is very helpful 🙏', type: 'emoji', timestamp: new Date(now.getTime() - 1000 * 60 * 12) },
      ],
    });

    await Consultation.insertMany([
      {
        user_id: demoUser._id, astrologer_id: astrologers[0]._id,
        type: 'video', status: 'completed',
        duration_minutes: 12, duration_seconds: 720,
        total_amount: 600, billed_amount: 600, astro_earnings: 420, platform_commission: 180,
        per_minute_rate: 50, started_at: new Date(now.getTime() - 1000 * 60 * 60 * 24),
        ended_at: new Date(now.getTime() - 1000 * 60 * 60 * 23), rating: 4,
        review: 'Good session, video was clear.',
      },
      {
        user_id: rahul._id, astrologer_id: astrologers[2]._id,
        type: 'call', status: 'completed',
        duration_minutes: 8, billed_amount: 224, astro_earnings: 157, platform_commission: 67,
        per_minute_rate: 28, rating: 5, review: 'Lal Kitab remedies worked wonders!',
      },
      {
        user_id: priya._id, astrologer_id: astrologers[4]._id,
        type: 'chat', status: 'completed',
        duration_minutes: 15, billed_amount: 150, astro_earnings: 105, platform_commission: 45,
        per_minute_rate: 10, rating: 4, review: 'Nice tarot reading for my relationship.',
      },
      {
        user_id: demoUser._id, astrologer_id: astrologers[0]._id,
        type: 'chat', status: 'pending', per_minute_rate: 20,
        messages: [
          { sender_id: demoUser._id, sender_role: 'user', text: 'Sir, I want to know about marriage timing this year.', timestamp: new Date(now.getTime() - 1000 * 60 * 8) },
        ],
      },
      {
        user_id: amit._id, astrologer_id: astrologers[0]._id,
        type: 'video', status: 'pending', per_minute_rate: 50,
        messages: [
          { sender_id: amit._id, sender_role: 'user', text: 'Need urgent guidance on property purchase.', timestamp: new Date(now.getTime() - 1000 * 60 * 2) },
        ],
      },
    ]);

    console.log('✅ Consultations seeded');

    // ============================================
    // 6. Reviews
    // ============================================
    await Review.insertMany([
      { user_id: demoUser._id, astrologer_id: astrologers[1]._id, consultation_id: pastChat._id, rating: 5, comment: 'Very accurate reading. Helped me a lot with career decisions.', consultation_type: 'chat' },
      { user_id: demoUser._id, astrologer_id: astrologers[0]._id, rating: 4, comment: 'Good video session. Clear explanations about planetary positions.', consultation_type: 'video' },
      { user_id: rahul._id, astrologer_id: astrologers[2]._id, rating: 5, comment: 'Lal Kitab remedies are amazing. Highly recommended!', consultation_type: 'call' },
      { user_id: priya._id, astrologer_id: astrologers[4]._id, rating: 4, comment: 'Sweet and accurate tarot reading. Will consult again.', consultation_type: 'chat' },
      { user_id: amit._id, astrologer_id: astrologers[3]._id, rating: 5, comment: 'Best muhurat calculation. Wedding went perfectly!', consultation_type: 'video' },
      { user_id: rahul._id, astrologer_id: astrologers[0]._id, rating: 5, comment: 'Acharya ji is very knowledgeable. 15 years experience shows.', consultation_type: 'chat' },
      { user_id: priya._id, astrologer_id: astrologers[1]._id, rating: 5, comment: 'Dr. Priya\'s numerology reading was spot on!', consultation_type: 'chat' },
    ]);
    console.log('✅ Reviews seeded');

    // ============================================
    // 7. Wallet Transactions
    // ============================================
    await WalletTransaction.insertMany([
      { user_id: demoUser._id, type: 'credit', amount: 100, balance_after: 100, reference_type: 'recharge', description: 'Signup bonus', payment_method: 'system' },
      { user_id: demoUser._id, type: 'credit', amount: 1000, balance_after: 1100, reference_type: 'recharge', description: 'Wallet recharge via UPI', payment_method: 'upi', payment_id: 'pay_demo_001' },
      { user_id: demoUser._id, type: 'debit', amount: 450, balance_after: 650, reference_type: 'consultation', description: 'Chat with Dr. Priya Sharma (18 min)' },
      { user_id: demoUser._id, type: 'debit', amount: 600, balance_after: 50, reference_type: 'consultation', description: 'Video call with Acharya Rajesh Kumar' },
      { user_id: demoUser._id, type: 'credit', amount: 2000, balance_after: 2050, reference_type: 'recharge', description: 'Wallet recharge via Razorpay', payment_method: 'razorpay', payment_id: 'pay_demo_002' },
      { user_id: demoUser._id, type: 'credit', amount: 400, balance_after: 2450, reference_type: 'recharge', description: 'Wallet recharge via Debit Card', payment_method: 'debit_card' },
      { user_id: rahul._id, type: 'credit', amount: 100, balance_after: 100, reference_type: 'recharge', description: 'Signup bonus' },
      { user_id: rahul._id, type: 'credit', amount: 50, balance_after: 150, reference_type: 'referral', description: 'Referral bonus using DEMO code' },
      { user_id: rahul._id, type: 'credit', amount: 800, balance_after: 950, reference_type: 'recharge', description: 'UPI recharge', payment_method: 'upi' },
      { user_id: rahul._id, type: 'debit', amount: 100, balance_after: 850, reference_type: 'consultation', description: 'Audio call with Pt. Anand Shastri' },
      { user_id: priya._id, type: 'credit', amount: 100, balance_after: 100, reference_type: 'recharge', description: 'Signup bonus' },
      { user_id: priya._id, type: 'credit', amount: 1200, balance_after: 1300, reference_type: 'recharge', description: 'Net Banking recharge', payment_method: 'net_banking' },
      { user_id: priya._id, type: 'debit', amount: 100, balance_after: 1200, reference_type: 'consultation', description: 'Chat with Meera Joshi' },
      { user_id: amit._id, type: 'credit', amount: 100, balance_after: 100, reference_type: 'recharge', description: 'Signup bonus' },
      { user_id: amit._id, type: 'credit', amount: 500, balance_after: 600, reference_type: 'recharge', description: 'Credit Card recharge', payment_method: 'credit_card' },
      { user_id: amit._id, type: 'debit', amount: 250, balance_after: 350, reference_type: 'consultation', description: 'Video with Guru Ramesh Iyer' },
      { user_id: demoUser._id, type: 'credit', amount: 50, balance_after: 2500, reference_type: 'referral', description: 'Referral reward for inviting Rahul Verma' },
    ]);
    console.log('✅ Wallet transactions seeded');

    // ============================================
    // 8. Coupons
    // ============================================
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    await Coupon.insertMany([
      { code: 'WELCOME50', type: 'fixed', value: 50, min_order_value: 100, usage_limit: 500, used_count: 42, valid_from: new Date(), valid_until: nextYear, applicable_to: 'wallet' },
      { code: 'ASTRO20', type: 'percentage', value: 20, min_order_value: 200, max_discount: 100, usage_limit: 200, used_count: 18, valid_from: new Date(), valid_until: nextMonth, applicable_to: 'wallet' },
      { code: 'FIRST100', type: 'fixed', value: 100, min_order_value: 500, usage_limit: 100, used_count: 7, valid_from: new Date(), valid_until: nextYear, applicable_to: 'all' },
      { code: 'DIWALI25', type: 'percentage', value: 25, min_order_value: 300, max_discount: 200, usage_limit: 50, used_count: 0, valid_from: new Date(), valid_until: nextMonth, is_active: true, applicable_to: 'order' },
    ]);
    console.log('✅ Coupons seeded');

    // ============================================
    // 9. Referrals
    // ============================================
    await Referral.create({
      referrer_id: demoUser._id,
      referred_id: rahul._id,
      referral_code: demoUser.referral_code,
      bonus_amount: 50,
      status: 'credited',
    });
    console.log('✅ Referrals seeded');

    // ============================================
    // 10. Appointments
    // ============================================
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    await Appointment.insertMany([
      { user_id: demoUser._id, astrologer_id: astrologers[0]._id, type: 'video', scheduled_date: tomorrow, scheduled_time: '10:00', duration_minutes: 30, status: 'confirmed', notes: 'Marriage consultation' },
      { user_id: priya._id, astrologer_id: astrologers[1]._id, type: 'chat', scheduled_date: dayAfter, scheduled_time: '15:30', duration_minutes: 15, status: 'confirmed' },
      { user_id: rahul._id, astrologer_id: astrologers[3]._id, type: 'call', scheduled_date: tomorrow, scheduled_time: '18:00', duration_minutes: 20, status: 'pending' },
    ]);
    console.log('✅ Appointments seeded');

    // ============================================
    // 11. Withdrawals
    // ============================================
    await Withdrawal.insertMany([
      { astrologer_id: astrologers[0]._id, user_id: demoAstroUser._id, amount: 5000, method: 'upi', account_details: { upi_id: 'demoastro@upi', account_holder: 'Demo Astrologer' }, status: 'completed', processed_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3) },
      { astrologer_id: astrologers[0]._id, user_id: demoAstroUser._id, amount: 3000, method: 'bank', account_details: { account_number: '1234567890', ifsc: 'HDFC0001234', bank_name: 'HDFC Bank', account_holder: 'Demo Astrologer' }, status: 'pending' },
      { astrologer_id: astrologers[1]._id, user_id: demoAstroUser._id, amount: 2000, method: 'upi', account_details: { upi_id: 'priya@upi' }, status: 'processing' },
    ]);
    console.log('✅ Withdrawals seeded');

    // ============================================
    // 12. Notifications
    // ============================================
    await Notification.insertMany([
      { user_id: demoUser._id, title: 'Welcome to Celestial Guidance!', message: 'You got ₹100 signup bonus in your wallet. Start your free 5-min chat now!', type: 'promo', action_url: '/astrologers' },
      { user_id: demoUser._id, title: 'Booking Confirmed', message: 'Your video appointment with Acharya Rajesh Kumar is confirmed for tomorrow 10:00 AM.', type: 'booking', action_url: '/dashboard' },
      { user_id: demoUser._id, title: 'Wallet Recharged', message: '₹2000 added to your wallet via Razorpay.', type: 'wallet', is_read: true, action_url: '/wallet' },
      { user_id: demoUser._id, title: 'New Astrologer Online', message: 'Meera Joshi is now online for love & relationship readings!', type: 'promo' },
      { user_id: demoAstroUser._id, title: 'New Consultation Request', message: 'Demo User wants a chat consultation.', type: 'consultation', action_url: '/astro' },
      { user_id: demoAstroUser._id, title: 'Withdrawal Completed', message: 'Your withdrawal of ₹5000 has been processed.', type: 'withdrawal', is_read: true },
      { user_id: priya._id, title: 'Appointment Reminder', message: 'Your chat with Dr. Priya Sharma is scheduled for day after tomorrow at 3:30 PM.', type: 'booking' },
      { user_id: rahul._id, title: 'Referral Bonus!', message: 'You earned ₹50 referral bonus using a friend\'s code.', type: 'wallet', is_read: true },
    ]);
    console.log('✅ Notifications seeded');

    // ============================================
    // 13. Content (Banners, FAQ, Terms)
    // ============================================
    await Content.insertMany([
      { type: 'banner', title: 'First 5 Minutes FREE!', content: 'Chat with any astrologer — your first consultation is on us.', image_url: 'https://images.pexels.com/photos/266026/pexels-photo-266026.jpeg?auto=compress&cs=tinysrgb&w=1200', link_url: '/astrologers', sort_order: 1 },
      { type: 'banner', title: 'Top Rated Astrologers', content: 'Connect with 4.8+ rated experts for accurate guidance.', image_url: 'https://images.pexels.com/photos/73873/star-clusters-73873.jpeg?auto=compress&cs=tinysrgb&w=1200', link_url: '/astrologers?category=top-rated', sort_order: 2 },
      { type: 'banner', title: 'Get ₹100 Signup Bonus', content: 'Register today and get instant wallet credit.', image_url: 'https://images.pexels.com/photos/1452594/pexels-photo-1452594.jpeg?auto=compress&cs=tinysrgb&w=1200', link_url: '/auth/register', sort_order: 3 },
      { type: 'faq', title: 'How does free consultation work?', content: 'Every new user gets 5 minutes of free chat with any astrologer. After that, per-minute charges apply from your wallet.', sort_order: 1 },
      { type: 'faq', title: 'How to recharge wallet?', content: 'Go to Wallet page and recharge via UPI, Razorpay, Debit/Credit Card, or Net Banking. Minimum recharge is ₹100.', sort_order: 2 },
      { type: 'faq', title: 'How to become an astrologer?', content: 'Register as Astrologer, upload your documents (Aadhaar, PAN, Certificate). Admin will verify within 24-48 hours.', sort_order: 3 },
      { type: 'faq', title: 'What is the refund policy?', content: 'If a consultation is disconnected due to technical issues, contact support within 24 hours for a full refund.', sort_order: 4 },
      { type: 'terms', title: 'Terms & Conditions', content: 'By using Celestial Guidance, you agree to our terms of service. Consultations are for guidance purposes only and should not replace professional advice.', sort_order: 1 },
      { type: 'privacy', title: 'Privacy Policy', content: 'We protect your personal data including birth details. Data is encrypted and never shared with third parties without consent.', sort_order: 1 },
    ]);
    console.log('✅ Content (banners, FAQ, terms) seeded');

    // ============================================
    // 14. Products & Blogs
    // ============================================
    await Product.insertMany([
      { name: 'Original Yellow Sapphire (Pukhraj) - 5.25 Ratti', category: 'Gemstones', price: 15000, original_price: 18000, images: ['https://images.pexels.com/photos/1452594/pexels-photo-1452594.jpeg?auto=compress&cs=tinysrgb&w=600'], stock: 25, rating: 4.8, total_reviews: 45, short_description: 'Certified natural Pukhraj for Jupiter' },
      { name: '5 Mukhi Rudraksha - Premium Quality', category: 'Rudraksha', price: 2500, original_price: 3000, images: ['https://images.pexels.com/photos/209620/pexels-photo-209620.jpeg?auto=compress&cs=tinysrgb&w=600'], stock: 50, rating: 4.7, total_reviews: 89 },
      { name: 'Shree Yantra - Pure Copper', category: 'Yantras', price: 3500, original_price: 4000, images: ['https://images.pexels.com/photos/373968/pexels-photo-373968.jpeg?auto=compress&cs=tinysrgb&w=600'], stock: 30, rating: 4.9, total_reviews: 120 },
      { name: 'Blue Sapphire (Neelam) - 4.5 Ratti', category: 'Gemstones', price: 22000, original_price: 25000, images: ['https://images.pexels.com/photos/1452594/pexels-photo-1452594.jpeg?auto=compress&cs=tinysrgb&w=600'], stock: 15, rating: 4.6, total_reviews: 34 },
      { name: '7 Mukhi Rudraksha - Goddess Lakshmi', category: 'Rudraksha', price: 4500, original_price: 5500, images: ['https://images.pexels.com/photos/209620/pexels-photo-209620.jpeg?auto=compress&cs=tinysrgb&w=600'], stock: 35, rating: 4.8, total_reviews: 56 },
      { name: 'Red Coral (Moonga) - 6 Ratti', category: 'Gemstones', price: 8500, original_price: 10000, images: ['https://images.pexels.com/photos/1452594/pexels-photo-1452594.jpeg?auto=compress&cs=tinysrgb&w=600'], stock: 20, rating: 4.5, total_reviews: 28 },
    ]);

    await Blog.insertMany([
      { title: 'Understanding Your Birth Chart: A Beginner\'s Guide', slug: 'understanding-birth-chart-guide', excerpt: 'Learn the basics of Kundli reading and how planetary positions influence your life.', content: '<h2>Introduction to Birth Charts</h2><p>A birth chart is a snapshot of the sky at the exact moment of your birth. It reveals your personality, strengths, challenges, and life path...</p><h3>The 12 Houses</h3><p>Each house represents a different area of life — career, marriage, health, wealth...</p>', category: 'Vedic Astrology', tags: ['kundli', 'beginners'], image_url: 'https://images.pexels.com/photos/266026/pexels-photo-266026.jpeg?auto=compress&cs=tinysrgb&w=800', author_name: 'Dr. Priya Sharma', read_time: '8 min', status: 'published' },
      { title: 'Mercury Retrograde: What It Really Means', slug: 'mercury-retrograde-explained', excerpt: 'Debunking myths about Mercury retrograde and how to navigate it.', content: '<h2>What is Mercury Retrograde?</h2><p>Mercury retrograde is an optical illusion where Mercury appears to move backward. In astrology, it affects communication, travel, and technology...</p>', category: 'Planets', tags: ['mercury retrograde'], image_url: 'https://images.pexels.com/photos/73873/star-clusters-73873.jpeg?auto=compress&cs=tinysrgb&w=800', author_name: 'Acharya Rajesh Kumar', read_time: '5 min', status: 'published' },
      { title: 'Choosing the Right Gemstone for Your Horoscope', slug: 'choosing-right-gemstone', excerpt: 'How to select gemstones based on your birth chart for maximum benefit.', content: '<h2>Gemstones in Vedic Astrology</h2><p>Each planet has a corresponding gemstone that strengthens its positive influence...</p>', category: 'Remedies', tags: ['gemstones', 'remedies'], image_url: 'https://images.pexels.com/photos/1452594/pexels-photo-1452594.jpeg?auto=compress&cs=tinysrgb&w=800', author_name: 'Pt. Anand Shastri', read_time: '6 min', status: 'published' },
      { title: '5 Zodiac Signs Most Compatible for Marriage in 2026', slug: 'zodiac-marriage-compatibility-2026', excerpt: 'Discover which zodiac pairings have the strongest marriage compatibility this year.', content: '<h2>Love & Marriage in 2026</h2><p>Jupiter\'s transit brings favorable conditions for certain zodiac combinations...</p>', category: 'Love & Relationships', tags: ['marriage', 'compatibility'], image_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800', author_name: 'Meera Joshi', read_time: '7 min', status: 'published' },
      { title: 'Lal Kitab Remedies for Financial Prosperity', slug: 'lal-kitab-financial-remedies', excerpt: 'Simple Lal Kitab remedies to attract wealth and remove financial obstacles.', content: '<h2>Lal Kitab for Wealth</h2><p>Lal Kitab offers practical remedies that don\'t require expensive gemstones...</p>', category: 'Remedies', tags: ['lal kitab', 'finance'], image_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800', author_name: 'Pt. Anand Shastri', read_time: '10 min', status: 'published' },
    ]);
    console.log('✅ Products and blogs seeded');

    // ============================================
    // DONE
    // ============================================
    console.log('\n🎉 ============================================');
    console.log('✅ ALL DUMMY DATA SEEDED SUCCESSFULLY!');
    console.log('============================================\n');
    console.log('📧 Demo Logins (password for all = demo1234):\n');
    console.log('  👤 User:       demo@user.com     (₹2450 wallet, free trial available)');
    console.log('  👤 User:       rahul@test.com    (₹850 wallet, used referral)');
    console.log('  👤 User:       priya@test.com    (₹1200 wallet, free trial available)');
    console.log('  👤 User:       amit@test.com     (₹350 wallet)');
    console.log('  🔮 Astrologer: demo@astro.com    (Acharya Rajesh Kumar profile)');
    console.log('  🔮 Pending:    pending@astro.com (awaiting admin approval)');
    console.log('  🛡️  Admin:      admin@panel.com\n');
    console.log('🎟️  Coupon codes: WELCOME50 | ASTRO20 | FIRST100 | DIWALI25');
    console.log('🔗 Referral code (demo user): ' + demoUser.referral_code);
    console.log('\nRun: npm run dev → http://localhost:5173/get-started\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();