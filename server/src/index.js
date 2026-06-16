import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.js';
import astrologerRoutes from './routes/astrologers.js';
import productRoutes from './routes/products.js';
import consultationRoutes from './routes/consultations.js';
import blogRoutes from './routes/blogs.js';
import walletRoutes from './routes/wallet.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import reviewRoutes from './routes/reviews.js';
import couponRoutes from './routes/coupons.js';
import referralRoutes from './routes/referrals.js';
import appointmentRoutes from './routes/appointments.js';
import withdrawalRoutes from './routes/withdrawals.js';
import notificationRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import contentRoutes from './routes/content.js';
import applicationRoutes from './routes/applications.js';
import { processMinuteBilling } from './utils/billing.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

function normalizeOrigin(url) {
  if (!url) return null;
  try {
    return new URL(url.trim()).origin;
  } catch {
    return url.trim().replace(/\/$/, '');
  }
}

// FRONTEND_URL or FRONTEND_URLS (comma-separated) for production CORS
const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URLS,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map(normalizeOrigin)
    .filter(Boolean)
);

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.has(normalized)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;

  // Render deploys: allow frontend/backend *.onrender.com in production
  if (
    process.env.NODE_ENV === 'production' &&
    /^https:\/\/[\w-]+\.onrender\.com$/.test(normalized)
  ) {
    return true;
  }

  return false;
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, origin || true);
      return;
    }
    console.warn(`CORS blocked for origin: ${origin}`);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

// Socket.io setup for real-time chat + video signaling
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Basic Socket.io chat & signaling
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Join role-based panel rooms for live data refresh (user / astro / admin)
  socket.on('join_panel', ({ userId, role, astrologerProfileId }) => {
    if (userId) socket.join(`user_${String(userId)}`);
    if (role === 'admin') socket.join('admin_panel');
    if (role === 'astrologer') socket.join('astrologers_live');
    if (astrologerProfileId) socket.join(`astro_${String(astrologerProfileId)}`);
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    console.log(`Socket ${socket.id} joined panel rooms`, { userId, role, astrologerProfileId, rooms });
  });

  // Join a consultation room (chat / video room)
  socket.on('join_room', (payload) => {
    const roomId = typeof payload === 'string'
      ? payload
      : payload?.consultationId;
    const role = typeof payload === 'object' ? payload?.role : undefined;
    if (!roomId) return;
    socket.join(String(roomId));
    if (role) socket.data.role = role;
    socket.to(String(roomId)).emit('participant_joined', {
      consultationId: String(roomId),
      role: role || socket.data.role || 'unknown',
    });
    console.log(`Socket ${socket.id} joined room ${roomId}`, { role: socket.data.role });
  });

  // Leave room
  socket.on('leave_room', (consultationId) => {
    socket.leave(consultationId);
  });

  // Legacy socket-only chat (prefer POST /consultations/:id/message which persists + broadcasts once)
  socket.on('send_message', ({ consultationId, message, sender }) => {
    io.to(String(consultationId)).emit('receive_message', {
      consultationId: String(consultationId),
      message,
      sender,
      timestamp: new Date().toISOString(),
    });
  });

  // WebRTC signaling
  socket.on('offer', ({ consultationId, offer }) => {
    socket.to(consultationId).emit('offer', { offer });
  });

  socket.on('answer', ({ consultationId, answer }) => {
    socket.to(consultationId).emit('answer', { answer });
  });

  socket.on('ice_candidate', ({ consultationId, candidate }) => {
    socket.to(consultationId).emit('ice_candidate', { candidate });
  });

  // Consultation status updates (live)
  socket.on('consultation_status', ({ consultationId, status }) => {
    io.to(consultationId).emit('consultation_status_update', { consultationId, status });
  });

  // Per-minute billing tick
  socket.on('start_billing', async ({ consultationId }) => {
    socket.join(consultationId);
    const billingIntervals = socket.billingIntervals || {};
    if (billingIntervals[consultationId]) return;
    billingIntervals[consultationId] = setInterval(async () => {
      await processMinuteBilling(consultationId, io);
    }, 60000);
    socket.billingIntervals = billingIntervals;
    await processMinuteBilling(consultationId, io);
  });

  socket.on('stop_billing', ({ consultationId }) => {
    const billingIntervals = socket.billingIntervals || {};
    if (billingIntervals[consultationId]) {
      clearInterval(billingIntervals[consultationId]);
      delete billingIntervals[consultationId];
    }
  });

  // Typing indicator
  socket.on('typing', ({ consultationId, user, role }) => {
    socket.to(consultationId).emit('typing_indicator', { consultationId, user, role });
  });

  // Incoming call signaling — room + astrologers_live for panel alerts
  socket.on('call_request', ({ consultationId, type }) => {
    const roomId = String(consultationId);
    io.to(roomId).emit('incoming_call', { consultationId: roomId, type });
    io.to('astrologers_live').emit('incoming_call', { consultationId: roomId, type });
  });

  socket.on('call_accept', ({ consultationId }) => {
    io.to(consultationId).emit('call_accepted', { consultationId });
  });

  socket.on('call_reject', ({ consultationId }) => {
    io.to(consultationId).emit('call_rejected', { consultationId });
  });

  socket.on('disconnect', () => {
    const billingIntervals = socket.billingIntervals || {};
    Object.values(billingIntervals).forEach(clearInterval);
    console.log('Socket disconnected:', socket.id);
  });
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Make io available to routes if needed
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/astrologers', astrologerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/applications', applicationRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Celestial Guidance API',
    health: '/api/health',
    apiBase: '/api',
  });
});

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Celestial Guidance API running' });
});

// Serve React build in production (optional combined deploy)
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Connect DB and start
const start = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is required in .env');
      process.exit(1);
    }
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is required in .env');
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    httpServer.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
      console.log(`   API base: http://localhost:${PORT}/api`);
      console.log(`   Socket.io ready for real-time chat & video`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
