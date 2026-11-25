-- Kids core: Champ Points ledger, Fire Streak, levels, Trophies, Hall of
-- Champs, My Champ avatar, teacher stars. Every change to points goes
-- through app.award_points, which is idempotent per (kid, source, ref).

-- ---------------------------------------------------------------------------
-- catalogue: levels, point rules, trophies
-- ---------------------------------------------------------------------------

create table public.levels (
  code text primary key check (code ~ '^[a-z_]{2,32}$'),
  name text not null,
  min_points integer not null check (min_points >= 0),
  sort integer not null unique
);

create table public.point_rules (
  id uuid primary key default gen_random_uuid(),
  -- null = platform default; a row for an org overrides it
  organization_id uuid references public.organizations (id) on delete cascade,
  source text not null check (source ~ '^[a-z_]{2,40}$'),
  points integer not null check (points between 0 and 1000),
  unique nulls not distinct (organization_id, source)
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  code text not null check (code ~ '^[a-z0-9_]{2,40}$'),
  name text not null,
  description text not null,
  icon text not null default 'trophy',
  -- {"type": "visits"|"streak"|"points"|"stars"|"level"|"visits_in_window", "min": n}
  criteria jsonb not null,
  window_start timestamptz,
  window_end timestamptz,
  active boolean not null default true,
  sort integer not null default 0,
  unique nulls not distinct (organization_id, code)
);

-- ---------------------------------------------------------------------------
-- per kid
-- ---------------------------------------------------------------------------

alter table public.kids add column avatar jsonb not null default '{}'::jsonb;

create table public.point_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null,
  kid_id uuid not null,
  source text not null,
  ref text not null,
  points integer not null,
  awarded_by uuid references auth.users (id) on delete set null,
  note text check (note is null or char_length(note) <= 140),
  at timestamptz not null default now(),
  unique (kid_id, source, ref),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);
create index point_events_org_at on public.point_events (organization_id, at desc);
create index point_events_kid_at on public.point_events (kid_id, at desc);

create table public.activity_days (
  organization_id uuid not null,
  kid_id uuid not null,
  day date not null,
  primary key (kid_id, day),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);

create table public.kid_stats (
  kid_id uuid primary key,
  organization_id uuid not null,
  points_total integer not null default 0,
  streak_current integer not null default 0,
  streak_best integer not null default 0,
  last_active_day date,
  visits integer not null default 0,
  stars integer not null default 0,
  updated_at timestamptz not null default now(),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);

create table public.kid_badges (
  organization_id uuid not null,
  kid_id uuid not null,
  badge_id uuid not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (kid_id, badge_id),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- RLS: read-only for the kid, their guardians and their club's staff
-- ---------------------------------------------------------------------------

alter table public.levels enable row level security;
alter table public.point_rules enable row level security;
alter table public.badges enable row level security;
alter table public.point_events enable row level security;
alter table public.activity_days enable row level security;
alter table public.kid_stats enable row level security;
alter table public.kid_badges enable row level security;

revoke all on public.levels, public.point_rules, public.badges, public.point_events,
  public.activity_days, public.kid_stats, public.kid_badges from anon;
revoke insert, update, delete on public.levels, public.point_rules, public.badges, public.point_events,
  public.activity_days, public.kid_stats, public.kid_badges from authenticated;

create policy levels_read on public.levels for select to authenticated using (true);
create policy point_rules_read on public.point_rules for select to authenticated using (
  organization_id is null or (select app.is_platform_admin()) or app.is_org_member(organization_id)
);
create policy badges_read on public.badges for select to authenticated using (
  organization_id is null or (select app.is_platform_admin()) or app.is_org_member(organization_id)
);

create function app.can_see_kid(p_org uuid, p_kid uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select app.is_platform_admin()
      or app.has_org_role(p_org, array['org_admin', 'teacher']::public.org_role[])
      or app.is_guardian_of(p_kid)
      or exists (select 1 from public.kids k where k.id = p_kid and k.user_id = auth.uid())
$$;
grant execute on function app.can_see_kid(uuid, uuid) to authenticated;

create policy point_events_read on public.point_events for select to authenticated using (app.can_see_kid(organization_id, kid_id));
create policy activity_days_read on public.activity_days for select to authenticated using (app.can_see_kid(organization_id, kid_id));
create policy kid_stats_read on public.kid_stats for select to authenticated using (app.can_see_kid(organization_id, kid_id));
create policy kid_badges_read on public.kid_badges for select to authenticated using (app.can_see_kid(organization_id, kid_id));

-- ---------------------------------------------------------------------------
-- engine
-- ---------------------------------------------------------------------------

create function app.points_for(p_org uuid, p_source text) returns integer
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select points from public.point_rules where organization_id = p_org and source = p_source),
    (select points from public.point_rules where organization_id is null and source = p_source),
    0)
