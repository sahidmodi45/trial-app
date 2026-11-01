-- ============================================================
-- Creative profiles: what clients see on a creative's page.
-- ============================================================

-- One row per creative. It hangs off profiles, so deleting a user removes
-- their creative profile and everything below it.
create table public.creative_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  slug text unique not null
    check (slug ~ '^[a-z0-9-]+$' and char_length(slug) between 3 and 40),
  bio text null check (char_length(bio) <= 300),
  -- Only the handle (e.g. riya.clicks). The app builds the link itself, so
  -- nobody can put an arbitrary URL on their page.
  instagram text null check (instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  -- A neighbourhood, never a full address.
  area text null check (char_length(area) <= 60),
  -- Starts hidden so a half-filled profile never shows up in browse.
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A creative can offer several services (many shoot both photo and video),
-- so categories are rows in their own table, not one column.
create table public.creative_categories (
  user_id uuid not null references public.creative_profiles(user_id) on delete cascade,
  category text not null
    check (category in ('photographer', 'videographer', 'editor', 'artist')),
  primary key (user_id, category)
);

-- Browsing by category is the main search.
create index creative_categories_category_idx
  on public.creative_categories (category);

-- Named offers, e.g. "Half day shoot - 8000". The "From ..." price on a
-- browse card is the lowest package price, so there is no separate
-- starting_price column to keep in sync.
create table public.creative_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.creative_profiles(user_id) on delete cascade,
  name text not null check (char_length(name) between 2 and 60),
  price integer not null check (price >= 0),
  description text null check (char_length(description) <= 300),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index creative_packages_user_position_idx
  on public.creative_packages (user_id, position);

-- Photos point at files in the "portfolio" bucket.
create table public.portfolio_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.creative_profiles(user_id) on delete cascade,
  -- The file must sit in the owner's own folder, so nobody can claim
  -- another creative's upload as their own photo.
  path text not null check (path like user_id::text || '/%'),
  position integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index portfolio_photos_user_position_idx
  on public.portfolio_photos (user_id, position);

-- At most one cover photo per creative.
create unique index portfolio_photos_one_cover_idx
  on public.portfolio_photos (user_id) where is_cover;

-- Videos are either a link (YouTube, Vimeo, Instagram) or a short clip
-- uploaded to the "portfolio-videos" bucket. Exactly one of url/path is set.
create table public.portfolio_videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.creative_profiles(user_id) on delete cascade,
  source text not null check (source in ('link', 'upload')),
  url text null check (
    url ~ '^https://([a-z0-9-]+\.)?(youtube\.com|youtu\.be|vimeo\.com|instagram\.com)/'
  ),
  path text null check (path like user_id::text || '/%'),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  check (
    (source = 'link' and url is not null and path is null)
    or (source = 'upload' and path is not null and url is null)
  )
);

create index portfolio_videos_user_position_idx
  on public.portfolio_videos (user_id, position);

-- ============================================================
-- Triggers
-- ============================================================

-- A default of now() only fills updated_at on insert; this keeps it current.
create function public.set_updated_at() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger creative_profiles_set_updated_at
  before update on public.creative_profiles
  for each row execute function public.set_updated_at();

-- Caps protect the free storage tier (1 GB total). Uploaded videos are
-- the expensive part, so they get the tightest cap.
create function public.limit_portfolio_photos() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  if (select count(*) from public.portfolio_photos where user_id = new.user_id) >= 30 then
    raise exception 'A portfolio can have at most 30 photos';
  end if;
  return new;
end;
$$;

create trigger portfolio_photos_limit
  before insert on public.portfolio_photos
  for each row execute function public.limit_portfolio_photos();

create function public.limit_portfolio_videos() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  if (select count(*) from public.portfolio_videos where user_id = new.user_id) >= 5 then
    raise exception 'A portfolio can have at most 5 videos';
  end if;
  if new.source = 'upload' and (
    select count(*) from public.portfolio_videos
    where user_id = new.user_id and source = 'upload'
  ) >= 2 then
    raise exception 'A portfolio can have at most 2 uploaded videos';
  end if;
  return new;
end;
$$;

create trigger portfolio_videos_limit
  before insert on public.portfolio_videos
  for each row execute function public.limit_portfolio_videos();

-- ============================================================
-- Row level security
-- ============================================================

-- Without RLS, any granted role could read or write every row.
alter table public.creative_profiles enable row level security;
alter table public.creative_categories enable row level security;
alter table public.creative_packages enable row level security;
alter table public.portfolio_photos enable row level security;
alter table public.portfolio_videos enable row level security;

-- creative_profiles: published ones are public so anyone (even logged out)
-- can browse; an owner also sees their own while filling it in.
-- (select auth.uid()) lets Postgres evaluate the uid once per query, not per row.
create policy creative_profiles_select_published on public.creative_profiles
  for select to anon, authenticated
  using (published);

create policy creative_profiles_select_own on public.creative_profiles
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Only users who chose the creative role at onboarding can become a creative.
create policy creative_profiles_insert_own on public.creative_profiles
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'creative'
    )
  );

