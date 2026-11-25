-- Org isolation: for every role in org A, every tenant table, org B's rows are
-- invisible and unwritable. Tables are enumerated from the catalogue, so a
-- table added later is covered without editing this file.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

create schema tests;

create function tests.make_user(p_email text, p_kind text default 'adult') returns uuid
language plpgsql as $$
declare v uuid := gen_random_uuid();
begin
  insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, email_confirmed_at)
  values (v, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', p_email,
          jsonb_build_object('kind', p_kind), jsonb_build_object('full_name', p_email), now());
  return v;
end $$;

create function tests.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
end $$;

create function tests.reset() returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
end $$;

create table tests.ids (name text primary key, id uuid not null);
grant usage on schema tests to authenticated;
grant select on tests.ids to authenticated;
create function tests.id(p text) returns uuid language sql stable as $$ select id from tests.ids where name = p $$;
grant execute on function tests.id(text) to authenticated;

-- fixture: two active orgs, each with an admin, teacher, parent and kid
do $$
declare
  o text; v_org uuid; v_class uuid; v_kid uuid; v_admin uuid; v_teacher uuid; v_parent uuid; v_kiduser uuid; v_plan uuid;
begin
  select id into v_plan from public.plans where code = 'basic';
  insert into tests.ids values ('platform', tests.make_user('platform@test.local'));
  insert into public.platform_admins values (tests.id('platform'));
  foreach o in array array['a', 'b'] loop
    v_admin := tests.make_user('admin-' || o || '@test.local');
    v_teacher := tests.make_user('teacher-' || o || '@test.local');
    v_parent := tests.make_user('parent-' || o || '@test.local');
    v_kiduser := tests.make_user('kid-' || o || '@kids.test', 'kid');
    insert into public.organizations (slug, name, kind, status, created_by) values ('org-' || o, 'Org ' || o, 'church', 'active', v_admin) returning id into v_org;
    insert into public.org_branding (organization_id) values (v_org);
    insert into public.memberships (organization_id, user_id, role) values (v_org, v_admin, 'org_admin'), (v_org, v_teacher, 'teacher'), (v_org, v_parent, 'parent');
    insert into public.subscriptions (organization_id, plan_id, billing_interval, currency, current_period_start, current_period_end, provider)
      values (v_org, v_plan, 'month', 'NGN', now(), now() + interval '30 days', 'manual');
    insert into public.payments (organization_id, plan_id, provider, method, provider_ref, amount_minor, currency, period_end_granted)
      values (v_org, v_plan, 'manual', 'cash', 'ref-' || o, 4500000, 'NGN', now() + interval '30 days');
    insert into public.checkout_sessions (organization_id, plan_id, billing_interval, currency, amount_minor, provider, tx_ref)
      values (v_org, v_plan, 'month', 'NGN', 4500000, 'flutterwave', 'tx-' || o);
    insert into public.join_codes (organization_id, code) values (v_org, case o when 'a' then 'AAAA-AAAA' else 'BBBB-BBBB' end);
    insert into public.classes (organization_id, name) values (v_org, 'Juniors') returning id into v_class;
    insert into public.class_teachers (organization_id, class_id, user_id) values (v_org, v_class, v_teacher);
    insert into public.kids (organization_id, user_id, first_name, username, class_id) values (v_org, v_kiduser, 'Kid' || o, 'brave-lion-1' || (case o when 'a' then 1 else 2 end), v_class) returning id into v_kid;
    -- a second kid in the same org that this parent is NOT linked to
    insert into public.kids (organization_id, first_name, username) values (v_org, 'Other' || o, 'calm-otter-3' || (case o when 'a' then 1 else 2 end));
    insert into public.kid_credentials (kid_id, organization_id, pin_hash) values (v_kid, v_org, extensions.crypt('1-2-3-4', extensions.gen_salt('bf', 4)));
    insert into public.guardians (organization_id, kid_id, user_id) values (v_org, v_kid, v_parent);
    insert into public.consents (organization_id, kid_id, guardian_user_id, method, policy_version) values (v_org, v_kid, v_parent, 'online', 'v1');
    insert into public.registration_events (organization_id, kid_id, by_user) values (v_org, v_kid, v_parent);
    insert into public.kid_login_attempts (organization_id, username, ip, success) values (v_org, 'x', '1.1.1.1', false);
    insert into public.audit_log (organization_id, action) values (v_org, 'fixture');
    insert into tests.ids values ('org_' || o, v_org), ('class_' || o, v_class), ('kid_' || o, v_kid),
      ('admin_' || o, v_admin), ('teacher_' || o, v_teacher), ('parent_' || o, v_parent), ('kiduser_' || o, v_kiduser);
  end loop;
