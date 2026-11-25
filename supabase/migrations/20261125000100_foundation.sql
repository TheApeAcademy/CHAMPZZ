-- Champzz foundation schema.
--
-- Tenancy rules (docs/ARCHITECTURE.md section 3):
--   * every tenant-owned table carries organization_id
--   * row level security on every table, enforced here, not in the app
--   * clients never write status, role, plan, limit or credential columns;
--     those change only through the functions below
--   * EXECUTE on new functions is revoked from PUBLIC by default and granted
--     on purpose, one function at a time

create extension if not exists pgcrypto with schema extensions;

create schema if not exists app;

-- Functions are not callable by anyone unless granted below.
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema app revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon, authenticated;
alter default privileges in schema app revoke execute on functions from anon, authenticated;

-- RLS policies call app.* helpers with the caller's privileges, so signed-in
-- users need USAGE on the schema. PostgREST does not expose this schema, so
-- these helpers are reachable only from policies and other SQL.
grant usage on schema app to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- enums
-- ---------------------------------------------------------------------------

create type public.org_status as enum ('pending', 'active', 'grace', 'read_only', 'suspended');
create type public.org_role as enum ('org_admin', 'teacher', 'parent');
create type public.kid_status as enum ('pending', 'active', 'archived');

-- ---------------------------------------------------------------------------
-- platform
-- ---------------------------------------------------------------------------

create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text check (phone is null or phone ~ '^\+?[0-9 ]{7,20}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.currency_settings (
  currency text primary key check (currency in ('NGN', 'GBP', 'USD', 'EUR', 'CAD')),
  tax_enabled boolean not null default false,
  tax_rate numeric(5, 4) not null default 0 check (tax_rate >= 0 and tax_rate < 1),
  tax_inclusive boolean not null default false
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9_]{2,32}$'),
  name text not null,
  -- null means the limit is set per organization (custom / Network deals)
  kid_limit integer check (kid_limit is null or kid_limit > 0),
  is_custom boolean not null default false,
  active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.plan_prices (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete cascade,
  currency text not null references public.currency_settings (currency),
  billing_interval text not null check (billing_interval in ('month', 'year')),
  amount_minor bigint not null check (amount_minor >= 0),
  active boolean not null default true,
  unique (plan_id, currency, billing_interval)
);

create table public.plan_features (
  plan_id uuid not null references public.plans (id) on delete cascade,
  feature_key text not null check (feature_key ~ '^[a-z0-9_]{2,48}$'),
  enabled boolean not null default true,
  limit_value integer,
  primary key (plan_id, feature_key)
);

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$'),
  name text not null check (char_length(name) between 2 and 80),
  kind text not null check (kind in ('church', 'club', 'school', 'other')),
  status public.org_status not null default 'pending',
  -- where a suspended org returns to when the suspension is lifted
  suspended_from public.org_status,
  country text not null default 'NG' check (country ~ '^[A-Z]{2}$'),
  timezone text not null default 'Africa/Lagos',
  billing_currency text not null default 'NGN' references public.currency_settings (currency),
  faith_mode boolean not null default true,
  registration_mode text not null default 'open' check (registration_mode in ('open', 'approval')),
  joining_paused boolean not null default false,
  joining_paused_reason text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.org_branding (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  logo_path text,
  primary_color text check (primary_color is null or primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  tagline text check (tagline is null or char_length(tagline) <= 140),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.org_role not null,
  status text not null default 'active' check (status in ('active', 'removed')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, role)
);
create index memberships_user_idx on public.memberships (user_id);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  billing_interval text not null check (billing_interval in ('month', 'year')),
  currency text not null references public.currency_settings (currency),
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  grace_until timestamptz,
  kid_limit_override integer check (kid_limit_override is null or kid_limit_override > 0),
  price_lock_amount_minor bigint check (price_lock_amount_minor is null or price_lock_amount_minor >= 0),
  price_lock_until timestamptz,
  provider text check (provider in ('flutterwave', 'stripe', 'manual')),
  provider_customer_ref text,
  provider_subscription_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  billing_interval text not null check (billing_interval in ('month', 'year')),
  currency text not null references public.currency_settings (currency),
  amount_minor bigint not null check (amount_minor > 0),
  provider text not null check (provider in ('flutterwave', 'stripe')),
  tx_ref text not null unique,
  status text not null default 'open' check (status in ('open', 'paid', 'failed', 'expired')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index checkout_sessions_org_idx on public.checkout_sessions (organization_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  provider text not null check (provider in ('flutterwave', 'stripe', 'manual')),
  method text not null check (method in ('card', 'bank_transfer', 'cash', 'mobile_money', 'other')),
  provider_ref text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null references public.currency_settings (currency),
  status text not null default 'succeeded' check (status in ('succeeded', 'failed', 'refunded')),
  period_end_granted timestamptz not null,
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  unique (provider, provider_ref)
);
create index payments_org_idx on public.payments (organization_id);

create table public.billing_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text,
  unique (provider, provider_event_id)
);

create table public.join_codes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z2-9]{4}-[A-Z2-9]{4}$'),
  active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create unique index join_codes_one_active on public.join_codes (organization_id) where active;

create table public.audit_log (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations (id) on delete set null,
  actor_id uuid,
  action text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);
