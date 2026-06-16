# Celestial Guidance - Express + MongoDB Backend

## Project Structure (Clean)
project/
├── client/     ← Entire React frontend (Vite)
├── server/     ← Entire Express + MongoDB backend
└── package.json (root scripts to run both)

## Quick Local Setup

From the **project root**:

```bash
# 1. Install both sides
npm run install:all

# 2. Setup backend env + seed data (IMPORTANT)
cd server

# Copy example and create your real .env
cp .env.example .env

# === NOW EDIT server/.env ===
# I have already put your exact MongoDB URL in .env.example.
# Just make sure MONGODB_URI is set to your connection string (password is already there).

# Also set a strong JWT_SECRET (for security)

npm run seed
# This will automatically INSERT into YOUR cluster:
#   • 4 detailed astrologers (with pricing, photos, etc.)
#   • Demo accounts for all 3 panels
#   • Multiple consultations WITH real chat message history (ready to test live chat/video rooms immediately)
#   • Wallet transactions
#   • Products + Blogs
cd ..

# 3. Run everything
npm run dev:full
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

In `client/.env` (create from .env.example):
```
VITE_API_URL=http://localhost:5000/api
```

## Available Root Scripts
- `npm run dev:full`     → Run client + server together
- `npm run dev:client`
- `npm run dev:server`
- `npm run install:all`
- `npm run build`        → Builds client
- `npm run seed`         → Seeds Mongo data

## Deploy

### Backend on Render (Web Service)
- Root Directory: `server`
- Build: `npm install`
- Start: `npm start`
- Set envs: MONGODB_URI, JWT_SECRET, FRONTEND_URL

### Frontend on Render (Static Site)
- Root Directory: `client`
- Build: `npm install && npm run build`
- Publish: `dist`
- Env: VITE_API_URL = your backend URL

CORS in server is set to allow your frontend.

All good. Backend is 100% in server/, frontend is 100% in client/.
