create table if not exists public.events (
  id text primary key,
  source text not null default 'unstop',
  source_url text not null unique,
  title text not null,
  category text not null,
  college_id text not null,
  organizer text not null default 'Unstop organizer',
  start_at timestamptz not null,
  end_at timestamptz not null,
  deadline_at timestamptz not null,
  fee integer not null default 0,
  eligibility text not null default 'See event page for eligibility',
  tags text[] not null default '{}',
  description text not null default '',
  quality numeric not null default 0,
  reviews jsonb not null default '[]'::jsonb,
  prize text,
  latitude double precision,
  longitude double precision,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists events_start_at_idx on public.events (start_at);
create index if not exists events_college_id_idx on public.events (college_id);

alter table public.events enable row level security;

do $$
begin
  create policy "Public can read synced events"
    on public.events for select
    using (true);
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  college_id text,
  department text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_tracking (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  status text not null check (status in ('Interested', 'Registered', 'Attended', 'Skipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create index if not exists event_tracking_user_id_idx on public.event_tracking (user_id);

alter table public.profiles enable row level security;
alter table public.event_tracking enable row level security;

do $$
begin
  create policy "Users can read their own profile"
    on public.profiles for select
    using (auth.uid() = id);
  create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = id);
  create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create policy "Users can read their own event tracking"
    on public.event_tracking for select
    using (auth.uid() = user_id);
  create policy "Users can insert their own event tracking"
    on public.event_tracking for insert
    with check (auth.uid() = user_id);
  create policy "Users can update their own event tracking"
    on public.event_tracking for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  create policy "Users can delete their own event tracking"
    on public.event_tracking for delete
    using (auth.uid() = user_id);
exception
  when duplicate_object then null;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
