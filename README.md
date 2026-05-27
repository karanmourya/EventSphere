# EventSphere

> **DevFusion: The Developers Hackathon 2.0** — Problem Statement #26ENES3
> End-to-End Event Management & Ticketing Platform

**Live Demo:** [https://eventsphere-karan.vercel.app](https://eventsphere-karan.vercel.app)
*(Update this link after deploying)*

---

## About

EventSphere is an AI-native event management and ticketing platform where organisers create events, attendees discover and buy tickets, and AI personalises the experience at every step.

Organisers get a full dashboard — create events, manage ticket tiers, run discount campaigns, check in attendees via QR codes, and track revenue in real time. Attendees browse, wishlist, purchase tickets with multi-cart checkout, and get AI-powered recommendations for events they'll love.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Next.js Server Actions |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (event banners, avatars) |
| AI | Google Gemini 2.5 Flash (recommendations, descriptions, schedule builder) |
| Payments | Razorpay (sandbox/test mode) |
| QR Codes | qrcode (canvas-based generation) |
| Deployment | Vercel |

---

## Features

### Event Creation (Organiser)
- Create events with name, date/time, venue, category, description, and banner image
- Multiple ticket types: Free, General, VIP, Early Bird — each with capacity control
- Discount codes (percentage or fixed) with max uses and expiry dates
- AI-generated event descriptions from event details
- AI smart schedule builder for multi-session events
- Add speakers with name, title, company, bio, and LinkedIn
- FAQ section management

### Attendee Experience
- Browse events with filters (category, date, city, price range)
- AI-powered event recommendations based on past attendance
- Event detail page with agenda, speakers, venue map, and FAQ
- Multi-ticket checkout (buy 2 VIP + 1 General in one order)
- Discount code application at checkout
- QR code tickets — viewable and downloadable from dashboard
- Wishlist events and get reminder notifications
- Post-event reviews and star ratings

### Check-in System
- Organiser check-in panel with QR code entry and manual search
- Live stats: total registered vs checked in
- Attendee list with search by name
- Individual check-in buttons for manual entry

### Dashboard & Analytics
- Revenue overview across all events
- Registration and check-in stats
- Per-event analytics with ticket breakdown
- CSV attendee export (name, ticket, status, QR code)

### Payments (Razorpay Sandbox)
- Multi-ticket checkout with order summary
- Discount code integration at checkout
- Refund request flow (attendee requests, organiser approves/rejects)
- Order history with payment status tracking

### Community
- Public event reviews with 5-star ratings
- Attendee networking via LinkedIn profile sharing
- In-app notification system

### Account Management
- User profile with avatar upload, display name, bio, and LinkedIn URL
- Account settings page
- Sign out from navbar or dashboard

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)
- A Razorpay account with Test Mode keys
- A Google Gemini API key

### 1. Clone the repository
```bash
git clone https://github.com/karan-mourya/EventSphere.git
cd EventSphere
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

### 4. Set up the database
Run the SQL from `supabase-schema.sql` in your Supabase SQL Editor. This creates all tables, policies, and indexes.

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Test Accounts

Use these accounts to explore the platform:

| Email | Password | Use Case |
|-------|----------|----------|
| `mytypihi@denipl.co` | `mytypihi@denipl.com` | Create events, manage check-ins, view analytics |
| `kaghed4gox@disefl.com` | `kaghed4gox@disefl.com` | Browse events, buy tickets, leave reviews |

---

## Razorpay Sandbox Payment

Payments are processed through **Razorpay Test Mode**. Use these test card details:

| Field | Value |
|-------|-------|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date (e.g., `12/28`) |
| CVV | Any 3 digits (e.g., `123`) |
| Name | Any name |

> **Note:** The checkout is fully functional with sandbox payment verification. No real money is charged.

---

## Project Structure

```
src/
├── actions/          # Server actions (auth, events, tickets, checkout, AI, etc.)
├── app/              # Next.js App Router pages
│   ├── dashboard/    # Organiser & attendee dashboard
│   ├── event/[slug]/ # Public event detail pages
│   ├── explore/      # Event discovery with filters
│   ├── checkout/     # Ticket checkout flow
│   └── ...
├── components/       # Reusable UI components
│   ├── checkout/     # Checkout form, QR ticket
│   ├── event/        # Event cards, speakers, FAQ, reviews, wishlist
│   ├── dashboard/    # Sidebar nav
│   ├── notifications/# Notification bell
│   └── ...
├── lib/              # Utilities, Supabase clients
└── types/            # TypeScript type definitions
```

---

## AI Features

All AI features are powered by **Google Gemini 2.5 Flash**:

1. **Event Recommendations** — Analyses past attendance and generates personalised event suggestions on the homepage
2. **AI Description Generator** — Organisers enter event details; AI drafts a polished 100–200 word description
3. **Smart Schedule Builder** — For multi-session events, AI generates a realistic agenda with keynote, workshops, breaks, and networking sessions

---

## Team

| Name | Role |
|------|------|
| Karan Mourya | Full-Stack Development |

---

## Known Limitations

- Payment flow uses Razorpay sandbox — production requires live keys and webhook setup
- Google Maps embed requires a `NEXT_PUBLIC_GOOGLE_MAPS_KEY` env var; falls back to a direct link without it
- Notifications are in-app only (no email/push delivery)
- AI recommendations require at least one past registration to generate personalised results

---

## License

Built for DevFusion: The Developers Hackathon 2.0