create index audit_log_org_idx on public.audit_log (organization_id, at desc);

-- ---------------------------------------------------------------------------
-- classes and kids
-- ---------------------------------------------------------------------------

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  age_band text not null default 'champ' check (age_band in ('little', 'champ')),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.class_teachers (
  organization_id uuid not null,
  class_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, user_id),
  foreign key (organization_id, class_id) references public.classes (organization_id, id) on delete cascade
);
create index class_teachers_user_idx on public.class_teachers (user_id);

create table public.kids (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- the kid's own auth user, attached right after creation
  user_id uuid unique references auth.users (id) on delete set null,
  first_name text not null check (char_length(first_name) between 1 and 40),
  last_initial text check (last_initial is null or last_initial ~ '^[A-Za-z]$'),
  username text not null check (username ~ '^[a-z]+-[a-z]+-[0-9]{2}$'),
  status public.kid_status not null default 'active',
  class_id uuid,
  -- null = "new": hidden from leaderboards, no messaging, until a teacher
  -- confirms them (normally at their first check-in)
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, username),
  unique (organization_id, id),
  foreign key (organization_id, class_id) references public.classes (organization_id, id) on delete set null (class_id)
);
create index kids_org_idx on public.kids (organization_id, status);

-- Never readable or writable by any client role.
create table public.kid_credentials (
  kid_id uuid primary key references public.kids (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  pin_hash text not null,
  failed_attempts integer not null default 0,
  lockouts integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create table public.guardians (
  organization_id uuid not null,
  kid_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  relationship text not null default 'parent' check (relationship in ('parent', 'guardian', 'other')),
  created_at timestamptz not null default now(),
  primary key (kid_id, user_id),
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);
create index guardians_user_idx on public.guardians (user_id);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  kid_id uuid not null,
  guardian_user_id uuid references auth.users (id) on delete set null,
  method text not null check (method in ('online', 'paper')),
  policy_version text not null check (char_length(policy_version) between 1 and 40),
  scopes jsonb not null default '{}'::jsonb,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  recorded_by uuid references auth.users (id) on delete set null,
  foreign key (organization_id, kid_id) references public.kids (organization_id, id) on delete cascade
);

-- Kid sign-in attempts, for throttling. Service role only.
create table public.kid_login_attempts (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations (id) on delete cascade,
  username text,
  ip text,
  success boolean not null,
  at timestamptz not null default now()
);
create index kid_login_attempts_ip_idx on public.kid_login_attempts (ip, at desc);
create index kid_login_attempts_org_idx on public.kid_login_attempts (organization_id, at desc);

-- Registrations per join code, for spike detection.
create table public.registration_events (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  join_code_id uuid references public.join_codes (id) on delete set null,
  kid_id uuid,
  by_user uuid,
  at timestamptz not null default now()
);
create index registration_events_org_idx on public.registration_events (organization_id, at desc);

-- ---------------------------------------------------------------------------
-- helpers used by policies
-- ---------------------------------------------------------------------------

create function app.is_platform_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.platform_admins where user_id = auth.uid()) $$;

create function app.has_org_role(p_org uuid, p_roles public.org_role[]) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = p_org and m.user_id = auth.uid()
      and m.status = 'active' and m.role = any (p_roles)
  )
$$;

create function app.my_kid_org() returns uuid
language sql stable security definer set search_path = ''
as $$ select k.organization_id from public.kids k where k.user_id = auth.uid() and k.status = 'active' $$;

create function app.is_org_member(p_org uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = p_org and m.user_id = auth.uid() and m.status = 'active'
  ) or exists (
    select 1 from public.kids k
    where k.organization_id = p_org and k.user_id = auth.uid() and k.status = 'active'
  )
$$;

create function app.org_status(p_org uuid) returns public.org_status
language sql stable security definer set search_path = ''
as $$ select o.status from public.organizations o where o.id = p_org $$;

-- Kid-facing and teaching data: writable only while the org is paid up.
create function app.org_is_writable(p_org uuid) returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(app.org_status(p_org) in ('active', 'grace'), false) $$;

-- Setup data (settings, branding, classes): the onboarding wizard works while
-- pending too.
create function app.org_can_setup(p_org uuid) returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(app.org_status(p_org) in ('pending', 'active', 'grace'), false) $$;

create function app.is_guardian_of(p_kid uuid) returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.guardians g where g.kid_id = p_kid and g.user_id = auth.uid()) $$;

create function app.org_kid_limit(p_org uuid) returns integer
language sql stable security definer set search_path = ''
as $$
  select coalesce(s.kid_limit_override, p.kid_limit, 0)
  from public.subscriptions s join public.plans p on p.id = s.plan_id
  where s.organization_id = p_org
$$;

create function app.org_has_feature(p_org uuid, p_key text) returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((
    select f.enabled from public.subscriptions s
    join public.plan_features f on f.plan_id = s.plan_id and f.feature_key = p_key
    where s.organization_id = p_org
  ), false)
$$;

grant execute on function
  app.is_platform_admin(),
  app.has_org_role(uuid, public.org_role[]),
  app.my_kid_org(),
  app.is_org_member(uuid),
  app.org_status(uuid),
  app.org_is_writable(uuid),
  app.org_can_setup(uuid),
  app.is_guardian_of(uuid),
  app.org_kid_limit(uuid),
  app.org_has_feature(uuid, text)
