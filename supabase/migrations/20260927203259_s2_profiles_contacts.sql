-- Public profile for every user. Created at onboarding, so the app can tell
-- clients from creatives and show a name and city. Holds only public info.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('client', 'creative')),
  full_name text not null check (char_length(full_name) between 2 and 60),
  city text not null,
  avatar_path text null,
  created_at timestamptz not null default now()
);

-- Phone numbers live in their own table because RLS protects rows, not
-- columns: a phone column on the public profiles table would be readable
-- by anyone who can read the profile.
create table public.contact_details (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  phone text not null check (phone ~ '^\+91[6-9][0-9]{9}$'),
  updated_at timestamptz not null default now()
);

-- Without RLS, any granted role could read or write every row.
alter table public.profiles enable row level security;
alter table public.contact_details enable row level security;

-- Profiles are public so anyone (even logged out) can browse creatives,
-- but a user can only create and edit their own row.
-- (select auth.uid()) lets Postgres evaluate the uid once per query, not per row.
create policy profiles_select_all on public.profiles
  for select to anon, authenticated
  using (true);

create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Contact details are private: only the owner can read or write them, and
-- anon gets no policy at all. The policy letting the other side of an
-- ACCEPTED booking read a phone comes in a later migration.
create policy contact_details_select_own on public.contact_details
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy contact_details_insert_own on public.contact_details
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy contact_details_update_own on public.contact_details
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- This project does not expose tables automatically, so without explicit
-- grants every request fails with 42501 (permission denied). Start from
-- nothing and grant only what the policies above are meant to allow.
revoke all on public.profiles from anon, authenticated;
revoke all on public.contact_details from anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant insert on public.profiles to authenticated;
-- role is fixed after onboarding, so it is left out of the update grant.
grant update (full_name, city, avatar_path) on public.profiles to authenticated;

grant select, insert, update on public.contact_details to authenticated;
