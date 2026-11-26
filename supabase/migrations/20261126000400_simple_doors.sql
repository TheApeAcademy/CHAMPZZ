-- Simple doors: one sign-in for everyone, a 14-day trial, private or public
-- clubs, teachers who ask to join and wait for approval, and "Champzz at
-- home" for kids with no club (made by a parent, or started by the kid and
-- approved by a parent).

-- ---------------------------------------------------------------------------
-- 14-day free trial: a new club is active at once on Starter, capped at 15
-- kids. When the trial ends it follows the normal lifecycle (grace, then
-- read-only), so nothing is ever deleted.
-- ---------------------------------------------------------------------------
alter table public.subscriptions drop constraint if exists subscriptions_provider_check;
alter table public.subscriptions add constraint subscriptions_provider_check
  check (provider in ('flutterwave', 'stripe', 'manual', 'trial'));

create or replace function public.create_organization(
  p_name text, p_slug text, p_kind text, p_country text default 'NG',
  p_timezone text default 'Africa/Lagos', p_currency text default 'NGN', p_faith_mode boolean default true
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_org uuid; v_uid uuid := auth.uid();
begin
  if v_uid is null or not exists (select 1 from public.profiles where id = v_uid) then
    raise exception 'not_allowed';
  end if;
  if p_kind not in ('church', 'club', 'school', 'other') then raise exception 'bad_kind'; end if;
  if (select count(*) from public.memberships where user_id = v_uid and role = 'org_admin') >= 5 then
    raise exception 'too_many_organizations';
  end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = p_timezone) then
    raise exception 'bad_timezone';
  end if;
  insert into public.organizations (name, slug, kind, status, country, timezone, billing_currency, faith_mode, created_by)
  values (btrim(p_name), lower(btrim(p_slug)), p_kind, 'active', upper(p_country), p_timezone, p_currency, p_faith_mode, v_uid)
  returning id into v_org;
  insert into public.org_branding (organization_id) values (v_org);
  insert into public.memberships (organization_id, user_id, role) values (v_org, v_uid, 'org_admin');
  insert into public.subscriptions (organization_id, plan_id, billing_interval, currency, current_period_start, current_period_end, kid_limit_override, provider)
  select v_org, id, 'month', p_currency, now(), now() + interval '14 days', 15, 'trial' from public.plans where code = 'starter';
  perform app.new_join_code(v_org, v_uid);
  perform app.audit(v_org, v_uid, 'organization.created', 'organization', v_org::text, jsonb_build_object('slug', lower(btrim(p_slug)), 'trial_days', 14));
  return v_org;
end;
$$;

-- A paid plan replaces the trial's kid cap.
create or replace function app.clear_trial_cap() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if old.provider = 'trial' and new.provider is distinct from 'trial' then
    new.kid_limit_override := null;
  end if;
  return new;
end;
$$;
create trigger subscriptions_clear_trial_cap before update on public.subscriptions
for each row execute function app.clear_trial_cap();

