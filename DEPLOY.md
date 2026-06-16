# Celestial Guidance - Clean Monorepo Structure

project/
├── client/          # ALL frontend (React, Vite, Tailwind, pages, components...)
├── server/          # ALL backend (Express, MongoDB models, routes, seed...)
└── package.json     # Root scripts (dev:full, install:all, build, seed)

## Local Development

```bash
npm run install:all          # installs client + server
npm run dev:full             # runs both at once
```

Or:
- `npm run dev:client`
- `npm run dev:server`

Backend seed: `npm run seed`

Frontend env (client/.env):
VITE_API_URL=http://localhost:5000/api

## Production Deploy (Render recommended)

1. **Backend** (Render Web Service)
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Required env vars: MONGODB_URI (your full Atlas string), JWT_SECRET, FRONTEND_URL
  Example Mongo format: mongodb+srv://vizdigitalofficial_db_user:xxx@astrostar.pzpdaqu.mongodb.net/celestial-guidance?appName=AstroStar

2. **Frontend** (Render Static Site)
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Env var: VITE_API_URL=https://your-backend-name.onrender.com/api

## Key Points After Restructure
- No more mixed files in root.
- Server folder = complete independent backend.
- Client folder = complete independent frontend.
- Root only has orchestration scripts + docs.

Everything is now "sudh" (clean) as requested.