to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- grants and RLS
-- ---------------------------------------------------------------------------

-- Start from nothing for the anonymous role, then hand back the public
-- catalogue. Signed-in users keep table privileges, but RLS decides rows,
-- and column grants below decide which columns they may change.
revoke all on all tables in schema public from anon;
grant select on public.plans, public.plan_prices, public.plan_features, public.currency_settings to anon;

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;

-- Tables no client may ever touch directly.
revoke all on public.kid_credentials, public.kid_login_attempts, public.registration_events,
  public.billing_events, public.checkout_sessions
from authenticated;
grant select on public.checkout_sessions, public.billing_events to authenticated; -- RLS limits rows

-- catalogue
create policy plans_read on public.plans for select to anon, authenticated using (active or (select app.is_platform_admin()));
create policy plans_admin on public.plans for all to authenticated
  using ((select app.is_platform_admin())) with check ((select app.is_platform_admin()));
create policy plan_prices_read on public.plan_prices for select to anon, authenticated using (active or (select app.is_platform_admin()));
create policy plan_prices_admin on public.plan_prices for all to authenticated
  using ((select app.is_platform_admin())) with check ((select app.is_platform_admin()));
create policy plan_features_read on public.plan_features for select to anon, authenticated using (true);
create policy plan_features_admin on public.plan_features for all to authenticated
  using ((select app.is_platform_admin())) with check ((select app.is_platform_admin()));
create policy currency_settings_read on public.currency_settings for select to anon, authenticated using (true);
create policy currency_settings_admin on public.currency_settings for all to authenticated
  using ((select app.is_platform_admin())) with check ((select app.is_platform_admin()));

-- platform admins: you can see whether you are one, nothing more
create policy platform_admins_self on public.platform_admins for select to authenticated using (user_id = (select auth.uid()));

-- profiles
revoke insert, update, delete on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;
create policy profiles_self on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_org_staff on public.profiles for select to authenticated using (
  (select app.is_platform_admin())
  or exists (
    select 1 from public.memberships them
    where them.user_id = profiles.id and them.status = 'active'
      and app.has_org_role(them.organization_id, array['org_admin', 'teacher']::public.org_role[])
  )
);
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- organizations
revoke insert, update, delete on public.organizations from authenticated;
grant update (name, timezone, faith_mode, registration_mode, joining_paused, joining_paused_reason) on public.organizations to authenticated;
create policy organizations_read on public.organizations for select to authenticated using (
  (select app.is_platform_admin()) or app.is_org_member(id)
  or exists (select 1 from public.guardians g where g.organization_id = organizations.id and g.user_id = (select auth.uid()))
);
create policy organizations_admin_update on public.organizations for update to authenticated
  using (app.has_org_role(id, array['org_admin']::public.org_role[]) and app.org_can_setup(id))
  with check (app.has_org_role(id, array['org_admin']::public.org_role[]) and app.org_can_setup(id));

-- branding
create policy org_branding_read on public.org_branding for select to authenticated using (
  (select app.is_platform_admin()) or app.is_org_member(organization_id)
  or exists (select 1 from public.guardians g where g.organization_id = org_branding.organization_id and g.user_id = (select auth.uid()))
);
create policy org_branding_insert on public.org_branding for insert to authenticated
  with check (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_can_setup(organization_id));
create policy org_branding_update on public.org_branding for update to authenticated
  using (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_can_setup(organization_id))
  with check (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_can_setup(organization_id));

-- memberships: read your own, Org Admin reads the org's; writes go through functions
revoke insert, update, delete on public.memberships from authenticated;
create policy memberships_read on public.memberships for select to authenticated using (
  user_id = (select auth.uid())
  or (select app.is_platform_admin())
  or app.has_org_role(organization_id, array['org_admin']::public.org_role[])
);

-- billing
revoke insert, update, delete on public.subscriptions, public.payments from authenticated;
create policy subscriptions_read on public.subscriptions for select to authenticated using (
  (select app.is_platform_admin()) or app.has_org_role(organization_id, array['org_admin']::public.org_role[])
);
create policy payments_read on public.payments for select to authenticated using (
  (select app.is_platform_admin()) or app.has_org_role(organization_id, array['org_admin']::public.org_role[])
);
create policy checkout_sessions_read on public.checkout_sessions for select to authenticated using (
  (select app.is_platform_admin()) or app.has_org_role(organization_id, array['org_admin']::public.org_role[])
);
create policy billing_events_read on public.billing_events for select to authenticated using ((select app.is_platform_admin()));

-- join codes
revoke insert, update, delete on public.join_codes from authenticated;
create policy join_codes_read on public.join_codes for select to authenticated using (
  (select app.is_platform_admin()) or app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[])
);

-- audit log: read-only, and only for those who should see it
revoke insert, update, delete on public.audit_log from authenticated;
create policy audit_log_read on public.audit_log for select to authenticated using (
  (select app.is_platform_admin())
  or (organization_id is not null and app.has_org_role(organization_id, array['org_admin']::public.org_role[]))
);

-- classes
create policy classes_read on public.classes for select to authenticated using (
  (select app.is_platform_admin()) or app.is_org_member(organization_id)
);
create policy classes_insert on public.classes for insert to authenticated
  with check (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_can_setup(organization_id));