$$;

create function app.level_of(p_points integer) returns public.levels
language sql stable security definer set search_path = ''
as $$ select * from public.levels where min_points <= greatest(p_points, 0) order by min_points desc limit 1 $$;

create function app.ensure_stats(p_kid uuid) returns void
language sql security definer set search_path = ''
as $$
  insert into public.kid_stats (kid_id, organization_id)
  select id, organization_id from public.kids where id = p_kid
  on conflict (kid_id) do nothing
$$;

-- Checks every active trophy this kid has not earned yet.
create function app.evaluate_badges(p_kid uuid) returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_org uuid;
  s public.kid_stats%rowtype;
  b record;
  v_ok boolean;
  v_n integer := 0;
begin
  select organization_id into v_org from public.kids where id = p_kid;
  select * into s from public.kid_stats where kid_id = p_kid;
  if v_org is null or s.kid_id is null then return 0; end if;
  for b in
    select * from public.badges x
    where x.active and (x.organization_id is null or x.organization_id = v_org)
      and not exists (select 1 from public.kid_badges kb where kb.kid_id = p_kid and kb.badge_id = x.id)
  loop
    v_ok := case b.criteria ->> 'type'
      when 'visits' then s.visits >= (b.criteria ->> 'min')::int
      when 'streak' then s.streak_best >= (b.criteria ->> 'min')::int
      when 'points' then s.points_total >= (b.criteria ->> 'min')::int
      when 'stars' then s.stars >= (b.criteria ->> 'min')::int
      when 'level' then s.points_total >= coalesce((select min_points from public.levels where code = b.criteria ->> 'min'), 2147483647)
      when 'visits_in_window' then b.window_start is not null and b.window_end is not null
        and now() between b.window_start and b.window_end
        and (select count(*) from public.activity_days d
             where d.kid_id = p_kid
               and d.day between (b.window_start at time zone 'UTC')::date and (b.window_end at time zone 'UTC')::date)
            >= (b.criteria ->> 'min')::int
      else false
    end;
    if v_ok then
      insert into public.kid_badges (organization_id, kid_id, badge_id) values (v_org, p_kid, b.id) on conflict do nothing;
      v_n := v_n + 1;
    end if;
  end loop;
  return v_n;
end;
$$;

-- The only way points change. Returns the points added (0 on a replay).
create function app.award_points(p_kid uuid, p_source text, p_ref text, p_by uuid default null, p_note text default null)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare v_org uuid; v_pts integer; v_id bigint;
begin
  select organization_id into v_org from public.kids where id = p_kid and status = 'active';
  if v_org is null then raise exception 'kid_not_found'; end if;
  v_pts := app.points_for(v_org, p_source);
  insert into public.point_events (organization_id, kid_id, source, ref, points, awarded_by, note)
  values (v_org, p_kid, p_source, p_ref, v_pts, p_by, p_note)
  on conflict (kid_id, source, ref) do nothing
  returning id into v_id;
  if v_id is null then return 0; end if;
  perform app.ensure_stats(p_kid);
  update public.kid_stats set points_total = points_total + v_pts,
    stars = stars + case when p_source = 'teacher_star' then 1 else 0 end,
    updated_at = now()
  where kid_id = p_kid;
  perform app.evaluate_badges(p_kid);
  return v_pts;
end;
$$;

