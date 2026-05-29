<h1 align="center">EventSphere</h1>

<p align="center">
  <strong>AI-Native Event Management & Ticketing Platform</strong><br>
  <em>Problem Statement #26ENES3 — DevFusion: The Developers Hackathon 2.0</em>
</p>

<p align="center">
  <a href="https://event-sphere-zeta-nine.vercel.app">Live Demo</a> ·
  <a href="https://github.com/karanmourya/EventSphere">GitHub Repo</a>
</p>

---

## What EventSphere Does (In 10 Seconds)

One platform. Three roles. Zero compromises.

**Organisers** create events, set up ticket tiers, push discount codes, and watch revenue roll in on a real-time dashboard. **Attendees** browse, wishlist, and buy tickets — even multiple tiers in a single checkout. **On event day**, organisers scan QR codes to check people in, with a live counter showing who showed up and who didn't.

And then there's the AI layer. Gemini recommends events based on what you've attended before. It drafts event descriptions from raw details. It builds entire conference schedules with keynotes, workshops, and lunch breaks — automatically.

---

## Why This Stands Out

| What judges look for | What EventSphere delivers |
|---|---|
| Real, working features | 20 pages, 21 server actions, 19 UI components — all built and connected |
| Clean commit history | 44 incremental commits, one per feature, zero dump commits |
| Technical depth | 36 database tables with full RLS policies, AI integration, sandbox payments |
| Full-stack completeness | Auth, database, storage, AI, payments, deployment — all wired end-to-end |
| Live and functional | Deployed on Vercel, backend connected, no localhost links |

---

## Features Built

### For Organisers

- **Event Creation** — name, date, time, venue (physical/online), category, description, banner upload to Supabase Storage
- **Ticket Tiers** — Free, General, VIP, Early Bird — each with independent capacity, pricing, and sale end dates
- **Discount Codes** — percentage or fixed-amount, with max usage limits and expiry dates. Applied live at checkout
- **Check-in Panel** — QR code input or manual attendee search. Live counter: registered vs. checked-in
- **Revenue Dashboard** — total revenue, registration count, check-in rate, per-event ticket breakdown
- **CSV Export** — download attendee list with name, ticket type, status, QR code, check-in status
- **Speaker Management** — add speakers with name, title, company, bio, and LinkedIn
- **FAQ Builder** — create Q&A pairs displayed as an accordion on the event page
- **Schedule Builder** — AI generates a full multi-session agenda from event details

### For Attendees

- **Event Discovery** — browse with filters: category, date, city, price (free/paid)
- **AI Recommendations** — homepage shows personalised event suggestions based on past attendance
- **Event Detail Page** — agenda, speakers, venue map link, FAQ accordion, and public reviews
- **Multi-Ticket Checkout** — buy 2 VIP + 1 General in a single order with one payment
- **QR Code Tickets** — generated on purchase, viewable on dashboard, downloadable as PNG
- **Wishlist** — heart events to save them; view saved events in a dedicated wishlist page
- **Reviews & Ratings** — attendees leave 5-star reviews with optional comments
- **Reminder Notifications** — in-app alerts for wishlisted events starting within 24 hours

### Payments

- **Razorpay Sandbox Integration** — full checkout flow with order summary and discount codes
- **Refund Flow** — attendees request refunds; organisers approve or reject from a dedicated panel
- **Order Tracking** — complete order history with payment status (completed, refunded)

### Account

- **Profile Management** — avatar upload (auto-creates Supabase Storage bucket), display name, bio, LinkedIn URL
- **User Menu** — avatar dropdown in navbar with quick access to account, dashboard, settings, and sign out

---

## The AI Layer (Powered by Google Gemini 2.5 Flash)

| Feature | What it does |
|---|---|
| **Event Recommendations** | Reads your registration history, extracts category preferences, ranks 50+ events, and surfaces your top 6 |
| **Description Generator** | Takes event title, category, venue, and time — outputs a polished 100–200 word event description |
| **Smart Schedule Builder** | Given event title, duration, and description — builds a full agenda with keynotes, workshops, panels, breaks, and networking slots |