create policy classes_update on public.classes for update to authenticated
  using (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_can_setup(organization_id))
  with check (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_can_setup(organization_id));

create policy class_teachers_read on public.class_teachers for select to authenticated using (
  (select app.is_platform_admin()) or app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[])
);
create policy class_teachers_insert on public.class_teachers for insert to authenticated
  with check (
    app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_can_setup(organization_id)
    and exists (select 1 from public.memberships m where m.organization_id = class_teachers.organization_id
                and m.user_id = class_teachers.user_id and m.role = 'teacher' and m.status = 'active')
  );
create policy class_teachers_delete on public.class_teachers for delete to authenticated
  using (app.has_org_role(organization_id, array['org_admin']::public.org_role[]) and app.org_can_setup(organization_id));

-- kids: staff of the org, the kid's guardians, the kid. Writes go through functions.
revoke insert, update, delete on public.kids from authenticated;
create policy kids_read on public.kids for select to authenticated using (
  (select app.is_platform_admin())
  or app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[])
  or app.is_guardian_of(id)
  or user_id = (select auth.uid())
);

revoke insert, update, delete on public.guardians, public.consents from authenticated;
create policy guardians_read on public.guardians for select to authenticated using (
  user_id = (select auth.uid())
  or (select app.is_platform_admin())
  or app.has_org_role(organization_id, array['org_admin', 'teacher']::public.org_role[])
);
create policy consents_read on public.consents for select to authenticated using (
  (select app.is_platform_admin())
  or app.has_org_role(organization_id, array['org_admin']::public.org_role[])
  or app.is_guardian_of(kid_id)
);

-- ---------------------------------------------------------------------------
-- profile rows for adults
-- ---------------------------------------------------------------------------

create function app.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  -- Kid auth users are created by the server with app_metadata.kind = 'kid'.
  -- Only the service role can set app_metadata, so a person signing up
  -- cannot dodge or fake this.
  if coalesce(new.raw_app_meta_data ->> 'kind', '') <> 'kid' then
    insert into public.profiles (id, full_name)
    values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120))
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function app.handle_new_user();

-- ---------------------------------------------------------------------------
-- small utilities
-- ---------------------------------------------------------------------------

create function app.audit(p_org uuid, p_actor uuid, p_action text, p_target_type text, p_target_id text, p_details jsonb default '{}'::jsonb)
returns void language sql security definer set search_path = ''
as $$
  insert into public.audit_log (organization_id, actor_id, action, target_type, target_id, details)
  values (p_org, p_actor, p_action, p_target_type, p_target_id, coalesce(p_details, '{}'::jsonb))
$$;

-- Unambiguous alphabet (no 0/O, 1/I/L), drawn from a cryptographic source.
create function app.random_code(p_len integer) returns text
language plpgsql volatile set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  bytes bytea := extensions.gen_random_bytes(p_len);
  out text := '';
begin
  for i in 0 .. p_len - 1 loop
    out := out || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
  end loop;
  return out;
end;
$$;

create function app.new_join_code(p_org uuid, p_actor uuid) returns text
language plpgsql security definer set search_path = ''
as $$
declare v_code text;
begin
  update public.join_codes set active = false, revoked_at = now()
  where organization_id = p_org and active;
  loop
    v_code := app.random_code(4) || '-' || app.random_code(4);
    begin
      insert into public.join_codes (organization_id, code, created_by) values (p_org, v_code, p_actor);
      exit;
    exception when unique_violation then
      -- astronomically unlikely; try again
    end;
  end loop;
  perform app.audit(p_org, p_actor, 'join_code.created', 'organization', p_org::text, '{}'::jsonb);
  return v_code;
end;
$$;

create function app.new_username(p_org uuid) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  adjectives constant text[] := array['brave','swift','happy','bright','bold','clever','kind','mighty','sunny','zippy','lucky','super','jolly','quick','calm','proud'];
  animals constant text[] := array['lion','eagle','tiger','zebra','falcon','panda','otter','fox','dolphin','rhino','cheetah','koala','hawk','giraffe','leopard','turtle'];
  v text;
  b bytea;
begin
  for attempt in 1 .. 50 loop
    b := extensions.gen_random_bytes(3);
    v := adjectives[(get_byte(b, 0) % 16) + 1] || '-' || animals[(get_byte(b, 1) % 16) + 1] || '-'
         || lpad(((get_byte(b, 2) % 90) + 10)::text, 2, '0');
    if not exists (select 1 from public.kids where organization_id = p_org and username = v) then
      return v;
    end if;
  end loop;
  raise exception 'username_space_exhausted';
end;
$$;

-- ---------------------------------------------------------------------------
-- organization lifecycle
-- ---------------------------------------------------------------------------

-- Signed-in adult creates an org. It starts pending, the creator is its Org Admin.
create function public.create_organization(
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
  if (select count(*) from public.memberships where user_id = v_uid and role = 'org_admin') >= 5 then
    raise exception 'too_many_organizations';
  end if;
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = p_timezone) then
    raise exception 'bad_timezone';
  end if;
  insert into public.organizations (name, slug, kind, country, timezone, billing_currency, faith_mode, created_by)
  values (btrim(p_name), lower(btrim(p_slug)), p_kind, upper(p_country), p_timezone, p_currency, p_faith_mode, v_uid)
  returning id into v_org;
  insert into public.org_branding (organization_id) values (v_org);
  insert into public.memberships (organization_id, user_id, role) values (v_org, v_uid, 'org_admin');
  perform app.audit(v_org, v_uid, 'organization.created', 'organization', v_org::text, jsonb_build_object('slug', lower(btrim(p_slug))));
  return v_org;