-- Records that a kid was active on a day (in the club's own time zone),
-- updates the Fire Streak, and awards the daily visit once per day.
create function app.record_activity(p_kid uuid, p_day date) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_org uuid; s public.kid_stats%rowtype; v_new integer;
begin
  select organization_id into v_org from public.kids where id = p_kid and status = 'active';
  if v_org is null then raise exception 'kid_not_found'; end if;
  perform app.ensure_stats(p_kid);
  insert into public.activity_days (organization_id, kid_id, day) values (v_org, p_kid, p_day)
  on conflict do nothing;
  get diagnostics v_new = row_count;
  if v_new = 0 then return; end if;
  select * into s from public.kid_stats where kid_id = p_kid for update;
  if s.last_active_day is null or p_day > s.last_active_day then
    update public.kid_stats set
      streak_current = case when s.last_active_day = p_day - 1 then s.streak_current + 1 else 1 end,
      streak_best = greatest(s.streak_best, case when s.last_active_day = p_day - 1 then s.streak_current + 1 else 1 end),
      last_active_day = p_day,
      visits = visits + 1,
      updated_at = now()
    where kid_id = p_kid;
  else
    update public.kid_stats set visits = visits + 1, updated_at = now() where kid_id = p_kid;
  end if;
  perform app.award_points(p_kid, 'daily_visit', p_day::text);
end;
$$;

-- Called by a signed-in kid when they open Champ Town.
create function public.record_my_visit() returns void
language plpgsql security definer set search_path = ''
as $$
declare v_kid uuid; v_tz text;
begin
  select k.id, o.timezone into v_kid, v_tz
  from public.kids k join public.organizations o on o.id = k.organization_id
  where k.user_id = auth.uid() and k.status = 'active' and o.status in ('active', 'grace');
  if v_kid is null then return; end if;
  perform app.record_activity(v_kid, (now() at time zone v_tz)::date);
end;
$$;

-- A teacher or Org Admin gives a kid a star (+ points). Max 5 per kid per adult per day.
create function public.give_star(p_kid uuid, p_note text default null) returns integer
language plpgsql security definer set search_path = ''
as $$
declare v_org uuid; v_today integer;
begin
  select organization_id into v_org from public.kids where id = p_kid and status = 'active';
  if v_org is null or not app.has_org_role(v_org, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if not app.org_is_writable(v_org) then raise exception 'organization_not_active'; end if;
  select count(*) into v_today from public.point_events
  where kid_id = p_kid and source = 'teacher_star' and awarded_by = auth.uid() and at > now() - interval '1 day';
  if v_today >= 5 then raise exception 'star_limit_reached'; end if;
  perform app.audit(v_org, auth.uid(), 'kid.star_given', 'kid', p_kid::text, jsonb_build_object('note', left(p_note, 140)));
  return app.award_points(p_kid, 'teacher_star', gen_random_uuid()::text, auth.uid(), left(nullif(btrim(p_note), ''), 140));
end;
$$;

-- My Champ: a kid saves their avatar. Items are checked against what their level unlocks.
create function public.update_my_champ(p_avatar jsonb) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_kid uuid; v_points integer; v_level public.levels; v_sort integer; k text;
begin
  select k2.id into v_kid from public.kids k2 where k2.user_id = auth.uid() and k2.status = 'active';
  if v_kid is null then raise exception 'not_allowed'; end if;
  if jsonb_typeof(p_avatar) <> 'object' then raise exception 'bad_avatar'; end if;
  for k in select jsonb_object_keys(p_avatar) loop
    if k not in ('skin', 'hair', 'hairColor', 'outfit', 'extra') then raise exception 'bad_avatar'; end if;
  end loop;
  if coalesce(p_avatar ->> 'skin', '0') !~ '^[0-5]$' or coalesce(p_avatar ->> 'hair', '0') !~ '^[0-5]$'
     or coalesce(p_avatar ->> 'hairColor', '0') !~ '^[0-5]$' or coalesce(p_avatar ->> 'outfit', '0') !~ '^[0-7]$' then
    raise exception 'bad_avatar';
  end if;
  select coalesce(points_total, 0) into v_points from public.kid_stats where kid_id = v_kid;
  v_level := app.level_of(coalesce(v_points, 0));
  v_sort := v_level.sort;
  -- extras unlock by level: headband (Rising Star), cape (All-Star), medal (Legend), crown (Champ)
  if coalesce(p_avatar ->> 'extra', 'none') not in ('none', 'headband', 'cape', 'medal', 'crown') then raise exception 'bad_avatar'; end if;
  if (p_avatar ->> 'extra' = 'headband' and v_sort < 2) or (p_avatar ->> 'extra' = 'cape' and v_sort < 3)
     or (p_avatar ->> 'extra' = 'medal' and v_sort < 4) or (p_avatar ->> 'extra' = 'crown' and v_sort < 5) then
    raise exception 'locked_item';
  end if;
  update public.kids set avatar = p_avatar where id = v_kid;
end;
$$;

-- Hall of Champs. Kids see their own class only (or their club if they have
-- no class); staff pick any class in their club. First name and surname
-- initial only, never usernames. Kids still marked "new" are left out,
-- except the caller themselves.
create function public.hall_of_champs(p_class uuid default null, p_period text default 'week')
returns table (kid_id uuid, first_name text, last_initial text, avatar jsonb, points integer, is_me boolean)
language plpgsql stable security definer set search_path = ''
as $$
declare v_me public.kids%rowtype; v_org uuid; v_class uuid; v_since timestamptz; v_tz text;
begin
  select * into v_me from public.kids where user_id = auth.uid() and status = 'active';
  if v_me.id is not null then
    v_org := v_me.organization_id;
    v_class := v_me.class_id;
  else
    select organization_id into v_org from public.classes where id = p_class;
    if v_org is null or not app.has_org_role(v_org, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
    v_class := p_class;
  end if;
  select timezone into v_tz from public.organizations where id = v_org;
  v_since := case when p_period = 'week' then (date_trunc('week', now() at time zone v_tz) at time zone v_tz) else '-infinity'::timestamptz end;
  return query
    select k.id, k.first_name, k.last_initial, k.avatar,
           coalesce((select sum(e.points) from public.point_events e where e.kid_id = k.id and e.at >= v_since), 0)::int,
           coalesce(k.id = v_me.id, false)
    from public.kids k
    where k.organization_id = v_org and k.status = 'active'
      and (k.class_id is not distinct from v_class)
      and (k.confirmed_at is not null or k.id = v_me.id)
    order by 5 desc, k.first_name
    limit 50;
end;
$$;

-- ---------------------------------------------------------------------------
-- grants
-- ---------------------------------------------------------------------------

revoke execute on all functions in schema public from public, anon, authenticated;
revoke execute on all functions in schema app from public, anon, authenticated;

grant execute on function
  app.is_platform_admin(), app.has_org_role(uuid, public.org_role[]), app.my_kid_org(), app.is_org_member(uuid),
  app.org_status(uuid), app.org_is_writable(uuid), app.org_can_setup(uuid), app.is_guardian_of(uuid),
  app.org_kid_limit(uuid), app.org_has_feature(uuid, text)
to anon, authenticated;
grant execute on function app.can_see_kid(uuid, uuid) to authenticated;

grant execute on function public.get_clubhouse(text) to anon, authenticated;
grant execute on function
  public.create_organization(text, text, text, text, text, text, boolean),
  public.mark_as_paid(uuid, uuid, text, timestamptz, text, bigint, text, text),
  public.suspend_organization(uuid, text),
  public.unsuspend_organization(uuid),
  public.regenerate_join_code(uuid),
  public.approve_kid(uuid),
  public.confirm_kid(uuid),
  public.archive_kid(uuid, text),
  public.reset_kid_pin(uuid, text),
  public.record_my_visit(),
  public.give_star(uuid, text),
  public.update_my_champ(jsonb),
  public.hall_of_champs(uuid, text)
to authenticated;

grant execute on all functions in schema app to service_role;
grant execute on all functions in schema public to service_role;

-- ---------------------------------------------------------------------------
-- seed: levels, default point rules, default trophies
-- ---------------------------------------------------------------------------

insert into public.levels (code, name, min_points, sort) values
  ('rookie', 'Rookie', 0, 1),
  ('rising_star', 'Rising Star', 100, 2),
  ('all_star', 'All-Star', 300, 3),
  ('legend', 'Legend', 700, 4),
  ('champ', 'Champ', 1500, 5);

insert into public.point_rules (organization_id, source, points) values
  (null, 'daily_visit', 5),
  (null, 'teacher_star', 10);

insert into public.badges (code, name, description, icon, criteria, sort) values
  ('welcome', 'Welcome, Champ', 'Your first visit to Champ Town.', 'house', '{"type":"visits","min":1}', 1),
  ('streak_3', 'On Fire', 'A 3 day Fire Streak.', 'flame', '{"type":"streak","min":3}', 2),
  ('streak_7', 'Week of Fire', 'A 7 day Fire Streak.', 'flame', '{"type":"streak","min":7}', 3),
  ('streak_30', 'Unstoppable', 'A 30 day Fire Streak.', 'flame', '{"type":"streak","min":30}', 4),
  ('first_star', 'Shining Star', 'Your first star from a teacher.', 'star', '{"type":"stars","min":1}', 5),
  ('stars_10', 'Star Collector', '10 stars from your teachers.', 'star', '{"type":"stars","min":10}', 6),
  ('points_100', 'Century', '100 Champ Points.', 'coin', '{"type":"points","min":100}', 7),
  ('points_500', 'Big Scorer', '500 Champ Points.', 'coin', '{"type":"points","min":500}', 8),
  ('level_all_star', 'All-Star', 'Reach All-Star level.', 'trophy', '{"type":"level","min":"all_star"}', 9),
  ('level_champ', 'Crowned Champ', 'Reach Champ, the top level.', 'crown', '{"type":"level","min":"champ"}', 10);

insert into public.badges (code, name, description, icon, criteria, window_start, window_end, sort) values
  ('christmas_cup_2026', 'Christmas Cup 2026', 'Visit Champ Town during December 2026. Only available this season!', 'gift',
   '{"type":"visits_in_window","min":1}', '2026-12-01 00:00:00+00', '2026-12-31 23:59:59+00', 20);