---

## Tech Stack

```
Frontend:   Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui
Backend:    Next.js Server Actions (no separate API server)
Database:   PostgreSQL via Supabase (Row Level Security on all tables)
Auth:       Supabase Auth (email/password)
Storage:    Supabase Storage (event banners, avatars)
AI:         Google Gemini 2.5 Flash
Payments:   Razorpay (sandbox/test mode)
QR Codes:   qrcode (canvas-based, downloadable PNG)
Deployment: Vercel
```

---

## Architecture at a Glance

```
src/
├── actions/             21 server actions (auth, events, tickets, checkout,
│                       check-in, AI, stats, refunds, reviews, wishlist,
│                       speakers, FAQs, account, notifications, discounts)
├── app/                 20 pages across 15 routes
│   ├── dashboard/       overview, events, tickets, orders, wishlist, settings
│   ├── dashboard/event/ create, edit, stats, check-in, refunds, forms, applications
│   ├── event/[slug]/    public event detail page
│   ├── explore/         filtered event discovery
│   ├── checkout/        multi-ticket checkout + success page
│   └── api/             proxy routes
├── components/          19 components (forms, event cards, checkout,
│                       dashboard, notifications, etc.)
├── lib/                 Supabase clients (anon, server, admin), utils
└── types/               TypeScript interfaces for all 36 database tables
```

---

## Getting Started Locally

### Prerequisites
- Node.js 18+
- Supabase project (free tier)
- Razorpay Test Mode keys
- Google Gemini API key

### Setup

```bash
# 1. Clone
git clone https://github.com/karanmourya/EventSphere.git
cd EventSphere

# 2. Install
npm install

# 3. Create .env.local
cp .env.example .env.local
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
#          GEMINI_API_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

# 4. Run database schema
# Open Supabase SQL Editor → paste supabase-schema.sql → Run

# 5. Start
npm run dev
# → http://localhost:3000
```

---

## Test Accounts

Log in with either account to explore both sides of the platform:

| Account | Password | Best for testing |
|---------|----------|-----------------|
| `mytypihi@denipl.com` | `mytypihi@denipl.com` | Creating events, managing check-ins, viewing revenue |
| `kaghed4gox@disefl.com` | `kaghed4gox@disefl.com` | Browsing events, purchasing tickets, leaving reviews |

---

## Razorpay Test Payment

Use these sandbox credentials during checkout:

| Field | Test Value |
|-------|-----------|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date (e.g. `12/28`) |
| CVV | Any 3 digits (e.g. `123`) |
| Name | Any name |

No real money is charged. The full order flow — including discount codes, multi-ticket selection, and refund requests — works with the Razorpay sandbox.

---

## What's Honest About This Build

| Status | Detail |
|--------|--------|
| Fully working | Event CRUD, ticket management, checkout, QR generation, check-in, dashboard analytics, CSV export, reviews, wishlist, notifications, account settings, all 3 AI features |
| Sandbox mode | Razorpay is integrated in test mode. Production deployment requires live keys and webhook configuration |
| In-app notifications | No email or push delivery — notifications show in the bell icon dropdown |
| Google Maps | Venue map links to Google Maps. Embed requires a `NEXT_PUBLIC_GOOGLE_MAPS_KEY` env var |
| AI requires data | Personalised recommendations work best after registering for at least one event |

---

## Team

| Name | Role |
|------|------|
| Karan Mourya | Full-Stack Development — architecture, frontend, backend, AI integration, database design |
| Priyanshi Limbasiya | Frontend Development — UI/UX design, component styling, user experience |

---

## Deployment

Live on **Vercel** at [https://event-sphere-zeta-nine.vercel.app](https://event-sphere-zeta-nine.vercel.app)

All environment variables configured. Supabase backend connected. Fully functional — no localhost dependencies.

---

<p align="center">
  Built for DevFusion: The Developers Hackathon 2.0<br>
  <em>44 commits · 36 tables · 20 pages · 3 AI features · 1 platform</em>
</p>