end $$;

-- The matrix. Returns one TAP line per (role, table, operation).
create function tests.matrix(p_role text) returns setof text language plpgsql as $$
declare
  t record; n integer; v_user uuid := tests.id(p_role || '_a'); v_b uuid := tests.id('org_b'); v_err text;
begin
  for t in
    select c.table_name from information_schema.columns c
    join information_schema.tables tb on tb.table_schema = c.table_schema and tb.table_name = c.table_name and tb.table_type = 'BASE TABLE'
    where c.table_schema = 'public' and c.column_name = 'organization_id'
    order by c.table_name
  loop
    -- read
    v_err := null; n := null;
    begin
      perform tests.act_as(v_user);
      execute format('select count(*) from public.%I where organization_id = $1', t.table_name) into n using v_b;
      perform tests.reset();
    exception when insufficient_privilege then
      perform tests.reset(); n := 0; v_err := 'denied';
    end;
    return next is(n, 0, format('%s in org A cannot read org B rows of %s%s', p_role, t.table_name, coalesce(' (' || v_err || ')', '')));

    -- update
    begin
      perform tests.act_as(v_user);
      execute format('update public.%I set organization_id = organization_id where organization_id = $1', t.table_name) using v_b;
      get diagnostics n = row_count;
      perform tests.reset();
    exception when insufficient_privilege then
      perform tests.reset(); n := 0;
    end;
    return next is(n, 0, format('%s in org A cannot update org B rows of %s', p_role, t.table_name));

    -- delete (inside the exception block's savepoint, so nothing sticks either way)
    begin
      perform tests.act_as(v_user);
      execute format('delete from public.%I where organization_id = $1', t.table_name) using v_b;
      get diagnostics n = row_count;
      perform tests.reset();
    exception when insufficient_privilege then
      perform tests.reset(); n := 0;
    end;
    return next is(n, 0, format('%s in org A cannot delete org B rows of %s', p_role, t.table_name));
  end loop;
end $$;

select * from tests.matrix('admin');
select * from tests.matrix('teacher');
select * from tests.matrix('parent');
select * from tests.matrix('kiduser');

-- B's rows still all exist after every attempted write
select is((select count(*)::int from public.kids where organization_id = tests.id('org_b')), 2, 'org B kids untouched');
select is((select count(*)::int from public.payments where organization_id = tests.id('org_b')), 1, 'org B payments untouched');

-- inserts into org B through the three client-insertable tables
select tests.act_as(tests.id('admin_a'));
select throws_ok(format($q$insert into public.classes (organization_id, name) values (%L, 'Sneaky')$q$, tests.id('org_b')), '42501', null, 'admin A cannot create a class in org B');
select throws_ok(format($q$insert into public.org_branding (organization_id) values (%L)$q$, tests.id('org_b')), null, null, 'admin A cannot write org B branding');
select throws_ok(format($q$insert into public.class_teachers (organization_id, class_id, user_id) values (%L, %L, %L)$q$, tests.id('org_b'), tests.id('class_b'), tests.id('teacher_a')), '42501', null, 'admin A cannot add a teacher to an org B class');
select tests.reset();

-- functions refuse other orgs
select tests.act_as(tests.id('admin_a'));
select throws_ok(format('select public.regenerate_join_code(%L)', tests.id('org_b')), 'P0001', 'not_allowed', 'admin A cannot regenerate org B join code');
select throws_ok(format('select public.confirm_kid(%L)', tests.id('kid_b')), 'P0001', 'not_allowed', 'admin A cannot confirm an org B kid');
select throws_ok(format('select public.archive_kid(%L, %L)', tests.id('kid_b'), 'x'), 'P0001', 'not_allowed', 'admin A cannot archive an org B kid');
select throws_ok(format('select public.reset_kid_pin(%L, %L)', tests.id('kid_b'), '1-1-1-1'), 'P0001', 'not_allowed', 'admin A cannot reset an org B kid PIN');
select throws_ok(format('select public.mark_as_paid(%L, (select id from public.plans where code = %L), %L, now() + interval %L, %L, 1, %L)', tests.id('org_b'), 'pro', 'month', '30 days', 'cash', 'NGN'), 'P0001', 'not_allowed', 'an Org Admin cannot Mark as paid');
select throws_ok(format('select public.suspend_organization(%L, %L)', tests.id('org_b'), 'x'), 'P0001', 'not_allowed', 'an Org Admin cannot suspend an org');
select tests.reset();

select tests.act_as(tests.id('teacher_a'));
select throws_ok(format('select public.confirm_kid(%L)', tests.id('kid_b')), 'P0001', 'not_allowed', 'teacher A cannot confirm an org B kid');
select tests.reset();

-- positive controls: the policies are not simply denying everything
select tests.act_as(tests.id('admin_a'));
select is((select count(*)::int from public.kids), 2, 'admin A sees both org A kids');
select is((select count(*)::int from public.payments), 1, 'admin A sees org A payment');
select throws_ok('select count(*) from public.kid_credentials', '42501', null, 'nobody reads kid credentials, not even an Org Admin');
select tests.reset();

select tests.act_as(tests.id('teacher_a'));
select is((select count(*)::int from public.kids), 2, 'teacher A sees org A kids');
select is((select count(*)::int from public.payments), 0, 'teacher A cannot see billing');
select tests.reset();

select tests.act_as(tests.id('parent_a'));
select is((select array_agg(id) from public.kids), array[tests.id('kid_a')], 'parent A sees only their own kid');
select is((select count(*)::int from public.memberships), 1, 'parent A sees only their own membership');
select tests.reset();

select tests.act_as(tests.id('kiduser_a'));
select is((select array_agg(id) from public.kids), array[tests.id('kid_a')], 'kid A sees only themselves');
select is((select count(*)::int from public.guardians), 0, 'kid A cannot read guardian links');
select is((select count(*)::int from public.classes), 1, 'kid A sees their org classes');
select tests.reset();

-- the org table itself is keyed by id, not organization_id
create function tests.rename_org_b() returns integer language plpgsql as $f$
declare n integer;
begin
  update public.organizations set name = 'Hijack' where id = tests.id('org_b');
  get diagnostics n = row_count;
  return n;
end $f$;
grant execute on function tests.rename_org_b() to authenticated;
select tests.act_as(tests.id('admin_a'));
select is((select array_agg(id) from public.organizations), array[tests.id('org_a')], 'admin A sees only org A');
select is(tests.rename_org_b(), 0, 'admin A cannot rename org B');
select tests.reset();
select tests.act_as(tests.id('parent_a'));
select is((select array_agg(id) from public.organizations), array[tests.id('org_a')], 'parent A sees only org A');
select tests.reset();
select tests.act_as(tests.id('kiduser_a'));
select is((select array_agg(id) from public.organizations), array[tests.id('org_a')], 'kid A sees only org A');
select tests.reset();

select tests.act_as(tests.id('platform'));
select is((select count(*)::int from public.kids), 4, 'platform admin sees kids in every org');
select tests.reset();

-- anon
set local role anon;
select throws_ok('select count(*) from public.kids', '42501', null, 'anon cannot read kids');
select throws_ok('select count(*) from public.organizations', '42501', null, 'anon cannot read organizations');
select is((select count(*)::int from public.get_clubhouse('org-a')), 1, 'anon can read a Clubhouse');
reset role;

select * from finish();
rollback;