create policy creative_profiles_update_own on public.creative_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy creative_profiles_delete_own on public.creative_profiles
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- The four child tables share one pattern: public when the creative is
-- published, always visible to the owner, writable only by the owner.
-- The published lookup runs under the caller's RLS, so it only finds
-- profiles they may see.

-- creative_categories (no update: to change a category, delete and add)
create policy creative_categories_select_published on public.creative_categories
  for select to anon, authenticated
  using (exists (
    select 1 from public.creative_profiles c
    where c.user_id = creative_categories.user_id and c.published
  ));

create policy creative_categories_select_own on public.creative_categories
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy creative_categories_insert_own on public.creative_categories
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy creative_categories_delete_own on public.creative_categories
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- creative_packages
create policy creative_packages_select_published on public.creative_packages
  for select to anon, authenticated
  using (exists (
    select 1 from public.creative_profiles c
    where c.user_id = creative_packages.user_id and c.published
  ));

create policy creative_packages_select_own on public.creative_packages
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy creative_packages_insert_own on public.creative_packages
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy creative_packages_update_own on public.creative_packages
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy creative_packages_delete_own on public.creative_packages
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- portfolio_photos
create policy portfolio_photos_select_published on public.portfolio_photos
  for select to anon, authenticated
  using (exists (
    select 1 from public.creative_profiles c
    where c.user_id = portfolio_photos.user_id and c.published
  ));

create policy portfolio_photos_select_own on public.portfolio_photos
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy portfolio_photos_insert_own on public.portfolio_photos
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy portfolio_photos_update_own on public.portfolio_photos
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy portfolio_photos_delete_own on public.portfolio_photos
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- portfolio_videos
create policy portfolio_videos_select_published on public.portfolio_videos
  for select to anon, authenticated
  using (exists (
    select 1 from public.creative_profiles c
    where c.user_id = portfolio_videos.user_id and c.published
  ));

create policy portfolio_videos_select_own on public.portfolio_videos
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy portfolio_videos_insert_own on public.portfolio_videos
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy portfolio_videos_update_own on public.portfolio_videos
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy portfolio_videos_delete_own on public.portfolio_videos
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ============================================================
-- Hide clients: replaces the "everyone reads every profile" policy from s2.
-- Creatives' names stay public (they want to be found); clients' do not.
-- The policy letting a creative see the client on a booking comes with the
-- bookings migration.
-- ============================================================

drop policy profiles_select_all on public.profiles;

create policy profiles_select_creatives on public.profiles
  for select to anon, authenticated
  using (role = 'creative');

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

-- ============================================================
-- Grants
-- ============================================================

-- This project does not expose tables automatically, so without explicit
-- grants every request fails with 42501 (permission denied). Start from
-- nothing and grant only what the policies above are meant to allow.
revoke all on public.creative_profiles from anon, authenticated;
revoke all on public.creative_categories from anon, authenticated;
revoke all on public.creative_packages from anon, authenticated;
revoke all on public.portfolio_photos from anon, authenticated;
revoke all on public.portfolio_videos from anon, authenticated;

grant select on public.creative_profiles to anon, authenticated;
grant insert, delete on public.creative_profiles to authenticated;
-- user_id and the timestamps are never edited by the app (the trigger
-- still sets updated_at).
grant update (slug, bio, instagram, area, published)
  on public.creative_profiles to authenticated;

grant select on public.creative_categories to anon, authenticated;
grant insert, delete on public.creative_categories to authenticated;

grant select on public.creative_packages to anon, authenticated;
grant insert, delete on public.creative_packages to authenticated;
grant update (name, price, description, position)
  on public.creative_packages to authenticated;

grant select on public.portfolio_photos to anon, authenticated;
grant insert, delete on public.portfolio_photos to authenticated;
-- Reordering and picking a cover are the only edits; to change the image,
-- delete the row and add a new one.
grant update (position, is_cover) on public.portfolio_photos to authenticated;

grant select on public.portfolio_videos to anon, authenticated;
grant insert, delete on public.portfolio_videos to authenticated;
grant update (position) on public.portfolio_videos to authenticated;

-- ============================================================
-- Storage
-- ============================================================

-- Both buckets are public: files are served by URL to anyone, no login
-- needed. The limits are checked by Supabase on every upload.
-- Photos: webp only, because the app re-encodes every photo to webp in the
-- browser, which also strips hidden GPS location data from phone photos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 5242880, array['image/webp'])
on conflict (id) do nothing;

-- Videos: short clips only (20 MB). Free tier storage is 1 GB in total.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-videos', 'portfolio-videos', true, 20971520,
        array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do nothing;

-- Files go in <user_id>/..., so the first folder in the path says who owns
-- it. storage.foldername splits the path; [1] is that first folder.

-- Viewing files works without a select policy because the buckets are
-- public. This one only controls listing files through the API: owners
-- only, so nobody can list the file names of unpublished creatives. Owners
-- also need it to replace a file (upsert).
create policy portfolio_files_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id in ('portfolio', 'portfolio-videos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Only creatives can upload, so clients cannot use up the free storage.
create policy portfolio_files_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('portfolio', 'portfolio-videos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'creative'
    )
  );

create policy portfolio_files_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id in ('portfolio', 'portfolio-videos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('portfolio', 'portfolio-videos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy portfolio_files_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('portfolio', 'portfolio-videos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
