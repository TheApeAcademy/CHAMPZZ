-- Structural guarantees: these fail the build if a future migration forgets
-- RLS, forgets organization_id, or quietly exposes a function or a write path.
begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

select is(
  (select array_agg(c.relname::text order by c.relname) from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity),
  null,
  'every table in public has row level security enabled'
);

-- Global (non-tenant) tables. Anything else must carry organization_id.
select is(
  (select array_agg(t.table_name::text order by t.table_name) from information_schema.tables t
   where t.table_schema = 'public' and t.table_type = 'BASE TABLE'
     and t.table_name not in ('organizations', 'platform_admins', 'profiles', 'currency_settings', 'plans', 'plan_prices',
                              'plan_features', 'billing_events', 'audit_log', 'kid_login_attempts')
     and not exists (select 1 from information_schema.columns c
                     where c.table_schema = 'public' and c.table_name = t.table_name and c.column_name = 'organization_id')),
  null,
  'every tenant table has organization_id'
);

-- The only tables a signed-in user may INSERT into directly. Adding one
-- means adding it here and to the isolation tests on purpose.
select is(
  (select array_agg(distinct tablename::text order by tablename::text) from pg_policies
   where schemaname = 'public' and cmd in ('INSERT', 'ALL') and 'authenticated' = any (roles)
     and tablename not in ('plans', 'plan_prices', 'plan_features', 'currency_settings')),
  array['class_teachers', 'classes', 'org_branding'],
  'client insert policies exist only where intended (catalogue writes are platform-admin only)'
);

select is(
  (select array_agg(p.proname::text order by p.proname) from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('public', 'app') and has_function_privilege('anon', p.oid, 'execute')
     and n.nspname || '.' || p.proname not like 'app.%'),
  array['get_clubhouse'],
  'anon can call exactly one public function: get_clubhouse'
);

select is(
  (select array_agg(p.proname::text order by p.proname) from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and has_function_privilege('authenticated', p.oid, 'execute')),
  array['approve_kid', 'archive_kid', 'confirm_kid', 'create_organization', 'get_clubhouse', 'mark_as_paid',
        'regenerate_join_code', 'reset_kid_pin', 'suspend_organization', 'unsuspend_organization'],
  'signed-in users can call exactly the intended public functions'
);

select is(
  (select array_agg(p.proname::text order by p.proname) from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'app' and has_function_privilege('authenticated', p.oid, 'execute')
     and p.proname in ('apply_payment', 'register_kid', 'kid_verify_pin', 'lifecycle_tick', 'attach_kid_user',
                       'discard_kid', 'new_join_code', 'audit', 'new_username')),
  null,
  'service-only functions are not callable by signed-in users'
);

select is(
  (select array_agg(p.proname::text order by p.proname) from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname like 'svc\_%'
     and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('authenticated', p.oid, 'execute'))),
  null,
  'server-only svc_ wrappers are callable by the service role only'
);

select * from finish();
rollback;