-- ---------------------------------------------------------------------------
-- Private or public club. Public (listed): in the directory, news visible on
-- the Clubhouse page, anyone can follow. Private: none of that; parents still
-- reach the page by its link and need the join code. New clubs start private.
-- ---------------------------------------------------------------------------
create or replace function public.get_clubhouse_posts(p_slug text)
returns table (id uuid, title text, body text, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.title, p.body, p.created_at
  from public.club_posts p
  join public.organizations o on o.id = p.organization_id
  join public.org_branding b on b.organization_id = o.id
  where o.slug = lower(btrim(p_slug)) and o.status <> 'suspended' and p.published and b.listed
  order by p.created_at desc
  limit 20
$$;

-- ---------------------------------------------------------------------------
-- Champzz at home: two hidden system clubs that hold kids with no club, one
-- with Bible content and one without. They have no staff, no classes and
-- never appear anywhere public.
-- ---------------------------------------------------------------------------
alter table public.organizations drop constraint if exists organizations_kind_check;
alter table public.organizations add constraint organizations_kind_check
  check (kind in ('church', 'club', 'school', 'other', 'home'));

insert into public.organizations (slug, name, kind, status, faith_mode, registration_mode)
values ('champzz-home', 'Champzz at home', 'home', 'active', true, 'open'),
       ('champzz-home-play', 'Champzz at home', 'home', 'active', false, 'open')
on conflict (slug) do nothing;
insert into public.org_branding (organization_id, listed)
select id, false from public.organizations where kind = 'home'
on conflict (organization_id) do nothing;

create or replace function app.home_org(p_faith boolean) returns uuid
language sql stable security definer set search_path = ''
as $$ select id from public.organizations where slug = case when p_faith then 'champzz-home' else 'champzz-home-play' end $$;

-- The Clubhouse page and directory never show the home clubs.
create or replace function public.get_clubhouse(p_slug text)
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
  where o.slug = lower(btrim(p_slug)) and o.status <> 'suspended' and o.kind <> 'home'
$$;

-- Usernames are now unique across the whole platform, so a kid can sign in
-- from the home page with just their username and picture PIN.
create or replace function app.new_username(p_org uuid) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  faith_words constant text[] := array['faithful','joyful','blessed','gracious','humble','gentle','hopeful','peaceful',
                                       'radiant','steadfast','loyal','mighty','cheerful','shining','fearless','thankful'];
  faith_things constant text[] := array['lamp','dove','ark','star','light','anchor','harp','olive',
                                        'cedar','crown','shield','rock','lamb','sparrow','river','trumpet'];
  adjectives constant text[] := array['brave','swift','happy','bright','bold','clever','kind','mighty','sunny','zippy','lucky','super','jolly','quick','calm','proud'];
  animals constant text[] := array['lion','eagle','tiger','zebra','falcon','panda','otter','fox','dolphin','rhino','cheetah','koala','hawk','giraffe','leopard','turtle'];
  v_faith boolean;
  a text[];
  n text[];
  v text;
  b bytea;
begin
  select faith_mode into v_faith from public.organizations where id = p_org;
  if coalesce(v_faith, false) then a := faith_words; n := faith_things; else a := adjectives; n := animals; end if;
  for attempt in 1 .. 80 loop
    b := extensions.gen_random_bytes(3);
    v := a[(get_byte(b, 0) % 16) + 1] || '-' || n[(get_byte(b, 1) % 16) + 1] || '-'
         || lpad(((get_byte(b, 2) % 90) + 10)::text, 2, '0');
    if not exists (select 1 from public.kids where username = v) then
      return v;
    end if;
  end loop;
  raise exception 'username_space_exhausted';
end;
$$;
revoke execute on function app.new_username(uuid) from public, anon, authenticated;

-- Which club a username belongs to, for the one sign-in page. Server only.
create function app.kid_club_for_username(p_username text) returns text
language sql stable security definer set search_path = ''
as $$
  select case when count(*) = 1 then min(o.slug) end
  from public.kids k join public.organizations o on o.id = k.organization_id
  where k.username = lower(btrim(p_username)) and k.status = 'active'
$$;

-- A parent adds a kid straight to Champzz at home.
create function app.register_home_kid(
  p_parent uuid, p_first_name text, p_last_initial text, p_pin text, p_faith boolean,
  p_policy_version text, p_scopes jsonb
) returns table (kid_id uuid, organization_id uuid, username text)
language plpgsql security definer set search_path = ''
as $$
#variable_conflict use_column
declare v_org uuid := app.home_org(p_faith); v_kid uuid; v_username text;
begin
  if p_parent is null or exists (select 1 from public.kids where user_id = p_parent) then raise exception 'not_allowed'; end if;
  if (select count(*) from public.guardians g join public.kids k on k.id = g.kid_id
      where g.user_id = p_parent and k.status <> 'archived') >= 6 then
    raise exception 'too_many_kids_for_parent';
  end if;
  v_username := app.new_username(v_org);
  insert into public.kids (organization_id, first_name, last_initial, username, status, confirmed_at, created_by)
  values (v_org, btrim(p_first_name), nullif(upper(btrim(coalesce(p_last_initial, ''))), ''), v_username, 'active', now(), p_parent)
  returning id into v_kid;
  insert into public.kid_credentials (kid_id, organization_id, pin_hash)
  values (v_kid, v_org, extensions.crypt(p_pin, extensions.gen_salt('bf', 8)));
  insert into public.guardians (organization_id, kid_id, user_id) values (v_org, v_kid, p_parent);
  insert into public.consents (organization_id, kid_id, guardian_user_id, method, policy_version, scopes, recorded_by)
  values (v_org, v_kid, p_parent, 'online', p_policy_version, coalesce(p_scopes, '{}'::jsonb), p_parent);
  insert into public.memberships (organization_id, user_id, role) values (v_org, p_parent, 'parent') on conflict do nothing;
  perform app.audit(v_org, p_parent, 'kid.registered_home', 'kid', v_kid::text, '{}'::jsonb);
  return query select v_kid, v_org, v_username;
end;
$$;

-- ---------------------------------------------------------------------------
-- A kid starts their own account; a parent approves it. Until then the kid
-- is pending and cannot sign in. The kid gets a code to give a grown-up.
-- ---------------------------------------------------------------------------
create table public.kid_approvals (
  kid_id uuid primary key references public.kids (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z2-9]{4}-[A-Z2-9]{4}$'),
  ip text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days'
);
alter table public.kid_approvals enable row level security;
revoke all on public.kid_approvals from anon, authenticated;

create function app.start_kid_signup(p_first_name text, p_pin text, p_ip text)
returns table (kid_id uuid, username text, code text)
language plpgsql security definer set search_path = ''
as $$
#variable_conflict use_column
declare v_org uuid := app.home_org(true); v_kid uuid; v_username text; v_code text; v_alpha constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; b bytea;
begin
  if (select count(*) from public.kid_approvals a where a.ip = p_ip and a.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'too_many_signups';
  end if;
  -- old unapproved sign-ups are removed after a week
  delete from public.kids k using public.kid_approvals a where a.kid_id = k.id and a.expires_at < now() and k.status = 'pending';
  v_username := app.new_username(v_org);
  insert into public.kids (organization_id, first_name, username, status)
  values (v_org, btrim(p_first_name), v_username, 'pending') returning id into v_kid;
  insert into public.kid_credentials (kid_id, organization_id, pin_hash)
  values (v_kid, v_org, extensions.crypt(p_pin, extensions.gen_salt('bf', 8)));
  loop
    b := extensions.gen_random_bytes(8);
    v_code := '';
    for i in 0 .. 7 loop
      v_code := v_code || substr(v_alpha, (get_byte(b, i) % 32) + 1, 1);
      if i = 3 then v_code := v_code || '-'; end if;
    end loop;
    exit when not exists (select 1 from public.kid_approvals where code = v_code);
  end loop;
  insert into public.kid_approvals (kid_id, organization_id, code, ip) values (v_kid, v_org, v_code, p_ip);
  return query select v_kid, v_username, v_code;
end;
$$;

-- What the parent sees before approving.
create function app.kid_approval_lookup(p_code text)
returns table (kid_id uuid, first_name text, username text)
language sql stable security definer set search_path = ''
as $$
  select k.id, k.first_name, k.username from public.kid_approvals a join public.kids k on k.id = a.kid_id
  where a.code = upper(btrim(p_code)) and a.expires_at > now() and k.status = 'pending'
$$;

-- The parent approves: the kid becomes theirs and active, in the home club
-- with or without Bible content as the parent chooses.
create function app.approve_kid_signup(p_parent uuid, p_code text, p_faith boolean, p_policy_version text, p_scopes jsonb)
returns table (kid_id uuid, organization_id uuid, username text)
language plpgsql security definer set search_path = ''
as $$
#variable_conflict use_column
declare v_kid uuid; v_org uuid := app.home_org(p_faith); v_username text;
begin
  if p_parent is null or exists (select 1 from public.kids where user_id = p_parent) then raise exception 'not_allowed'; end if;
  select a.kid_id into v_kid from public.kid_approvals a join public.kids k on k.id = a.kid_id
  where a.code = upper(btrim(p_code)) and a.expires_at > now() and k.status = 'pending' for update of k;
  if v_kid is null then raise exception 'invalid_approval_code'; end if;
  if (select count(*) from public.guardians g join public.kids k on k.id = g.kid_id
      where g.user_id = p_parent and k.status <> 'archived') >= 6 then
    raise exception 'too_many_kids_for_parent';
  end if;
  update public.kids set organization_id = v_org, status = 'active', confirmed_at = now(), created_by = p_parent where id = v_kid
  returning kids.username into v_username;
  update public.kid_credentials set organization_id = v_org where kid_credentials.kid_id = v_kid;
  delete from public.kid_approvals where kid_approvals.kid_id = v_kid;
  insert into public.guardians (organization_id, kid_id, user_id) values (v_org, v_kid, p_parent);
  insert into public.consents (organization_id, kid_id, guardian_user_id, method, policy_version, scopes, recorded_by)
  values (v_org, v_kid, p_parent, 'online', p_policy_version, coalesce(p_scopes, '{}'::jsonb), p_parent);
  insert into public.memberships (organization_id, user_id, role) values (v_org, p_parent, 'parent') on conflict do nothing;
  perform app.audit(v_org, p_parent, 'kid.signup_approved', 'kid', v_kid::text, '{}'::jsonb);
  return query select v_kid, v_org, v_username;
end;
$$;

-- ---------------------------------------------------------------------------
-- Teachers ask to join a club; an Org Admin approves or declines.
-- ---------------------------------------------------------------------------
create table public.teacher_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  note text check (note is null or char_length(note) <= 300),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz
);
create unique index teacher_requests_one_pending on public.teacher_requests (organization_id, user_id) where status = 'pending';
alter table public.teacher_requests enable row level security;
create policy teacher_requests_read on public.teacher_requests for select to authenticated
  using (user_id = auth.uid() or app.has_org_role(organization_id, array['org_admin']::public.org_role[]));
grant select on public.teacher_requests to authenticated;
revoke all on public.teacher_requests from anon;
revoke insert, update, delete on public.teacher_requests from authenticated;

create function public.request_to_teach(p_slug text, p_note text default null) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_org uuid; v_id uuid; r record;
begin
  if auth.uid() is null or exists (select 1 from public.kids where user_id = auth.uid()) then raise exception 'not_allowed'; end if;
  select id into v_org from public.organizations where slug = lower(btrim(p_slug)) and status in ('active', 'grace') and kind <> 'home' and not demo;
  if v_org is null then raise exception 'not_found'; end if;
  if exists (select 1 from public.memberships where organization_id = v_org and user_id = auth.uid()
             and role in ('teacher', 'org_admin') and status = 'active') then
    raise exception 'already_on_team';
  end if;
  insert into public.teacher_requests (organization_id, user_id, note)
  values (v_org, auth.uid(), nullif(left(btrim(coalesce(p_note, '')), 300), ''))
  on conflict (organization_id, user_id) where status = 'pending' do update set note = excluded.note
  returning id into v_id;
  for r in select user_id from public.memberships where organization_id = v_org and role = 'org_admin' and status = 'active' loop
    perform app.notify(v_org, r.user_id, 'teacher_request', 'Someone wants to teach', 'A new teacher asked to join your club. Approve or decline on the Team page.', '/o/' || lower(btrim(p_slug)) || '/team');
  end loop;
  return v_id;
end;
$$;

create function public.decide_teacher_request(p_request uuid, p_approve boolean) returns void
language plpgsql security definer set search_path = ''
as $$
declare v public.teacher_requests%rowtype;
begin
  select * into v from public.teacher_requests where id = p_request and status = 'pending' for update;
  if not found then raise exception 'not_found'; end if;
  if not app.has_org_role(v.organization_id, array['org_admin']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if not app.org_is_writable(v.organization_id) then raise exception 'organization_not_active'; end if;
  update public.teacher_requests set status = case when p_approve then 'approved' else 'declined' end,
         decided_by = auth.uid(), decided_at = now() where id = p_request;
  if p_approve then
    insert into public.memberships (organization_id, user_id, role) values (v.organization_id, v.user_id, 'teacher')
    on conflict (organization_id, user_id, role) do update set status = 'active';
  end if;
  perform app.audit(v.organization_id, auth.uid(), case when p_approve then 'teacher.approved' else 'teacher.declined' end, 'user', v.user_id::text, '{}'::jsonb);
  perform app.notify(v.organization_id, v.user_id, 'teacher_request',
    case when p_approve then 'You are on the team' else 'Teaching request declined' end,
    case when p_approve then 'Your request to teach was approved.' else 'The club leader declined your request to teach.' end,
    case when p_approve then '/o/' || app.org_slug(v.organization_id) else '/clubs' end);
end;
$$;

-- Who is asking, for the Team page (Org Admins only).
create function public.teacher_requests_for(p_org uuid)
returns table (id uuid, full_name text, email text, note text, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not app.has_org_role(p_org, array['org_admin']::public.org_role[]) then raise exception 'not_allowed'; end if;
  return query
  select r.id, p.full_name, u.email::text, r.note, r.created_at
  from public.teacher_requests r
  join auth.users u on u.id = r.user_id
  left join public.profiles p on p.id = r.user_id
  where r.organization_id = p_org and r.status = 'pending'
  order by r.created_at;
end;
$$;

-- ---------------------------------------------------------------------------
-- Server-only wrappers and grants
-- ---------------------------------------------------------------------------
create function public.svc_kid_club_for_username(p_username text) returns text
language sql security definer set search_path = '' as $$ select app.kid_club_for_username(p_username) $$;
create function public.svc_register_home_kid(p_parent uuid, p_first_name text, p_last_initial text, p_pin text, p_faith boolean, p_policy_version text, p_scopes jsonb)
returns table (kid_id uuid, organization_id uuid, username text)
language sql security definer set search_path = '' as $$ select * from app.register_home_kid(p_parent, p_first_name, p_last_initial, p_pin, p_faith, p_policy_version, p_scopes) $$;
create function public.svc_start_kid_signup(p_first_name text, p_pin text, p_ip text)
returns table (kid_id uuid, username text, code text)
language sql security definer set search_path = '' as $$ select * from app.start_kid_signup(p_first_name, p_pin, p_ip) $$;
create function public.svc_kid_approval_lookup(p_code text)
returns table (kid_id uuid, first_name text, username text)
language sql security definer set search_path = '' as $$ select * from app.kid_approval_lookup(p_code) $$;
create function public.svc_approve_kid_signup(p_parent uuid, p_code text, p_faith boolean, p_policy_version text, p_scopes jsonb)
returns table (kid_id uuid, organization_id uuid, username text)
language sql security definer set search_path = '' as $$ select * from app.approve_kid_signup(p_parent, p_code, p_faith, p_policy_version, p_scopes) $$;

revoke execute on function
  public.create_organization(text, text, text, text, text, text, boolean),
  public.get_clubhouse(text), public.get_clubhouse_posts(text),
  app.clear_trial_cap(), app.home_org(boolean), app.kid_club_for_username(text),
  app.register_home_kid(uuid, text, text, text, boolean, text, jsonb),
  app.start_kid_signup(text, text, text), app.kid_approval_lookup(text),
  app.approve_kid_signup(uuid, text, boolean, text, jsonb),
  public.request_to_teach(text, text), public.decide_teacher_request(uuid, boolean), public.teacher_requests_for(uuid),
  public.svc_kid_club_for_username(text),
  public.svc_register_home_kid(uuid, text, text, text, boolean, text, jsonb),
  public.svc_start_kid_signup(text, text, text), public.svc_kid_approval_lookup(text),
  public.svc_approve_kid_signup(uuid, text, boolean, text, jsonb)
from public, anon, authenticated;

grant execute on function public.get_clubhouse(text), public.get_clubhouse_posts(text) to anon, authenticated;
grant execute on function public.create_organization(text, text, text, text, text, text, boolean),
  public.request_to_teach(text, text), public.decide_teacher_request(uuid, boolean), public.teacher_requests_for(uuid)
to authenticated;
grant execute on function
  public.svc_kid_club_for_username(text),
  public.svc_register_home_kid(uuid, text, text, text, boolean, text, jsonb),
  public.svc_start_kid_signup(text, text, text), public.svc_kid_approval_lookup(text),
  public.svc_approve_kid_signup(uuid, text, boolean, text, jsonb)
to service_role;