end;
$$;
grant execute on function public.create_organization(text, text, text, text, text, text, boolean) to authenticated;

-- The single place a payment turns into access. Called by the payment webhook
-- (service role) and by Mark as paid, so both give the same result.
create function app.apply_payment(
  p_org uuid, p_plan uuid, p_interval text, p_currency text, p_amount_minor bigint,
  p_period_end timestamptz, p_provider text, p_method text, p_ref text,
  p_approved_by uuid default null, p_note text default null
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_payment uuid;
  v_status public.org_status;
begin
  select id into v_payment from public.payments where provider = p_provider and provider_ref = p_ref;
  if v_payment is not null then
    return v_payment; -- already applied: idempotent
  end if;
  if p_period_end <= now() then
    raise exception 'period_end_in_past';
  end if;

  select status into v_status from public.organizations where id = p_org for update;
  if v_status is null then
    raise exception 'organization_not_found';
  end if;

  insert into public.payments (organization_id, plan_id, provider, method, provider_ref, amount_minor, currency,
                               period_end_granted, approved_by, approved_at, note)
  values (p_org, p_plan, p_provider, p_method, p_ref, p_amount_minor, p_currency, p_period_end,
          p_approved_by, case when p_approved_by is not null then now() end, p_note)
  returning id into v_payment;

  insert into public.subscriptions (organization_id, plan_id, billing_interval, currency,
                                    current_period_start, current_period_end, grace_until, provider)
  values (p_org, p_plan, p_interval, p_currency, now(), p_period_end, null, p_provider)
  on conflict (organization_id) do update set
    plan_id = excluded.plan_id,
    billing_interval = excluded.billing_interval,
    currency = excluded.currency,
    current_period_start = now(),
    current_period_end = greatest(public.subscriptions.current_period_end, excluded.current_period_end),
    grace_until = null,
    provider = excluded.provider,
    updated_at = now();

  if v_status = 'suspended' then
    update public.organizations set suspended_from = 'active', updated_at = now() where id = p_org;
  else
    update public.organizations set status = 'active', updated_at = now() where id = p_org;
  end if;

  if not exists (select 1 from public.join_codes where organization_id = p_org and active) then
    perform app.new_join_code(p_org, p_approved_by);
  end if;

  perform app.audit(p_org, p_approved_by, 'payment.applied', 'payment', v_payment::text,
    jsonb_build_object('provider', p_provider, 'method', p_method, 'amount_minor', p_amount_minor,
                       'currency', p_currency, 'period_end', p_period_end, 'previous_status', v_status));
  return v_payment;
end;
$$;
grant execute on function app.apply_payment(uuid, uuid, text, text, bigint, timestamptz, text, text, text, uuid, text) to service_role;

-- Super Admin: offline payment (bank transfer or cash).
create function public.mark_as_paid(
  p_org uuid, p_plan uuid, p_interval text, p_period_end timestamptz,
  p_method text, p_amount_minor bigint, p_currency text, p_note text default null
) returns uuid
language plpgsql security definer set search_path = ''
as $$
begin
  if not app.is_platform_admin() then
    raise exception 'not_allowed';
  end if;
  if p_method not in ('bank_transfer', 'cash', 'other') then
    raise exception 'bad_method';
  end if;
  return app.apply_payment(p_org, p_plan, p_interval, p_currency, p_amount_minor, p_period_end,
                           'manual', p_method, 'manual-' || gen_random_uuid()::text, auth.uid(), p_note);
end;
$$;
grant execute on function public.mark_as_paid(uuid, uuid, text, timestamptz, text, bigint, text, text) to authenticated;

create function public.suspend_organization(p_org uuid, p_reason text) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_status public.org_status;
begin
  if not app.is_platform_admin() then raise exception 'not_allowed'; end if;
  select status into v_status from public.organizations where id = p_org for update;
  if v_status is null then raise exception 'organization_not_found'; end if;
  if v_status = 'suspended' then return; end if;
  update public.organizations set status = 'suspended', suspended_from = v_status, updated_at = now() where id = p_org;
  perform app.audit(p_org, auth.uid(), 'organization.suspended', 'organization', p_org::text, jsonb_build_object('reason', p_reason, 'from', v_status));
end;
$$;
grant execute on function public.suspend_organization(uuid, text) to authenticated;

create function public.unsuspend_organization(p_org uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_back public.org_status;
begin
  if not app.is_platform_admin() then raise exception 'not_allowed'; end if;
  select coalesce(suspended_from, 'pending') into v_back from public.organizations where id = p_org and status = 'suspended' for update;
  if v_back is null then return; end if;
  update public.organizations set status = v_back, suspended_from = null, updated_at = now() where id = p_org;
  perform app.audit(p_org, auth.uid(), 'organization.unsuspended', 'organization', p_org::text, jsonb_build_object('to', v_back));
end;
$$;
grant execute on function public.unsuspend_organization(uuid) to authenticated;

-- Daily: active -> grace (7 days) -> read_only. Data is never deleted here.
create function app.lifecycle_tick(p_now timestamptz default now()) returns integer
language plpgsql security definer set search_path = ''
as $$
declare r record; n integer := 0;
begin
  for r in
    select o.id, s.current_period_end from public.organizations o
    join public.subscriptions s on s.organization_id = o.id
    where o.status = 'active' and s.current_period_end < p_now
    for update of o
  loop
    update public.organizations set status = 'grace', updated_at = p_now where id = r.id;
    update public.subscriptions set grace_until = r.current_period_end + interval '7 days', updated_at = p_now where organization_id = r.id;
    perform app.audit(r.id, null, 'organization.grace_started', 'organization', r.id::text, '{}'::jsonb);
    n := n + 1;
  end loop;
  for r in
    select o.id from public.organizations o
    join public.subscriptions s on s.organization_id = o.id
    where o.status = 'grace' and s.grace_until < p_now
    for update of o
  loop
    update public.organizations set status = 'read_only', updated_at = p_now where id = r.id;
    perform app.audit(r.id, null, 'organization.read_only', 'organization', r.id::text, '{}'::jsonb);
    n := n + 1;
  end loop;
  return n;
end;
$$;
grant execute on function app.lifecycle_tick(timestamptz) to service_role;

-- ---------------------------------------------------------------------------
-- join codes and the Clubhouse
-- ---------------------------------------------------------------------------

create function public.regenerate_join_code(p_org uuid) returns text
language plpgsql security definer set search_path = ''
as $$
begin
  if not app.has_org_role(p_org, array['org_admin']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if not app.org_is_writable(p_org) then raise exception 'organization_not_active'; end if;
  return app.new_join_code(p_org, auth.uid());
end;
$$;
grant execute on function public.regenerate_join_code(uuid) to authenticated;

-- What anyone may see of an org's Clubhouse. Never kids' data.
create function public.get_clubhouse(p_slug text)
returns table (organization_id uuid, slug text, name text, kind text, faith_mode boolean,
               logo_path text, primary_color text, tagline text, joinable boolean)
language sql stable security definer set search_path = ''
as $$
  select o.id, o.slug, o.name, o.kind, o.faith_mode, b.logo_path, b.primary_color, b.tagline,
         (o.status in ('active', 'grace') and not o.joining_paused)
  from public.organizations o
  left join public.org_branding b on b.organization_id = o.id
  where o.slug = lower(btrim(p_slug)) and o.status <> 'suspended'
$$;
grant execute on function public.get_clubhouse(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- kids: registration, approval, PIN
-- ---------------------------------------------------------------------------

-- Called by the server (service role) after it has verified the parent's
-- session and that their email or phone is confirmed. Creates the kid row,
-- guardian link, consent and PIN in one transaction, holding a lock on the
-- org row so two registrations can never push past the kid limit together.
create function app.register_kid(
  p_parent uuid, p_join_code text, p_first_name text, p_last_initial text,
  p_class_id uuid, p_pin text, p_policy_version text, p_scopes jsonb
) returns table (kid_id uuid, organization_id uuid, username text, status public.kid_status)
language plpgsql security definer set search_path = ''
as $$
declare
  v_code public.join_codes%rowtype;
  v_org public.organizations%rowtype;
  v_limit integer;
  v_active integer;
  v_kid uuid;
  v_username text;
  v_status public.kid_status;
  v_recent integer;
begin
  select * into v_code from public.join_codes where code = upper(btrim(p_join_code)) and active;
  if not found then raise exception 'invalid_join_code'; end if;

  select * into v_org from public.organizations where id = v_code.organization_id for update;
  if v_org.status not in ('active', 'grace') then raise exception 'organization_not_active'; end if;
  if v_org.joining_paused then raise exception 'joining_paused'; end if;

  if p_class_id is not null and not exists (
    select 1 from public.classes c where c.id = p_class_id and c.organization_id = v_org.id and not c.archived
  ) then
    raise exception 'invalid_class';
  end if;

  if (select count(*) from public.guardians g join public.kids k on k.id = g.kid_id
      where g.user_id = p_parent and g.organization_id = v_org.id and k.status <> 'archived') >= 6 then
    raise exception 'too_many_kids_for_parent';
  end if;

  -- spike guard: 20 sign-ups in an hour pauses joining and tells the Org Admin
  select count(*) into v_recent from public.registration_events e
  where e.organization_id = v_org.id and e.at > now() - interval '1 hour';
  if v_recent >= 20 then
    update public.organizations set joining_paused = true, joining_paused_reason = 'spike', updated_at = now() where id = v_org.id;
    perform app.audit(v_org.id, null, 'joining.auto_paused', 'organization', v_org.id::text, jsonb_build_object('last_hour', v_recent));
    raise exception 'joining_paused';
  end if;

  v_status := case when v_org.registration_mode = 'approval' then 'pending' else 'active' end;

  if v_status = 'active' then
    v_limit := app.org_kid_limit(v_org.id);
    select count(*) into v_active from public.kids k where k.organization_id = v_org.id and k.status = 'active';
    if v_active >= v_limit then raise exception 'kid_limit_reached'; end if;
  end if;

  v_username := app.new_username(v_org.id);

  insert into public.kids (organization_id, first_name, last_initial, username, status, class_id, created_by)
  values (v_org.id, btrim(p_first_name), nullif(upper(btrim(coalesce(p_last_initial, ''))), ''), v_username, v_status, p_class_id, p_parent)
  returning id into v_kid;

  insert into public.kid_credentials (kid_id, organization_id, pin_hash)
  values (v_kid, v_org.id, extensions.crypt(p_pin, extensions.gen_salt('bf', 8)));

  insert into public.guardians (organization_id, kid_id, user_id) values (v_org.id, v_kid, p_parent);
  insert into public.consents (organization_id, kid_id, guardian_user_id, method, policy_version, scopes, recorded_by)
  values (v_org.id, v_kid, p_parent, 'online', p_policy_version, coalesce(p_scopes, '{}'::jsonb), p_parent);
  insert into public.registration_events (organization_id, join_code_id, kid_id, by_user) values (v_org.id, v_code.id, v_kid, p_parent);

  perform app.audit(v_org.id, p_parent, 'kid.registered', 'kid', v_kid::text, jsonb_build_object('status', v_status));
  return query select v_kid, v_org.id, v_username, v_status;
end;
$$;
grant execute on function app.register_kid(uuid, text, text, text, uuid, text, text, jsonb) to service_role;

create function app.attach_kid_user(p_kid uuid, p_user uuid) returns void
language sql security definer set search_path = ''
as $$ update public.kids set user_id = p_user where id = p_kid and user_id is null $$;
grant execute on function app.attach_kid_user(uuid, uuid) to service_role;

-- Undo a half-made registration when the auth user could not be created.
create function app.discard_kid(p_kid uuid) returns void
language sql security definer set search_path = ''
as $$ delete from public.kids where id = p_kid and user_id is null $$;
grant execute on function app.discard_kid(uuid) to service_role;

-- Approval mode: Org Admin (or teacher) approves a pending kid, under the same lock.
create function public.approve_kid(p_kid uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_org uuid; v_limit integer; v_active integer;
begin
  select organization_id into v_org from public.kids where id = p_kid and status = 'pending';
  if v_org is null then raise exception 'kid_not_pending'; end if;
  if not app.has_org_role(v_org, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
  perform 1 from public.organizations where id = v_org for update;
  if not app.org_is_writable(v_org) then raise exception 'organization_not_active'; end if;
  v_limit := app.org_kid_limit(v_org);
  select count(*) into v_active from public.kids where organization_id = v_org and status = 'active';
  if v_active >= v_limit then raise exception 'kid_limit_reached'; end if;
  update public.kids set status = 'active' where id = p_kid;
  perform app.audit(v_org, auth.uid(), 'kid.approved', 'kid', p_kid::text, '{}'::jsonb);
end;
$$;
grant execute on function public.approve_kid(uuid) to authenticated;

-- A teacher confirms a "new" kid, usually at first check-in.
create function public.confirm_kid(p_kid uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_org uuid;
begin
  select organization_id into v_org from public.kids where id = p_kid and status = 'active';
  if v_org is null or not app.has_org_role(v_org, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if not app.org_is_writable(v_org) then raise exception 'organization_not_active'; end if;
  update public.kids set confirmed_at = coalesce(confirmed_at, now()), confirmed_by = coalesce(confirmed_by, auth.uid()) where id = p_kid;
  perform app.audit(v_org, auth.uid(), 'kid.confirmed', 'kid', p_kid::text, '{}'::jsonb);
end;
$$;
grant execute on function public.confirm_kid(uuid) to authenticated;

create function public.archive_kid(p_kid uuid, p_reason text) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_org uuid;
begin
  select organization_id into v_org from public.kids where id = p_kid;
  if v_org is null or not app.has_org_role(v_org, array['org_admin']::public.org_role[]) then raise exception 'not_allowed'; end if;
  if not app.org_is_writable(v_org) then raise exception 'organization_not_active'; end if;
  update public.kids set status = 'archived' where id = p_kid;
  perform app.audit(v_org, auth.uid(), 'kid.archived', 'kid', p_kid::text, jsonb_build_object('reason', p_reason));
end;
$$;
grant execute on function public.archive_kid(uuid, text) to authenticated;

-- Staff reset a kid's picture PIN; also clears any lockout.
create function public.reset_kid_pin(p_kid uuid, p_pin text) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_org uuid;
begin
  if p_pin !~ '^(1[01]|[0-9])(-(1[01]|[0-9])){3}$' then raise exception 'bad_pin'; end if;
  select organization_id into v_org from public.kids where id = p_kid;
  if v_org is null or not app.has_org_role(v_org, array['org_admin', 'teacher']::public.org_role[]) then raise exception 'not_allowed'; end if;
  update public.kid_credentials set pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf', 8)),
    failed_attempts = 0, lockouts = 0, locked_until = null, updated_at = now()
  where kid_id = p_kid;
  perform app.audit(v_org, auth.uid(), 'kid.pin_reset', 'kid', p_kid::text, '{}'::jsonb);
end;
$$;
grant execute on function public.reset_kid_pin(uuid, text) to authenticated;

-- Kid sign-in check (service role only). Throttles by IP and locks the kid
-- after 5 wrong PINs: 15 minutes, doubling each time, capped at 24 hours.
-- Returns the kid's auth user id on success.
create function app.kid_verify_pin(p_slug text, p_username text, p_pin text, p_ip text)
returns table (result text, user_id uuid, locked_until timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare
  v_org public.organizations%rowtype;
  v_kid public.kids%rowtype;
  v_cred public.kid_credentials%rowtype;
  v_ip_fails integer;
  v_ok boolean;
  v_lock timestamptz;
begin
  select count(*) into v_ip_fails from public.kid_login_attempts a
  where a.ip = p_ip and not a.success and a.at > now() - interval '10 minutes';
  if v_ip_fails >= 30 then
    return query select 'rate_limited'::text, null::uuid, null::timestamptz;
    return;
  end if;

  select * into v_org from public.organizations o where o.slug = lower(btrim(p_slug));
  if found then
    select * into v_kid from public.kids k where k.organization_id = v_org.id and k.username = lower(btrim(p_username));
  end if;

  if v_kid.id is null or v_kid.status <> 'active' or v_kid.user_id is null or v_org.status in ('pending', 'suspended') then
    -- same cost as a real check, so a wrong username is not faster
    perform extensions.crypt(coalesce(p_pin, ''), extensions.gen_salt('bf', 8));
    insert into public.kid_login_attempts (organization_id, username, ip, success) values (v_org.id, left(p_username, 40), p_ip, false);
    return query select 'invalid'::text, null::uuid, null::timestamptz;
    return;
  end if;

  select * into v_cred from public.kid_credentials c where c.kid_id = v_kid.id for update;
  if v_cred.locked_until is not null and v_cred.locked_until > now() then
    insert into public.kid_login_attempts (organization_id, username, ip, success) values (v_org.id, v_kid.username, p_ip, false);
    return query select 'locked'::text, null::uuid, v_cred.locked_until;
    return;
  end if;

  v_ok := v_cred.pin_hash = extensions.crypt(coalesce(p_pin, ''), v_cred.pin_hash);
  insert into public.kid_login_attempts (organization_id, username, ip, success) values (v_org.id, v_kid.username, p_ip, v_ok);

  if v_ok then
    update public.kid_credentials set failed_attempts = 0, locked_until = null, updated_at = now() where kid_id = v_kid.id;
    return query select 'ok'::text, v_kid.user_id, null::timestamptz;
    return;
  end if;

  if v_cred.failed_attempts + 1 >= 5 then
    v_lock := now() + least(interval '15 minutes' * power(2, v_cred.lockouts), interval '24 hours');
    update public.kid_credentials set failed_attempts = 0, lockouts = lockouts + 1, locked_until = v_lock, updated_at = now()
    where kid_id = v_kid.id;
    perform app.audit(v_org.id, null, 'kid.locked_out', 'kid', v_kid.id::text, jsonb_build_object('until', v_lock));
    return query select 'locked'::text, null::uuid, v_lock;
    return;
  end if;

  update public.kid_credentials set failed_attempts = failed_attempts + 1, updated_at = now() where kid_id = v_kid.id;
  return query select 'invalid'::text, null::uuid, null::timestamptz;
end;
$$;
grant execute on function app.kid_verify_pin(text, text, text, text) to service_role;

-- Supabase's own default privileges grant EXECUTE on new functions to anon
-- and authenticated regardless of the defaults set at the top of this file.
-- So strip everything here, then grant back exactly what is intended. The
-- structure tests (supabase/tests/01_structure.test.sql) pin this list.
revoke execute on all functions in schema public from public, anon, authenticated;
revoke execute on all functions in schema app from public, anon, authenticated;

grant execute on function
  app.is_platform_admin(),
  app.has_org_role(uuid, public.org_role[]),
  app.my_kid_org(),
  app.is_org_member(uuid),
  app.org_status(uuid),
  app.org_is_writable(uuid),
  app.org_can_setup(uuid),
  app.is_guardian_of(uuid),
  app.org_kid_limit(uuid),
  app.org_has_feature(uuid, text)
to anon, authenticated;

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
  public.reset_kid_pin(uuid, text)
to authenticated;

grant execute on all functions in schema app to service_role;
grant execute on all functions in schema public to service_role;

-- ---------------------------------------------------------------------------
-- catalogue seed (Banks, Gate 1: NGN monthly prices; editable by Super Admin)
-- ---------------------------------------------------------------------------

insert into public.currency_settings (currency) values ('NGN'), ('GBP'), ('USD'), ('EUR'), ('CAD');

insert into public.plans (code, name, kid_limit, is_custom, sort) values
  ('starter', 'Starter', 50, false, 1),
  ('basic', 'Basic', 150, false, 2),
  ('pro', 'Pro', 400, false, 3),
  ('network', 'Network', null, true, 4);

insert into public.plan_prices (plan_id, currency, billing_interval, amount_minor)
select id, 'NGN', 'month', amount from (values ('starter', 2000000::bigint), ('basic', 4500000::bigint), ('pro', 8500000::bigint)) v(code, amount)
join public.plans p using (code);

-- Gate 1: the AI companion is Pro and up.
insert into public.plan_features (plan_id, feature_key, enabled)
select id, 'ai_companion', code in ('pro', 'network') from public.plans;
