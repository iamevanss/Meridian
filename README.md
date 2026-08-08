# Meridian

A simulated banking platform — glass UI dashboard, atomic double-entry
transfers, and an internal admin console. Built as a monorepo with two
independent frontend deployments and one shared backend/database.

**No real money moves anywhere in this system.** All funds are simulated.
See `/packages/api/src/lib/ledger.ts` for the transfer logic.

## Structure

```
apps/
  web/      customer dashboard      → Vercel project #1
  admin/    internal ops console    → Vercel project #2
packages/
  api/      Express backend         → Railway or Render
  db/       Prisma schema + client  → shared by api (and web/admin if needed)
  ui/       shared glass components → used by both apps
```

## Local setup

1. `npm install` from the repo root (npm workspaces wire up all packages).
2. Copy `.env.example` to `.env` in the repo root **and** in `packages/api/`,
   fill in a real `DATABASE_URL` (a free Postgres instance from Railway,
   Render, Supabase, or Neon all work for local dev too).
3. `npm run db:push` — creates tables from `packages/db/prisma/schema.prisma`.
4. In three terminals: `npm run dev:api`, `npm run dev:web`, `npm run dev:admin`.
5. Web dashboard: `localhost:3000`. Admin console: `localhost:3001`. API: `localhost:4000`.

To create your first admin user: sign up normally via `/auth/signup`, then
manually set that user's `role` to `ADMIN` in the database (Prisma Studio:
`npm run db:studio`). There's deliberately no public "become an admin" route.

## Deployment

### 1. GitHub
Push this repo to GitHub first — Vercel, Railway, and Render all deploy by
connecting directly to a GitHub repo and redeploying on every push to `main`.

### 2. Backend → Railway or Render
Both work the same way here: create a new service from your GitHub repo,
set the **root directory** to `packages/api`, build command `npm install &&
npm run build`, start command `npm start`. Add a Postgres database from the
same platform (one click on both Railway and Render) — it gives you the
`DATABASE_URL` to paste into the service's environment variables, along
with `JWT_SECRET`, `ADMIN_JWT_SECRET`, `CORS_ORIGIN_WEB`, `CORS_ORIGIN_ADMIN`
(fill these in once you have your Vercel URLs from step 3). After first
deploy, run `npm run db:push -w packages/db` once (Railway/Render both let
you run one-off commands from their dashboard) to create your tables.

### 3. Frontend → two Vercel projects, same repo
Import the GitHub repo into Vercel **twice**, as two separate projects:
- Project 1: Root Directory = `apps/web` → this becomes your customer app
- Project 2: Root Directory = `apps/admin` → this becomes your admin app

For each, set the environment variable `NEXT_PUBLIC_API_URL` to your
Railway/Render backend URL from step 2. Each project gets its own domain
automatically (e.g. `meridian.vercel.app` and `meridian-admin.vercel.app`) —
give the admin one an unguessable name rather than the obvious `-admin`
suffix, since obscurity isn't security but it doesn't hurt as a first layer
on top of the actual auth check.

### 4. Uptime bot
Free tier backends on Railway/Render spin down when idle, which means the
first request after a quiet period is slow. Point an uptime monitor at your
backend's `/health` endpoint every 5 minutes:
- **UptimeRobot** (free) — easiest, just paste `https://your-api-url/health`
- Railway/Render also both support a scheduled/cron job in the same project
  that curls your own `/health` endpoint on an interval, if you'd rather
  keep it in-platform.

## What's built vs. what's next

**Built:** data model, atomic transfer engine with row locking, account
number generation with checksum validation, auth (separate customer/admin
token secrets), all core API routes, admin audit logging, glass design
system + dashboard UI, CI pipeline.

**Not yet built (next steps):** login/signup pages for the web app, wiring
the dashboard to real API calls instead of placeholder data, the admin
console's actual account list / freeze UI / audit log table, MFA, and a
transfer-money flow UI. Say the word and we'll do these next, same
step-by-step way.
