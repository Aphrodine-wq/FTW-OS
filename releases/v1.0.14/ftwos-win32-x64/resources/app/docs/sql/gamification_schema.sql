-- Gamification & Activity Tracking Schema

-- XP Events Table
create table if not exists public.xp_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  action text not null,
  xp_earned integer not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc', now())
);

-- User Levels Table
create table if not exists public.user_levels (
  user_id uuid references auth.users primary key,
  level integer default 1,
  current_xp integer default 0,
  total_xp integer default 0,
  rank text default 'Intern',
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Activity Logs Table (from ActivityTrackingService)
create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  activity_type text not null,
  duration integer, -- seconds
  focus_score integer,
  context_switches integer,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc', now())
);

-- RLS Policies
alter table public.xp_events enable row level security;
alter table public.user_levels enable row level security;
alter table public.activity_logs enable row level security;

-- Policies for xp_events
create policy "Users can view their own xp events" on public.xp_events for select using (auth.uid() = user_id);
create policy "Users can insert their own xp events" on public.xp_events for insert with check (auth.uid() = user_id);

-- Policies for user_levels
create policy "Users can view their own level" on public.user_levels for select using (auth.uid() = user_id);
create policy "Users can insert their own level" on public.user_levels for insert with check (auth.uid() = user_id);
create policy "Users can update their own level" on public.user_levels for update using (auth.uid() = user_id);

-- Policies for activity_logs
create policy "Users can view their own activity logs" on public.activity_logs for select using (auth.uid() = user_id);
create policy "Users can insert their own activity logs" on public.activity_logs for insert with check (auth.uid() = user_id);
