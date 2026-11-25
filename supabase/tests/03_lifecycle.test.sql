-- Org lifecycle, payments, join codes, kid limit and PIN lockout.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

create schema tests;
create function tests.make_user(p_email text) returns uuid language plpgsql as $$
declare v uuid := gen_random_uuid();
begin
  insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, email_confirmed_at)
  values (v, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', p_email, '{}'::jsonb, '{}'::jsonb, now());
  return v;
end $$;
create function tests.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
end $$;
create function tests.reset() returns void language plpgsql as $$
begin execute 'reset role'; perform set_config('request.jwt.claims', '', true); end $$;
create table tests.v (k text primary key, id uuid, s text);
grant usage on schema tests to authenticated;
grant select, insert on tests.v to authenticated;
create function tests.id(p text) returns uuid language sql stable as $$ select id from tests.v where k = p $$;
grant execute on function tests.id(text) to authenticated;

insert into tests.v (k, id) values ('owner', tests.make_user('owner@test.local')), ('parent', tests.make_user('parent@test.local')),
  ('parent2', tests.make_user('parent2@test.local')), ('platform', tests.make_user('platform@test.local'));
insert into public.platform_admins values (tests.id('platform'));

-- 1. sign up: pending, owner is Org Admin, nothing unlocks
select tests.act_as(tests.id('owner'));
insert into tests.v (k, id) select 'org', public.create_organization('Sunrise Kids', 'sunrise-kids', 'club', 'NG', 'Africa/Lagos', 'NGN', false);
select tests.reset();
select is((select status::text from public.organizations where id = tests.id('org')), 'pending', 'a new org starts pending');
select is((select role::text from public.memberships where organization_id = tests.id('org') and user_id = tests.id('owner')), 'org_admin', 'creator is Org Admin');
select is((select count(*)::int from public.join_codes where organization_id = tests.id('org')), 0, 'no join code while pending');

-- the onboarding wizard works while pending
select tests.act_as(tests.id('owner'));
select lives_ok($$insert into public.classes (organization_id, name) values (tests.id('org'), 'Juniors')$$, 'pending org can create classes (wizard)');
select throws_ok($$select public.regenerate_join_code(tests.id('org'))$$, 'P0001', 'organization_not_active', 'pending org cannot make a join code');
select tests.reset();

-- 2. Mark as paid (Super Admin): active, join code issued, payment recorded with approver
select tests.act_as(tests.id('owner'));
select throws_ok($$select public.mark_as_paid(tests.id('org'), (select id from public.plans where code = 'starter'), 'month', now() + interval '30 days', 'cash', 2000000, 'NGN')$$,
  'P0001', 'not_allowed', 'Org Admin cannot mark their own org paid');
select tests.reset();
select tests.act_as(tests.id('platform'));
select lives_ok($$select public.mark_as_paid(tests.id('org'), (select id from public.plans where code = 'starter'), 'month', now() + interval '30 days', 'bank_transfer', 2000000, 'NGN', 'Transfer seen')$$,
  'Super Admin marks the org paid');
select tests.reset();
select is((select status::text from public.organizations where id = tests.id('org')), 'active', 'paid org is active');
select is((select count(*)::int from public.join_codes where organization_id = tests.id('org') and active), 1, 'activation issues one join code');
select is((select approved_by from public.payments where organization_id = tests.id('org')), tests.id('platform'), 'payment records who approved it');
select ok((select approved_at is not null from public.payments where organization_id = tests.id('org')), 'payment records when it was approved');
select is(app.org_kid_limit(tests.id('org')), 50, 'kid limit comes from the plan (Starter = 50)');

-- 3. webhook path is idempotent
select is(app.apply_payment(tests.id('org'), (select id from public.plans where code = 'basic'), 'month', 'NGN', 4500000, now() + interval '60 days', 'flutterwave', 'card', 'flw-1'),
          app.apply_payment(tests.id('org'), (select id from public.plans where code = 'basic'), 'month', 'NGN', 4500000, now() + interval '60 days', 'flutterwave', 'card', 'flw-1'),
          'the same provider reference applied twice returns the same payment');
select is((select count(*)::int from public.payments where provider = 'flutterwave' and provider_ref = 'flw-1'), 1, 'and records it once');
select is(app.org_kid_limit(tests.id('org')), 150, 'upgrading to Basic raises the limit to 150');

-- 4. join code regeneration kills the old code
insert into tests.v (k, s) select 'code1', code from public.join_codes where organization_id = tests.id('org') and active;
select tests.act_as(tests.id('owner'));
insert into tests.v (k, s) select 'code2', public.regenerate_join_code(tests.id('org'));
select tests.reset();
select isnt((select s from tests.v where k = 'code2'), (select s from tests.v where k = 'code1'), 'regenerated code is different');
select throws_ok($$select * from app.register_kid(tests.id('parent'), (select s from tests.v where k = 'code1'), 'Ada', 'O', null, '1-2-3-4', 'v1', '{}')$$,
  'P0001', 'invalid_join_code', 'the old join code stops working');

-- 5. registration and the kid limit (force a limit of 2 to test the edge)
update public.subscriptions set kid_limit_override = 2 where organization_id = tests.id('org');
select lives_ok($$select * from app.register_kid(tests.id('parent'), (select s from tests.v where k = 'code2'), 'Ada', 'O', null, '1-2-3-4', 'v1', '{"photos": false}')$$, 'kid 1 registers');
select lives_ok($$select * from app.register_kid(tests.id('parent2'), (select s from tests.v where k = 'code2'), 'Tobi', 'A', null, '0-0-0-0', 'v1', '{}')$$, 'kid 2 registers');
select throws_ok($$select * from app.register_kid(tests.id('parent2'), (select s from tests.v where k = 'code2'), 'Zara', null, null, '1-1-1-1', 'v1', '{}')$$,
  'P0001', 'kid_limit_reached', 'kid 3 is blocked at the cap');
select is((select count(*)::int from public.kids where organization_id = tests.id('org') and status = 'active'), 2, 'exactly the limit is active');
select is((select count(*)::int from public.kids k where organization_id = tests.id('org') and confirmed_at is null), 2, 'new kids start unconfirmed ("new")');
select is((select count(*)::int from public.consents where organization_id = tests.id('org')), 2, 'every kid has a consent record');
select is((select count(*)::int from public.guardians where organization_id = tests.id('org')), 2, 'every kid is linked to the registering parent');
select ok((select bool_and(username ~ '^[a-z]+-[a-z]+-[0-9]{2}$') from public.kids where organization_id = tests.id('org')), 'usernames are generated, never the real name');

-- 6. approval mode: request is pending and does not count until approved under the lock
update public.subscriptions set kid_limit_override = 3 where organization_id = tests.id('org');
update public.organizations set registration_mode = 'approval' where id = tests.id('org');
insert into tests.v (k, id) select 'pendingkid', kid_id from app.register_kid(tests.id('parent2'), (select s from tests.v where k = 'code2'), 'Zara', null, null, '1-1-1-1', 'v1', '{}');
select is((select status::text from public.kids where id = tests.id('pendingkid')), 'pending', 'approval mode: registration waits');
select tests.act_as(tests.id('owner'));
select lives_ok($$select public.approve_kid(tests.id('pendingkid'))$$, 'Org Admin approves within the limit');
select tests.reset();
insert into tests.v (k, id) select 'pendingkid2', kid_id from app.register_kid(tests.id('parent2'), (select s from tests.v where k = 'code2'), 'Femi', null, null, '2-2-2-2', 'v1', '{}');
select tests.act_as(tests.id('owner'));
select throws_ok($$select public.approve_kid(tests.id('pendingkid2'))$$, 'P0001', 'kid_limit_reached', 'approval is refused at the cap');
select tests.reset();

-- 7. PIN check and lockout
insert into tests.v (k, s) select 'ada', username from public.kids where first_name = 'Ada';
update public.kids set user_id = tests.id('parent') where first_name = 'Ada'; -- stand-in auth user for the check
select is((select result from app.kid_verify_pin('sunrise-kids', (select s from tests.v where k = 'ada'), '1-2-3-4', '9.9.9.9')), 'ok', 'right PIN signs in');
select is((select result from app.kid_verify_pin('sunrise-kids', (select s from tests.v where k = 'ada'), '4-3-2-1', '9.9.9.1')), 'invalid', 'wrong PIN is refused');
select app.kid_verify_pin('sunrise-kids', (select s from tests.v where k = 'ada'), '4-3-2-1', '9.9.9.1') from generate_series(1, 3);
select is((select result from app.kid_verify_pin('sunrise-kids', (select s from tests.v where k = 'ada'), '4-3-2-1', '9.9.9.1')), 'locked', 'fifth wrong PIN locks the kid');
select is((select result from app.kid_verify_pin('sunrise-kids', (select s from tests.v where k = 'ada'), '1-2-3-4', '9.9.9.2')), 'locked', 'even the right PIN is refused while locked');
select is((select result from app.kid_verify_pin('sunrise-kids', 'no-such-kid-00', '1-2-3-4', '9.9.9.3')), 'invalid', 'unknown username looks the same as a wrong PIN');
select tests.act_as(tests.id('owner'));
select lives_ok($$select public.reset_kid_pin((select id from public.kids where first_name = 'Ada'), '5-6-7-8')$$, 'staff reset clears the lock');
select tests.reset();
select is((select result from app.kid_verify_pin('sunrise-kids', (select s from tests.v where k = 'ada'), '5-6-7-8', '9.9.9.4')), 'ok', 'new PIN works after reset');

-- 8. lifecycle: active -> grace -> read_only, data kept, writes blocked
select is(app.lifecycle_tick(now() + interval '61 days'), 1, 'period ends: one org moves');
select is((select status::text from public.organizations where id = tests.id('org')), 'grace', 'unpaid org enters grace');
select is(app.lifecycle_tick(now() + interval '61 days' + interval '8 days'), 1, 'grace ends: one org moves');
select is((select status::text from public.organizations where id = tests.id('org')), 'read_only', 'then read_only');
select is((select count(*)::int from public.kids where organization_id = tests.id('org')), 4, 'no data deleted on expiry');
select tests.act_as(tests.id('owner'));
select is((select count(*)::int from public.kids), 4, 'read_only org can still read');
select throws_ok($$insert into public.classes (organization_id, name) values (tests.id('org'), 'Seniors')$$, '42501', null, 'read_only org cannot write');
select throws_ok($$select public.regenerate_join_code(tests.id('org'))$$, 'P0001', 'organization_not_active', 'read_only org cannot make join codes');
select tests.reset();
select throws_ok($$select * from app.register_kid(tests.id('parent'), (select s from tests.v where k = 'code2'), 'Late', null, null, '1-2-3-4', 'v1', '{}')$$,
  'P0001', 'organization_not_active', 'read_only org takes no registrations');

-- paying again restores it
select lives_ok($$select app.apply_payment(tests.id('org'), (select id from public.plans where code = 'basic'), 'month', 'NGN', 4500000, now() + interval '120 days', 'flutterwave', 'card', 'flw-2')$$, 'payment after expiry');
select is((select status::text from public.organizations where id = tests.id('org')), 'active', 'read_only org is active again after paying');

-- 9. suspension (Super Admin only) and back
select tests.act_as(tests.id('platform'));
select lives_ok($$select public.suspend_organization(tests.id('org'), 'test')$$, 'Super Admin suspends');
select tests.reset();
select is((select status::text from public.organizations where id = tests.id('org')), 'suspended', 'org is suspended');
select is((select result from app.kid_verify_pin('sunrise-kids', (select s from tests.v where k = 'ada'), '5-6-7-8', '9.9.9.5')), 'invalid', 'kids cannot sign in to a suspended org');
select tests.act_as(tests.id('platform'));
select lives_ok($$select public.unsuspend_organization(tests.id('org'))$$, 'Super Admin lifts it');
select tests.reset();
select is((select status::text from public.organizations where id = tests.id('org')), 'active', 'org returns to its previous status');

select ok((select count(*) > 5 from public.audit_log where organization_id = tests.id('org')), 'sensitive actions are in the audit log');

select * from finish();
rollback;
