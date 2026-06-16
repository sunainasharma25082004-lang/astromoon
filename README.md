# Celestial Guidance — Production Ready Astrology Platform

Full-stack astrology platform with:
- **3 Separate Panels**: User Panel, Astrologer Panel, Admin Panel
- **Role-based Login** (asks "User or Astrologer" at login/register)
- **Real-time Chat + Video Calling** (Socket.io + WebRTC)
- **Full Admin Control** (approve astrologers, manage users/wallets/consultations)
- Working wallet, booking, consultations, etc.

## Project Structure
- `client/` — React + Vite + Tailwind (all frontend)
- `server/` — Express + MongoDB (all backend)
- Root `package.json` for easy scripts

## 1. Quick Local Setup

```bash
# Install everything
npm run install:all

# === MongoDB Setup (using your provided Atlas cluster) ===
cd server
cp .env.example .env

# Open server/.env — I have already filled your MongoDB URL there.
# (If needed, just confirm the MONGODB_URI line has your connection string)

# Set a strong JWT_SECRET too.

# Run seed — this will POPULATE your cluster with everything needed:
#   - Astrologers
#   - Demo accounts (user/astro/admin)
#   - Sample consultations with chat history (so you can immediately test live chat + video)
#   - Wallet data, products, blogs
npm run seed
cd ..
```

Demo accounts after seeding:
- User: `demo@user.com` / `demo1234`
- Astrologer: `demo@astro.com` / `demo1234`
- Admin: `admin@panel.com` / `demo1234`

## 2. Run the App

```bash
npm run dev:full          # Starts both frontend (5173) + backend (5000)
```

- Frontend: http://localhost:5173
- Login → Choose User or Astrologer role
- Browse Astrologers → Book Chat or Video
- Astro logs in at /astro → accepts sessions → joins live chat/video room
- Admin at /admin → full management

## GitHub Upload (Git Ready)

The project is now clean and ready for Git:

```bash
git init
git add .
git commit -m "Production ready: User/Astro/Admin panels + real-time chat & video + full admin"
git remote add origin https://github.com/YOUR_USERNAME/celestial-guidance.git
git branch -M main
git push -u origin main
```

**Important for Git:**
- `.env` files are ignored (never commit real Mongo URL or secrets)
- Only `.env.example` is committed
- All sensitive data stays local

See `server/README.md` for more details and `DEPLOY.md` for live deployment.

## Key Features (Production Level)
- Role-based access (user / astrologer / admin)
- Real booking flow with wallet deduction
- Live text chat (persisted)
- 1:1 Video calling using WebRTC + Socket signaling
- Admin: approve astrologers, adjust balances, view everything
- Seed script populates realistic data
