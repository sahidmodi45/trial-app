-- One profile per signed-in user. Created on /onboarding after the first social login,
-- where the user picks whether they book creatives (client) or are one (creative).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('client', 'creative')),
  name text not null check (char_length(name) between 2 and 60),
  city text not null check (char_length(city) between 2 and 40),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Basic profiles are public: creatives' names and cities show on listings.
create policy "profiles are public"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "users create their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "users update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select on public.profiles to anon, authenticated;
grant insert (id, role, name, city) on public.profiles to authenticated;
-- role is left out on purpose: switching client <-> creative later is a separate, deliberate flow.
grant update (name, city) on public.profiles to authenticated;
