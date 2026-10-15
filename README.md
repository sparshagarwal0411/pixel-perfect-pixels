# MargDarshak

> **मार्गदर्शक** — *Your guide to campus opportunities.*

Discover, compare, and route to inter-college hackathons, fests, workshops, and competitions across Delhi-NCR — all in one place.

---

## What it does

MargDarshak solves a real problem for college students in Delhi: finding out *which* events are worth the trip. It pulls events from Unstop and local listings, then layers on transparent scoring, travel estimates, and schedule-conflict detection so you can make smarter decisions.

### Core features

| Feature | Route | Description |
|---|---|---|
| **Landing & Algorithm Sandbox** | `/` | Interactive Worth-It Score simulator — drag sliders for prize, distance, fee and interest match to see how the ranking formula works in real time. |
| **Explore** | `/explore` | Search, filter (category, college, fee range), and compare events side-by-side with scores and reviews. |
| **EventRank** | `/rank` | Every event gets a transparent **Worth-It Score** (0–100) built from quality, cost, travel time, tag relevance, and community reviews. No black boxes. |
| **Transit Radar** | `/nearby` | Leaflet map with campus pins, straight-line distance + estimated metro/auto travel time and cost. "Can I Make It?" widget checks timing, budget, and schedule conflicts before you commit. |
| **Dashboard** | `/dashboard` | Priority-sorted feed of saved events, upcoming deadlines, schedule conflicts, and reminders — synced to your Google account via Supabase. |
| **CampusConnect** | `/campus` | Society collab mesh — college societies post requests (design partners, co-sponsors, hackathon teammates) and discover each other across campuses. |
| **Calendar** | `/calendar` | Month view of your tracked events. |
| **Settings** | `/settings` | Profile, interests, budget, and theme preferences. |

### Under the hood

- **Worth-It Score** — weighted formula across 5 axes: organizer quality, total cost (fee + travel), travel time, interest-tag relevance, community reviews. Weights are visible, not hidden.
- **"Can I Make It?"** — given your campus, leave time, budget, and existing registrations, tells you if an event is feasible (timing + budget + no schedule clash + deadline still open).
- **Unstop sync** — Python scraper hits Unstop's public opportunity API, filters for Delhi-NCR events with known campus coordinates, and upserts into Supabase.
- **Google OAuth** — real Supabase auth with Google provider. Falls back to local demo accounts when Supabase isn't configured.
- **Event tracking** — registration status (`Interested → Registered → Attended / Skipped`) synced to Supabase with row-level security per user.

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | TanStack Router (file-based) + TanStack React Query |
| Styling | Tailwind CSS 4 + Radix UI primitives + shadcn/ui components |
| Maps | Leaflet |
| Auth & DB | Supabase (Google OAuth, Postgres, RLS) |
| Charts | Recharts |
| Event sync | Python (requests + supabase-py) |
| Linting | ESLint 9 + Prettier |
| Testing | Vitest + Testing Library |

---

## Getting started

### Prerequisites

- **Node.js** ≥ 18 — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **Python** ≥ 3.10 (only needed for event sync)

### Install & run

```sh
git clone https://github.com/sparshagarwal0411/pixel-perfect-pixels.git
cd pixel-perfect-pixels
npm install
npm run dev
```

The app works out of the box with demo data. No Supabase setup needed to browse events.

### Environment variables

Copy the structure below into `.env` at the project root:

```env
# Browser-safe Supabase credentials (public anon key)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Server-side only — NEVER expose as VITE_* or in the browser
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: override the Unstop listings page URL
UNSTOP_LISTINGS_URL=https://unstop.com/competitions
```

---

## Syncing events from Unstop

1. Run the migration in the Supabase SQL editor:
   ```
   supabase/events.sql
   ```
   This also creates `profiles` and `event_tracking` tables with RLS.

2. Install Python dependencies:
   ```sh
   pip install -r requirements.txt
   ```

3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env` (the sync script loads it automatically).

4. Run the scraper:
   ```sh
   python scripts/sync_unstop_events.py
   ```

The sync reads Unstop's public opportunity JSON endpoint, publishes only events whose Delhi-NCR location matches a known campus, and reports fetched vs skipped counts. Control volume with `UNSTOP_MAX_API_PAGES` and `UNSTOP_API_PAGE_SIZE` env vars.

> **Note:** `Registered` in MargDarshak means the user bookmarked the event locally — it does **not** mean they completed registration on Unstop.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |
| `npm run test` | Run Vitest |
| `npm run test:watch` | Vitest in watch mode |

---

## Project structure

```
src/
├── components/
│   ├── AppShell.tsx          # Layout shell, nav, score ring
│   ├── AuthGate.tsx          # Auth wall wrapper
│   ├── CanIMakeIt.tsx        # Feasibility checker widget
│   ├── EventCard.tsx         # Reusable event card
│   ├── GoogleAuthModal.tsx   # Google sign-in modal
│   ├── MouseGridHero.tsx     # Landing page interactive hero
│   ├── RealTransitMap.tsx    # Leaflet transit map
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── data.ts               # Types + demo seed data
│   ├── logic.ts              # Worth-It Score, travel estimates, Can-I-Make-It
│   ├── remote-events.ts      # Supabase event loader
│   ├── store.tsx             # React context state + Supabase auth
│   ├── supabase.ts           # Supabase client init
│   └── utils.ts              # cn() helper
├── routes/                    # TanStack Router file-based routes
│   ├── __root.tsx
│   ├── index.tsx              # Landing page
│   ├── explore.tsx
│   ├── rank.tsx
│   ├── nearby.tsx
│   ├── dashboard.tsx
│   ├── campus.tsx
│   ├── calendar.tsx
│   ├── settings.tsx
│   ├── events.$id.tsx         # Event detail page
│   └── history.tsx
├── router.tsx
├── main.tsx
└── styles.css
scripts/
└── sync_unstop_events.py      # Unstop → Supabase sync
supabase/
└── events.sql                 # DB migration (events, profiles, tracking, RLS)
```

---

## Lovable

This project is connected to [Lovable](https://lovable.dev/projects/49d49e77-2665-4c64-98f1-74546d9638cd). Pushing to `main` syncs changes back into the Lovable editor. Avoid rewriting published git history (force-push, rebase, amend) — it will break history on Lovable's side.

---

## License

Private project. All rights reserved.
