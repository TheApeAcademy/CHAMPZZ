-- Teacher and admin tools: team invites and roles, check-in and check-out
-- with pickup codes, attendance, certificates, seasons, club insights,
-- club motto and logo storage.

-- ---------------------------------------------------------------------------
-- team invites and roles
-- ---------------------------------------------------------------------------

-- The token itself is shown once to the Org Admin and never stored; only its
-- sha256 is kept, and even that column is not readable by any client.
create table public.team_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role public.org_role not null check (role in ('org_admin', 'teacher')),
  email text check (email is null or char_length(email) <= 254),
  token_hash text not null unique,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_by uuid references auth.users (id) on delete set null,
  accepted_at timestamptz,
  revoked_at timestamptz
);
create index team_invites_org on public.team_invites (organization_id, created_at desc);

create function public.create_team_invite(p_org uuid, p_role text, p_email text default null) returns text
language plpgsql security definer set search_path = ''
as $$
declare v_token text; v_open integer;
begin
  if not app.has_org_role(p_org, array['org_admin']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if not app.org_can_setup(p_org) then raise exception 'organization_not_active'; end if;
  if p_role not in ('org_admin', 'teacher') then raise exception 'bad_role'; end if;
  select count(*) into v_open from public.team_invites
  where organization_id = p_org and accepted_at is null and revoked_at is null and expires_at > now();
  if v_open >= 25 then raise exception 'too_many_invites'; end if;
  v_token := encode(extensions.gen_random_bytes(24), 'hex');
  insert into public.team_invites (organization_id, role, email, token_hash, created_by, expires_at)
  values (p_org, p_role::public.org_role, nullif(lower(btrim(p_email)), ''), encode(extensions.digest(v_token, 'sha256'), 'hex'),
          auth.uid(), now() + interval '7 days');
  perform app.audit(p_org, auth.uid(), 'team.invite', 'role', p_role, jsonb_build_object('email', nullif(lower(btrim(p_email)), '')));
  return v_token;
end;
$$;

create function public.accept_team_invite(p_token text) returns text
language plpgsql security definer set search_path = ''
as $$
declare i public.team_invites%rowtype; v_uid uuid := auth.uid(); v_slug text; v_name text; a uuid;
begin
  if v_uid is null then raise exception 'not_allowed'; end if;
  -- kids can never join a team
  if exists (select 1 from auth.users u where u.id = v_uid and u.raw_app_meta_data ->> 'kind' = 'kid')
     or exists (select 1 from public.kids k where k.user_id = v_uid) then
    raise exception 'not_allowed';
  end if;
  select * into i from public.team_invites
  where token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
  for update;
  if i.id is null or i.accepted_at is not null or i.revoked_at is not null or i.expires_at <= now()
     or app.org_status(i.organization_id) = 'suspended' then
    raise exception 'invite_invalid';
  end if;
  insert into public.memberships (organization_id, user_id, role)
  values (i.organization_id, v_uid, i.role)
  on conflict (organization_id, user_id, role) do update set status = 'active';
  update public.team_invites set accepted_by = v_uid, accepted_at = now() where id = i.id;
  perform app.audit(i.organization_id, v_uid, 'team.join', 'role', i.role::text, '{}'::jsonb);
  select slug into v_slug from public.organizations where id = i.organization_id;
  select coalesce(nullif(full_name, ''), 'Someone') into v_name from public.profiles where id = v_uid;
  for a in select m.user_id from public.memberships m
           where m.organization_id = i.organization_id and m.role = 'org_admin' and m.status = 'active' and m.user_id <> v_uid loop
    perform app.notify(i.organization_id, a, 'team_joined', coalesce(v_name, 'Someone') || ' joined your team',
                       case when i.role = 'org_admin' then 'As an Org Admin.' else 'As a teacher.' end, '/o/' || v_slug || '/team');
  end loop;
  return v_slug;
end;
$$;

create function public.revoke_team_invite(p_invite uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_org uuid;
begin
  select organization_id into v_org from public.team_invites where id = p_invite and accepted_at is null;
  if v_org is null or not app.has_org_role(v_org, array['org_admin']::public.org_role[]) then raise exception 'not_allowed'; end if;
  update public.team_invites set revoked_at = now() where id = p_invite and revoked_at is null;
  perform app.audit(v_org, auth.uid(), 'team.invite_revoked', 'invite', p_invite::text, '{}'::jsonb);
end;
$$;

create function public.team_members(p_org uuid)
returns table (membership_id uuid, user_id uuid, full_name text, email text, role public.org_role, joined_at timestamptz, is_me boolean)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not app.has_org_role(p_org, array['org_admin']::public.org_role[]) then raise exception 'not_allowed'; end if;
  return query
    select m.id, m.user_id, coalesce(p.full_name, ''), u.email::text, m.role, m.created_at, m.user_id = auth.uid()
    from public.memberships m
    join auth.users u on u.id = m.user_id
    left join public.profiles p on p.id = m.user_id
    where m.organization_id = p_org and m.status = 'active' and m.role in ('org_admin', 'teacher')
    order by m.role, coalesce(p.full_name, ''), u.email;
end;
$$;

create function app.is_last_admin(p_membership uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.memberships m where m.id = p_membership and m.role = 'org_admin' and m.status = 'active')
     and (select count(*) from public.memberships m2
          where m2.organization_id = (select organization_id from public.memberships where id = p_membership)
            and m2.role = 'org_admin' and m2.status = 'active') <= 1
$$;

create function public.change_member_role(p_membership uuid, p_role text) returns void
language plpgsql security definer set search_path = ''
as $$
declare m public.memberships%rowtype; v_other uuid;
begin
  select * into m from public.memberships where id = p_membership and status = 'active' for update;
  if m.id is null or not app.has_org_role(m.organization_id, array['org_admin']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if p_role not in ('org_admin', 'teacher') or m.role not in ('org_admin', 'teacher') then raise exception 'bad_role'; end if;
  if m.role::text = p_role then return; end if;
  if app.is_last_admin(m.id) then raise exception 'last_admin'; end if;
  select id into v_other from public.memberships where organization_id = m.organization_id and user_id = m.user_id and role = p_role::public.org_role;
  if v_other is not null then
    update public.memberships set status = 'active' where id = v_other;
    update public.memberships set status = 'removed' where id = m.id;
  else
    update public.memberships set role = p_role::public.org_role where id = m.id;
  end if;
  perform app.audit(m.organization_id, auth.uid(), 'team.role_changed', 'user', m.user_id::text, jsonb_build_object('from', m.role, 'to', p_role));
end;
$$;

create function public.remove_member(p_membership uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare m public.memberships%rowtype;
begin
  select * into m from public.memberships where id = p_membership and status = 'active' for update;
  if m.id is null or not app.has_org_role(m.organization_id, array['org_admin']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if m.role not in ('org_admin', 'teacher') then raise exception 'bad_role'; end if;
  if app.is_last_admin(m.id) then raise exception 'last_admin'; end if;
  update public.memberships set status = 'removed' where id = m.id;
  if m.role = 'teacher' then
    delete from public.class_teachers where organization_id = m.organization_id and user_id = m.user_id;
  end if;
  perform app.audit(m.organization_id, auth.uid(), 'team.removed', 'user', m.user_id::text, jsonb_build_object('role', m.role));
end;
$$;

-- ---------------------------------------------------------------------------
-- check-in, check-out, attendance
-- ---------------------------------------------------------------------------

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  kid_id uuid not null,
  class_id uuid,
  day date not null,
  checked_in_at timestamptz not null default now(),
  checked_in_by uuid references auth.users (id) on delete set null,
  pickup_code text not null check (pickup_code ~ '^[0-9]{4}$'),
  failed_pickups integer not null default 0,
  checked_out_at timestamptz,
  checked_out_by uuid references auth.users (id) on delete set null,
  checkout_note text check (checkout_note is null or char_length(checkout_note) <= 300),
  unique (kid_id, day),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);
create index attendance_org_day on public.attendance (organization_id, day);

create function app.org_today(p_org uuid) returns date
language sql stable security definer set search_path = ''
as $$ select (now() at time zone o.timezone)::date from public.organizations o where o.id = p_org $$;

create function public.check_in_kid(p_kid uuid)
returns table (attendance_id uuid, pickup_code text, already boolean)
language plpgsql security definer set search_path = ''
as $$
declare k public.kids%rowtype; v_day date; v_id uuid; v_code text; g uuid;
begin
  select * into k from public.kids where id = p_kid and status = 'active';
  if k.id is null or not app.has_org_role(k.organization_id, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if not app.org_is_writable(k.organization_id) then raise exception 'organization_not_active'; end if;
  v_day := app.org_today(k.organization_id);
  v_code := lpad(((('x' || encode(extensions.gen_random_bytes(2), 'hex'))::bit(16)::int) % 10000)::text, 4, '0');
  insert into public.attendance (organization_id, kid_id, class_id, day, checked_in_by, pickup_code)
  values (k.organization_id, k.id, k.class_id, v_day, auth.uid(), v_code)
  on conflict (kid_id, day) do nothing
  returning id into v_id;
  if v_id is null then
    return query select a.id, a.pickup_code, true from public.attendance a where a.kid_id = k.id and a.day = v_day;
    return;
  end if;
  -- a teacher has seen the child in person: that is the first-visit confirmation
  if k.confirmed_at is null then
    update public.kids set confirmed_at = now(), confirmed_by = auth.uid() where id = k.id;
  end if;
  perform app.award_points(k.id, 'attendance', v_day::text, auth.uid());
  for g in select gd.user_id from public.guardians gd where gd.kid_id = k.id loop
    perform app.notify(k.organization_id, g, 'checked_in', k.first_name || ' is checked in',
                       'Pickup code ' || v_code || '. Show it when you collect them.', '/p');
  end loop;
  return query select v_id, v_code, false;
end;
$$;

-- Returns 'ok', 'wrong_code' or 'locked' (not an exception, so a wrong try is counted).
-- Works in every org state: a child who is checked in must always be able to go home.
create function public.check_out_kid(p_attendance uuid, p_code text) returns text
language plpgsql security definer set search_path = ''
as $$
declare a public.attendance%rowtype; v_name text; g uuid;
begin
  select * into a from public.attendance where id = p_attendance for update;
  if a.id is null or not app.has_org_role(a.organization_id, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if a.checked_out_at is not null then raise exception 'already_checked_out'; end if;
  if a.failed_pickups >= 5 then return 'locked'; end if;
  if btrim(coalesce(p_code, '')) <> a.pickup_code then
    update public.attendance set failed_pickups = failed_pickups + 1 where id = a.id;
    perform app.audit(a.organization_id, auth.uid(), 'attendance.wrong_pickup_code', 'kid', a.kid_id::text, '{}'::jsonb);
    return case when a.failed_pickups + 1 >= 5 then 'locked' else 'wrong_code' end;
  end if;
  update public.attendance set checked_out_at = now(), checked_out_by = auth.uid() where id = a.id;
  select first_name into v_name from public.kids where id = a.kid_id;
  for g in select gd.user_id from public.guardians gd where gd.kid_id = a.kid_id loop
    perform app.notify(a.organization_id, g, 'checked_out', v_name || ' has been collected', null, '/p');
  end loop;
  return 'ok';
end;
$$;

create function public.check_out_override(p_attendance uuid, p_reason text) returns void
language plpgsql security definer set search_path = ''
as $$
declare a public.attendance%rowtype; v_name text; g uuid;
begin
  select * into a from public.attendance where id = p_attendance for update;
  if a.id is null or not app.has_org_role(a.organization_id, array['org_admin']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if a.checked_out_at is not null then raise exception 'already_checked_out'; end if;
  if char_length(btrim(coalesce(p_reason, ''))) < 3 then raise exception 'reason_required'; end if;
  update public.attendance set checked_out_at = now(), checked_out_by = auth.uid(),
    checkout_note = left('Released without code: ' || btrim(p_reason), 300) where id = a.id;
  perform app.audit(a.organization_id, auth.uid(), 'attendance.override_checkout', 'kid', a.kid_id::text, jsonb_build_object('reason', left(btrim(p_reason), 300)));
  select first_name into v_name from public.kids where id = a.kid_id;
  for g in select gd.user_id from public.guardians gd where gd.kid_id = a.kid_id loop
    perform app.notify(a.organization_id, g, 'checked_out', v_name || ' has been collected', 'Released by an Org Admin without the pickup code.', '/p', 'urgent');
  end loop;
end;
$$;

create function public.my_pickup_codes()
returns table (attendance_id uuid, kid_id uuid, first_name text, club text, day date, pickup_code text, checked_in_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select a.id, a.kid_id, k.first_name, o.name, a.day, a.pickup_code, a.checked_in_at
  from public.attendance a
  join public.guardians g on g.kid_id = a.kid_id and g.user_id = auth.uid()
  join public.kids k on k.id = a.kid_id
  join public.organizations o on o.id = a.organization_id
  where a.checked_out_at is null and a.day >= app.org_today(a.organization_id) - 1
  order by a.checked_in_at desc
$$;

insert into public.point_rules (organization_id, source, points) values (null, 'attendance', 10);

-- ---------------------------------------------------------------------------
-- certificates
-- ---------------------------------------------------------------------------

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  kid_id uuid not null,
  title text not null check (char_length(title) between 2 and 80),
  reason text check (reason is null or char_length(reason) <= 200),
  issued_by uuid references auth.users (id) on delete set null,
  issued_at timestamptz not null default now(),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);
create index certificates_kid on public.certificates (kid_id, issued_at desc);

create function public.issue_certificate(p_kid uuid, p_title text, p_reason text default null) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare k public.kids%rowtype; v_id uuid; v_slug text; g uuid;
begin
  select * into k from public.kids where id = p_kid and status = 'active';
  if k.id is null or not app.has_org_role(k.organization_id, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if not app.org_is_writable(k.organization_id) then raise exception 'organization_not_active'; end if;
  if char_length(btrim(coalesce(p_title, ''))) < 2 then raise exception 'title_required'; end if;
  insert into public.certificates (organization_id, kid_id, title, reason, issued_by)
  values (k.organization_id, k.id, left(btrim(p_title), 80), left(nullif(btrim(p_reason), ''), 200), auth.uid())
  returning id into v_id;
  v_slug := app.org_slug(k.organization_id);
  perform app.notify(k.organization_id, k.user_id, 'certificate', 'You earned a certificate!', left(btrim(p_title), 80), '/k/' || v_slug || '/certificates/' || v_id);
  for g in select gd.user_id from public.guardians gd where gd.kid_id = k.id loop
    perform app.notify(k.organization_id, g, 'certificate', k.first_name || ' earned a certificate', left(btrim(p_title), 80), '/p/certificates/' || v_id);
  end loop;
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- seasons
-- ---------------------------------------------------------------------------

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);
create index seasons_org on public.seasons (organization_id, starts_on desc);

create function app.current_season_start(p_org uuid) returns timestamptz
language sql stable security definer set search_path = ''
as $$
  select (s.starts_on::timestamp at time zone o.timezone)
  from public.seasons s join public.organizations o on o.id = s.organization_id
  where s.organization_id = p_org and app.org_today(p_org) between s.starts_on and s.ends_on
  order by s.starts_on desc limit 1
$$;

create or replace function public.hall_of_champs(p_class uuid default null, p_period text default 'week')
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
  v_since := case
    when p_period = 'week' then (date_trunc('week', now() at time zone v_tz) at time zone v_tz)
    when p_period = 'season' then coalesce(app.current_season_start(v_org), '-infinity'::timestamptz)
    else '-infinity'::timestamptz end;
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
-- insights
-- ---------------------------------------------------------------------------

create function public.club_insights(p_org uuid) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare v_today date; v_week timestamptz; v_tz text;
begin
  if not app.has_org_role(p_org, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
  v_today := app.org_today(p_org);
  select timezone into v_tz from public.organizations where id = p_org;
  v_week := date_trunc('week', now() at time zone v_tz) at time zone v_tz;
  return jsonb_build_object(
    'kids_active', (select count(*) from public.kids where organization_id = p_org and status = 'active'),
    'kids_new', (select count(*) from public.kids where organization_id = p_org and status = 'active' and confirmed_at is null),
    'here_today', (select count(*) from public.attendance where organization_id = p_org and day = v_today),
    'points_this_week', (select coalesce(sum(points), 0) from public.point_events where organization_id = p_org and at >= v_week),
    'work_handed_in_this_week', (select count(*) from public.submissions where organization_id = p_org and submitted_at >= v_week),
    'weekly_attendance', (
      select coalesce(jsonb_agg(jsonb_build_object('week', w.wk, 'count', w.n) order by w.wk), '[]'::jsonb)
      from (
        select gs::date as wk,
               (select count(*) from public.attendance a where a.organization_id = p_org and a.day >= gs::date and a.day < gs::date + 7) as n
        from generate_series(date_trunc('week', v_today::timestamp) - interval '7 weeks', date_trunc('week', v_today::timestamp), interval '1 week') gs
      ) w),
    'not_seen', (
      select coalesce(jsonb_agg(jsonb_build_object('kid_id', x.id, 'first_name', x.first_name, 'last_initial', x.last_initial, 'last_seen', x.last_seen) order by x.last_seen nulls first), '[]'::jsonb)
      from (
        select k.id, k.first_name, k.last_initial, (select max(a.day) from public.attendance a where a.kid_id = k.id) as last_seen
        from public.kids k
        where k.organization_id = p_org and k.status = 'active' and k.created_at < now() - interval '21 days'
      ) x
      where x.last_seen is null or x.last_seen < v_today - 21
      limit 20)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- branding: motto (Anthem in CCT became each club's own motto or song) and logo storage
-- ---------------------------------------------------------------------------

alter table public.org_branding add column motto text check (motto is null or char_length(motto) <= 400);

drop function public.get_clubhouse(text);
create function public.get_clubhouse(p_slug text)
returns table (organization_id uuid, slug text, name text, kind text, faith_mode boolean,
               logo_path text, primary_color text, tagline text, joinable boolean, motto text)
language sql stable security definer set search_path = ''
as $$
  select o.id, o.slug, o.name, o.kind, o.faith_mode, b.logo_path, b.primary_color, b.tagline,
         (o.status in ('active', 'grace') and not o.joining_paused), b.motto
  from public.organizations o
  left join public.org_branding b on b.organization_id = o.id
  where o.slug = lower(btrim(p_slug)) and o.status <> 'suspended'
$$;

-- Public bucket for club logos. Uploads go through the server (service role)
-- after an Org Admin check, so no client storage policies are needed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('branding', 'branding', true, 524288, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.team_invites enable row level security;
alter table public.attendance enable row level security;
alter table public.certificates enable row level security;
alter table public.seasons enable row level security;

revoke all on public.team_invites, public.attendance, public.certificates, public.seasons from anon;
revoke all on public.team_invites, public.attendance, public.certificates from authenticated;
-- no client role ever reads an invite hash or a pickup code directly
grant select (id, organization_id, role, email, created_at, expires_at, accepted_at, revoked_at) on public.team_invites to authenticated;
grant select (id, organization_id, kid_id, class_id, day, checked_in_at, checked_out_at, checkout_note) on public.attendance to authenticated;
grant select on public.certificates to authenticated;

create policy team_invites_read on public.team_invites for select to authenticated
  using (app.has_org_role(organization_id, array['org_admin']::public.org_role[]));
create policy attendance_read on public.attendance for select to authenticated using (app.can_see_kid(organization_id, kid_id));
create policy certificates_read on public.certificates for select to authenticated using (app.can_see_kid(organization_id, kid_id));

create policy seasons_read on public.seasons for select to authenticated using (
  app.is_org_member(organization_id) or app.my_kid_org() = organization_id
);
create policy seasons_insert on public.seasons for insert to authenticated
  with check (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_can_setup(organization_id));
create policy seasons_update on public.seasons for update to authenticated
  using (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_can_setup(organization_id))
  with check (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_can_setup(organization_id));
create policy seasons_delete on public.seasons for delete to authenticated
  using (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_can_setup(organization_id));

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
grant execute on function app.can_see_kid(uuid, uuid), app.kid_sees(uuid, uuid) to authenticated;

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
  public.hall_of_champs(uuid, text),
  public.submit_concern(text, boolean),
  public.my_concerns(),
  public.my_concern_replies(uuid),
  public.staff_concerns(uuid),
  public.staff_concern(uuid),
  public.staff_concern_replies(uuid),
  public.reply_to_concern(uuid, text),
  public.set_concern_status(uuid, text),
  public.add_concern_note(uuid, text),
  public.staff_concern_notes(uuid),
  public.send_message(text, uuid),
  public.submit_assignment(uuid, text),
  public.grade_submission(uuid, integer, text),
  public.club_local_to_utc(text, text),
  public.create_team_invite(uuid, text, text),
  public.accept_team_invite(text),
  public.revoke_team_invite(uuid),
  public.team_members(uuid),
  public.change_member_role(uuid, text),
  public.remove_member(uuid),
  public.check_in_kid(uuid),
  public.check_out_kid(uuid, text),
  public.check_out_override(uuid, text),
  public.my_pickup_codes(),
  public.issue_certificate(uuid, text, text),
  public.club_insights(uuid)
to authenticated;

grant execute on all functions in schema app to service_role;
grant execute on all functions in schema public to service_role;
