-- Club directory, follows and the adult home feed.
--
-- Clubs are easy to find, never open to join: the directory shows only what
-- the Clubhouse page already shows (name, logo, colour, tagline, city), and
-- only for clubs whose Org Admin has chosen to be listed. Joining still goes
-- through a parent and the join code. Adults follow clubs to see their
-- official posts in one feed. Kids cannot follow and have no cross-club feed.

alter table public.org_branding
  add column listed boolean not null default false,
  add column city text check (city is null or char_length(city) between 2 and 60);

-- demo clubs seeded for previews; never billed, never real kids
alter table public.organizations add column demo boolean not null default false;

create table public.club_follows (
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);
create index club_follows_org on public.club_follows (organization_id);
alter table public.club_follows enable row level security;
-- read your own follows only; writes go through follow_club()
create policy club_follows_own on public.club_follows for select to authenticated using (user_id = auth.uid());
grant select on public.club_follows to authenticated;

-- The Clubhouse page also says whether the club is listed and whether it is a demo.
drop function public.get_clubhouse(text);
create function public.get_clubhouse(p_slug text)
returns table (organization_id uuid, slug text, name text, kind text, faith_mode boolean,
               logo_path text, primary_color text, tagline text, joinable boolean, motto text,
               listed boolean, demo boolean, city text)
language sql stable security definer set search_path = ''
as $$
  select o.id, o.slug, o.name, o.kind, o.faith_mode, b.logo_path, b.primary_color, b.tagline,
         (o.status in ('active', 'grace') and not o.joining_paused and not o.demo), b.motto,
         coalesce(b.listed, false), o.demo, b.city
  from public.organizations o
  left join public.org_branding b on b.organization_id = o.id
  where o.slug = lower(btrim(p_slug)) and o.status <> 'suspended'
$$;

-- Public directory. Same fields as the Clubhouse page, listed clubs only.
create function public.list_clubs(p_query text default null)
returns table (slug text, name text, kind text, faith_mode boolean, logo_path text, primary_color text,
               tagline text, city text, country text, joinable boolean, demo boolean)
language sql stable security definer set search_path = ''
as $$
  select o.slug, o.name, o.kind, o.faith_mode, b.logo_path, b.primary_color, b.tagline, b.city, o.country,
         (o.status in ('active', 'grace') and not o.joining_paused and not o.demo), o.demo
  from public.organizations o
  join public.org_branding b on b.organization_id = o.id
  where b.listed and o.status in ('active', 'grace', 'read_only')
    and (p_query is null or btrim(p_query) = ''
         or o.name ilike '%' || btrim(p_query) || '%'
         or b.city ilike '%' || btrim(p_query) || '%'
         or b.tagline ilike '%' || btrim(p_query) || '%')
  order by o.demo, o.name
  limit 100
$$;
grant execute on function public.list_clubs(text) to anon, authenticated;

-- Follow or unfollow a listed club. Adults only: a kid account is refused.
create function public.follow_club(p_slug text, p_follow boolean) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare v_org uuid;
begin
  if auth.uid() is null then raise exception 'not_allowed'; end if;
  if exists (select 1 from public.kids where user_id = auth.uid()) then raise exception 'not_allowed'; end if;
  select o.id into v_org from public.organizations o
  join public.org_branding b on b.organization_id = o.id
  where o.slug = lower(btrim(p_slug)) and o.status <> 'suspended' and b.listed;
  if v_org is null then raise exception 'not_found'; end if;
  if p_follow then
    insert into public.club_follows (user_id, organization_id) values (auth.uid(), v_org) on conflict do nothing;
  else
    delete from public.club_follows where user_id = auth.uid() and organization_id = v_org;
  end if;
  return p_follow;
end;
$$;
grant execute on function public.follow_club(text, boolean) to authenticated;

-- The adult home feed: published posts from clubs you follow, clubs your kids
-- are in, and clubs you work in. Kid accounts get nothing.
create function public.my_feed()
returns table (post_id uuid, title text, body text, created_at timestamptz,
               club_slug text, club_name text, primary_color text, logo_path text)
language sql stable security definer set search_path = ''
as $$
  with mine as (
    select organization_id from public.club_follows where user_id = auth.uid()
    union
    select k.organization_id from public.guardians g join public.kids k on k.id = g.kid_id where g.user_id = auth.uid()
    union
    select organization_id from public.memberships where user_id = auth.uid() and status = 'active'
  )
  select p.id, p.title, p.body, p.created_at, o.slug, o.name, b.primary_color, b.logo_path
  from public.club_posts p
  join public.organizations o on o.id = p.organization_id
  left join public.org_branding b on b.organization_id = o.id
  where p.published and o.status <> 'suspended'
    and p.organization_id in (select organization_id from mine)
    and not exists (select 1 from public.kids where user_id = auth.uid())
  order by p.created_at desc
  limit 50
$$;
grant execute on function public.my_feed() to authenticated;

-- Supabase's own defaults grant new functions and tables to anon; undo that.
revoke execute on function public.get_clubhouse(text), public.list_clubs(text), public.follow_club(text, boolean), public.my_feed() from public, anon, authenticated;
grant execute on function public.get_clubhouse(text), public.list_clubs(text) to anon, authenticated;
grant execute on function public.follow_club(text, boolean), public.my_feed() to authenticated;
revoke all on public.club_follows from anon;
revoke insert, update, delete on public.club_follows from authenticated;
