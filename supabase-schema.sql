-- EventSphere Database Schema
-- Paste this in Supabase SQL Editor and run it

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (linked to auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  username text unique not null,
  avatar_url text,
  bio text,
  linkedin_url text,
  role text not null default 'organizer' check (role in ('guest', 'attendee', 'organizer')),
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
  counter int := 0;
begin
  base_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  final_username := base_username;

  -- Handle username collisions by appending a number
  while exists (select 1 from profiles where username = final_username) loop
    counter := counter + 1;
    final_username := base_username || counter::text;
  end loop;

  insert into profiles (id, name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    final_username
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. CATEGORIES
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null
);

-- Seed some categories
insert into categories (name, slug) values
  ('Technology', 'technology'),
  ('Music', 'music'),
  ('Business', 'business'),
  ('Design', 'design'),
  ('Education', 'education'),
  ('Health & Wellness', 'health-wellness'),
  ('Food & Drink', 'food-drink'),
  ('Community', 'community'),
  ('Sports', 'sports'),
  ('Arts & Culture', 'arts-culture');

-- 3. EVENTS
create table events (
  id uuid primary key default uuid_generate_v4(),
  organizer_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  slug text unique not null,
  short_description text not null default '',
  description text,
  banner_url text,
  category_id uuid references categories(id),
  city text,
  venue text,
  online_link text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  timezone text not null default 'Asia/Kolkata',
  visibility text not null default 'public' check (visibility in ('public', 'private', 'unlisted')),
  registration_mode text not null default 'open' check (registration_mode in ('open', 'approval', 'invite_only')),
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

-- 4. TICKETS
create table tickets (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  price numeric not null default 0,
  quantity integer not null,
  remaining_quantity integer not null,
  sale_end_date timestamptz,
  ticket_type text not null default 'general' check (ticket_type in ('free', 'general', 'vip', 'early_bird')),
  created_at timestamptz not null default now()
);

-- 5. ORDERS
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  total_amount numeric not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'completed', 'failed', 'refunded')),
  payment_id text,
  created_at timestamptz not null default now()
);

-- 6. ORDER_ITEMS
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  ticket_id uuid not null references tickets(id) on delete cascade,
  quantity integer not null,
  price numeric not null
);

-- 7. REGISTRATIONS
create table registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  ticket_id uuid references tickets(id),
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected', 'waitlisted')),
  qr_code text,
  checked_in boolean not null default false,
  created_at timestamptz not null default now()
);

-- 8. EVENT_FORM_FIELDS
create table event_form_fields (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  label text not null,
  field_type text not null default 'text' check (field_type in ('text', 'textarea', 'select', 'checkbox')),
  required boolean not null default false,
  options jsonb,
  display_order integer not null default 0
);

-- 9. EVENT_APPLICATIONS
create table event_applications (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'waitlisted')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(id)
);

-- 10. APPLICATION_ANSWERS
create table application_answers (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references event_applications(id) on delete cascade,
  field_id uuid not null references event_form_fields(id) on delete cascade,
  answer text not null
);

-- 11. AGENDA
create table agenda (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null
);

-- Enable Row Level Security on all tables
alter table profiles enable row level security;
alter table categories enable row level security;
alter table events enable row level security;
alter table tickets enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table registrations enable row level security;
alter table event_form_fields enable row level security;
alter table event_applications enable row level security;
alter table application_answers enable row level security;
alter table agenda enable row level security;

-- RLS Policies

-- Profiles: public read, own insert/update
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Categories: public read
create policy "Categories are viewable by everyone" on categories for select using (true);

-- Events: public read for published, organizer CRUD
create policy "Published events viewable by everyone" on events for select using (status = 'published' or organizer_id = auth.uid());
create policy "Organizers can insert events" on events for insert with check (organizer_id = auth.uid());
create policy "Organizers can update own events" on events for update using (organizer_id = auth.uid());
create policy "Organizers can delete own events" on events for delete using (organizer_id = auth.uid());

-- Tickets: public read, organizer CRUD
create policy "Tickets viewable by everyone" on tickets for select using (true);
create policy "Organizers can manage tickets" on tickets for all using (
  exists (select 1 from events where events.id = tickets.event_id and events.organizer_id = auth.uid())
);

-- Orders: own read/insert
create policy "Users can view own orders" on orders for select using (user_id = auth.uid());
create policy "Users can create orders" on orders for insert with check (user_id = auth.uid());

-- Order items: viewable with own order
create policy "Users can view own order items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
create policy "Users can create order items" on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Registrations: own read, system insert
create policy "Users can view own registrations" on registrations for select using (user_id = auth.uid());
create policy "Organizers can view event registrations" on registrations for select using (
  exists (select 1 from events where events.id = registrations.event_id and events.organizer_id = auth.uid())
);
create policy "System can create registrations" on registrations for insert with check (user_id = auth.uid());

-- Event form fields: public read, organizer CRUD
create policy "Form fields viewable by everyone" on event_form_fields for select using (true);
create policy "Organizers can manage form fields" on event_form_fields for all using (
  exists (select 1 from events where events.id = event_form_fields.event_id and events.organizer_id = auth.uid())
);

-- Event applications: own read/insert, organizer update
create policy "Users can view own applications" on event_applications for select using (user_id = auth.uid());
create policy "Organizers can view event applications" on event_applications for select using (
  exists (select 1 from events where events.id = event_applications.event_id and events.organizer_id = auth.uid())
);
create policy "Users can create applications" on event_applications for insert with check (user_id = auth.uid());
create policy "Organizers can update applications" on event_applications for update using (
  exists (select 1 from events where events.id = event_applications.event_id and events.organizer_id = auth.uid())
);

-- Application answers: viewable with application
create policy "Answers viewable with application" on application_answers for select using (
  exists (select 1 from event_applications where event_applications.id = application_answers.application_id and event_applications.user_id = auth.uid())
  or exists (select 1 from event_applications join events on events.id = event_applications.event_id where event_applications.id = application_answers.application_id and events.organizer_id = auth.uid())
);
create policy "Users can create answers" on application_answers for insert with check (
  exists (select 1 from event_applications where event_applications.id = application_answers.application_id and event_applications.user_id = auth.uid())
);

-- Agenda: public read, organizer CRUD
create policy "Agenda viewable by everyone" on agenda for select using (true);
create policy "Organizers can manage agenda" on agenda for all using (
  exists (select 1 from events where events.id = agenda.event_id and events.organizer_id = auth.uid())
);

-- 10. NOTIFICATIONS
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('application_approved', 'application_rejected', 'application_waitlisted', 'new_application', 'event_reminder')),
  title text not null,
  message text not null,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;

create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);
create policy "Service role can insert notifications" on notifications for insert with check (true);

create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_user_read on notifications(user_id, read);

-- 11. CHECKINS (audit log for check-ins)
create table checkins (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid not null references registrations(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  checked_in_by uuid not null references profiles(id) on delete cascade,
  method text not null default 'manual' check (method in ('qr', 'manual')),
  checked_in_at timestamptz not null default now()
);

alter table checkins enable row level security;

create policy "Organizers can view event checkins" on checkins for select using (
  exists (select 1 from events where events.id = checkins.event_id and events.organizer_id = auth.uid())
);
create policy "Organizers can create checkins" on checkins for insert with check (
  exists (select 1 from events where events.id = checkins.event_id and events.organizer_id = auth.uid())
);

create index idx_checkins_event_id on checkins(event_id);
create index idx_checkins_registration_id on checkins(registration_id);
