# Momentum — GTD Tasks & Projects

A mobile-first **Progressive Web App** for personal task management and team
collaboration, built around the **Getting Things Done (GTD)** method.

Capture into an **Inbox**, clarify items into **Next Actions / Projects /
Waiting For / Scheduled / Someday**, organise with **contexts & tags**, set
**due dates & reminders**, break work into **subtasks/checklists**, run a
guided **Weekly Review**, and collaborate with a **team** — assign tasks,
comment, and sync in real time.

Installs to the phone home screen, works offline, and runs entirely on a free
Supabase backend that **you own**.

---

## What you get

- **GTD core** — Inbox capture (one-tap ＋), Next Actions, Projects, Waiting
  For, Scheduled, Someday/Maybe, Completed.
- **Contexts & tags** — `@home`, `@calls`, `@errands`… plus free-form `#tags`,
  with filtering on the Next Actions list (also filter by energy level).
- **Due dates & reminders** — date picker, datetime reminders, "Today" view
  with overdue highlighting, and on-device notifications.
- **Subtasks / checklists** — nest actions under any task with progress counts.
- **Priorities & energy** — flag High/Medium/Low priority and energy level.
- **Projects** — outcome + colour, progress bars, grouped action lists.
- **Weekly Review** — a guided 6-step checklist that flags what needs attention.
- **Teams** — create shared workspaces, invite by email, assign tasks to
  teammates, comment threads, and **real-time sync** across everyone.
- **Private by default** — every account gets a private "My Tasks" workspace;
  team workspaces are separate and opt-in.
- **PWA** — installable, offline-capable, app-like.

---

## 🚀 Launch in ~15 minutes

You need a free [Supabase](https://supabase.com) account and a free host
([Vercel](https://vercel.com) or [Netlify](https://netlify.com)). No credit card.

### 1. Create the backend (Supabase)

1. Go to **supabase.com → New project**. Pick a name and a strong database
   password, choose a region near your team, and create it.
2. Open **SQL Editor → New query**. Open `supabase/schema.sql` from this
   project, copy everything, paste it in, and click **Run**. You should see
   "Success". This creates all tables, security rules, and real-time.
3. (Recommended for fastest onboarding) Go to **Authentication → Providers →
   Email** and turn **OFF** "Confirm email" so teammates can sign in
   immediately. (Leave it on if you prefer email verification.)
4. Go to **Project Settings → API** and copy two values:
   - **Project URL** → `https://xxxx.supabase.co`
   - **anon public** key → a long `eyJ…` string

### 2. Deploy the app (Vercel — easiest)

**Option A — drag & drop (no Git needed):**
1. On your computer, in this folder run:
   ```bash
   npm install
   npm run build
   ```
   This produces a `dist/` folder.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the
   `dist` folder onto the page. You get a live URL instantly.
3. First time it loads, the app shows a **one-time Setup screen** — paste your
   Supabase URL + anon key. (Or set env vars before building — see below.)

**Option B — Git import (auto-redeploys on changes):**
1. Push this folder to a GitHub repo.
2. In Vercel or Netlify, **Import** the repo.
3. Add two environment variables:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
4. Deploy. Build command `npm run build`, output `dist` (already configured in
   `vercel.json` / `netlify.toml`).

### 3. Share with your team

1. Open the deployed URL, **Create account**, and sign in.
2. Tap the workspace switcher (top-left) → **Manage teams** →
   **Create a team workspace** (e.g. "Marketing Team").
3. **Invite teammates by email**. Send them the app link. When they sign up
   with that email, they land straight in the team workspace and see shared
   projects in real time.
4. On a phone: open the link in the browser → **Add to Home Screen** to install
   it like a native app.

---

## Run locally (for testing)

```bash
npm install
cp .env.example .env     # then fill in your Supabase URL + anon key
npm run dev              # open the printed http://localhost:5173 URL
```

If you skip the `.env` step, the app will show its built-in Setup screen where
you can paste the same two values.

---

## Configuration — three ways to provide Supabase keys

The app resolves config in this order:

1. **Build-time env vars** `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
   (best for shared deploys — set once, works for everyone).
2. **`public/config.js`** — edit this file after deploying and paste the values.
3. **In-app Setup screen** — stored in the browser (handy for quick local tests;
   note it only applies to that one device/browser).

The **anon public key is safe to expose** in a browser app — all data access is
guarded by Supabase **Row Level Security** (defined in `schema.sql`), so users
only ever see workspaces they belong to.

---

## Tech & structure

- **Vite + React 18**, **React Router**, **vite-plugin-pwa** (offline + install).
- **Supabase** for Postgres, Auth, Row Level Security, and Realtime.
- No CSS framework — a compact mobile-first stylesheet in `src/styles`.

```
src/
  lib/        config, supabase client, db access, GTD helpers
  hooks/      auth, workspace, data (with realtime), reminders
  components/ Layout, TaskList, TaskEditor, Sheet, Avatar
  pages/      Inbox, NextActions, Today, Projects, ProjectDetail,
              Contexts, ListView, Review, Search, Team, Settings, Login, Setup
supabase/
  schema.sql  full database schema + RLS + realtime (run once)
```

## Verify the source

`node verify.mjs` syntax-checks every file and confirms imports resolve
(used during development; no network or install required).

---

## Notes & next steps

- **Reminders** fire as on-device notifications while the app is open/backgrounded
  on a supported browser. For push notifications that reach people when the app
  is fully closed, add Supabase Edge Functions + Web Push (a natural next step).
- **Email invites** here register the teammate's email so they auto-join on
  signup; the app doesn't send the invite email itself — share the link directly,
  or wire up Supabase's email/SMTP to automate it.
- Everything runs on Supabase's free tier for a small team; upgrade as you grow.
