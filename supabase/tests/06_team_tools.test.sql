-- Team invites and roles, check-in and pickup codes, certificates, seasons, insights, motto.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

create schema tests;
create function tests.make_user(p_kind text default 'adult') returns uuid language plpgsql as $$
declare v uuid := gen_random_uuid();
begin
  insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, email_confirmed_at)
  values (v, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v || '@t.local', jsonb_build_object('kind', p_kind), jsonb_build_object('full_name', 'Tester'), now());
  return v;
end $$;
create function tests.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
end $$;
create function tests.reset() returns void language plpgsql as $$
begin execute 'reset role'; perform set_config('request.jwt.claims', '', true); end $$;
create table tests.v (k text primary key, id uuid);
create table tests.s (k text primary key, v text);
grant usage on schema tests to authenticated;
grant select, insert on tests.v, tests.s to authenticated;
create function tests.id(p text) returns uuid language sql stable as $$ select id from tests.v where k = p $$;
create function tests.str(p text) returns text language sql stable as $$ select v from tests.s where k = p $$;
grant execute on function tests.id(text), tests.str(text) to authenticated;

do $$
declare a uuid; b uuid; c1 uuid; plan uuid;
begin
  select id into plan from public.plans where code = 'starter';
  insert into public.organizations (slug, name, kind, status) values ('tt-a', 'TT A', 'church', 'active') returning id into a;
  insert into public.organizations (slug, name, kind, status) values ('tt-b', 'TT B', 'club', 'active') returning id into b;
  insert into public.subscriptions (organization_id, plan_id, billing_interval, currency, current_period_start, current_period_end)
    values (a, plan, 'month', 'NGN', now(), now() + interval '30 days'), (b, plan, 'month', 'NGN', now(), now() + interval '30 days');
  insert into public.org_branding (organization_id) values (a), (b);
  insert into public.classes (organization_id, name) values (a, 'One') returning id into c1;
  insert into tests.v values ('a', a), ('b', b), ('c1', c1),
    ('admin', tests.make_user()), ('t1', tests.make_user()), ('admin_b', tests.make_user()), ('parent', tests.make_user()),
    ('joiner', tests.make_user()), ('joiner2', tests.make_user()),
    ('u_kid', tests.make_user('kid')), ('u_new', tests.make_user('kid')), ('u_third', tests.make_user('kid'));
  insert into public.memberships (organization_id, user_id, role) values
    (a, tests.id('admin'), 'org_admin'), (a, tests.id('t1'), 'teacher'), (b, tests.id('admin_b'), 'org_admin');
  insert into public.class_teachers (organization_id, class_id, user_id) values (a, c1, tests.id('t1'));
  insert into public.kids (organization_id, user_id, first_name, last_initial, username, class_id, confirmed_at) values
    (a, tests.id('u_kid'), 'Ada', 'O', 'brave-lion-31', c1, now()),
    (a, tests.id('u_new'), 'Newbie', null, 'calm-otter-32', c1, null),
    (a, tests.id('u_third'), 'Tolu', null, 'kind-panda-33', c1, now());
  insert into tests.v select 'kid', id from public.kids where username = 'brave-lion-31';
  insert into tests.v select 'newkid', id from public.kids where username = 'calm-otter-32';
  insert into tests.v select 'third', id from public.kids where username = 'kind-panda-33';
  insert into public.guardians (organization_id, kid_id, user_id) values (a, tests.id('kid'), tests.id('parent'));
end $$;

-- ---------- team invites ----------
select tests.act_as(tests.id('admin'));
insert into tests.s select 'tok', public.create_team_invite(tests.id('a'), 'teacher', 'New@Example.com');
insert into tests.s select 'tok_kid', public.create_team_invite(tests.id('a'), 'teacher');
insert into tests.s select 'tok_revoke', public.create_team_invite(tests.id('a'), 'org_admin');
insert into tests.s select 'tok_old', public.create_team_invite(tests.id('a'), 'teacher');
select is(char_length(tests.str('tok')), 48, 'an invite token is 48 hex characters');
select is((select email from public.team_invites where organization_id = tests.id('a') order by created_at limit 1), 'new@example.com', 'invite email is normalised');
select throws_ok($$select token_hash from public.team_invites$$, '42501', null, 'the token hash is never readable');
select throws_ok($$select public.create_team_invite(tests.id('a'), 'parent')$$, 'P0001', 'bad_role', 'only teacher or Org Admin invites');
select lives_ok($$select public.revoke_team_invite((select id from public.team_invites where organization_id = tests.id('a') and role = 'org_admin'))$$, 'admin revokes an invite');
select tests.reset();
select ok((select count(*) from public.team_invites where organization_id = tests.id('a')) = 4, 'tokens are stored only as hashes');
select ok(not exists (select 1 from public.team_invites where token_hash = tests.str('tok')), 'the raw token is not stored');
update public.team_invites set expires_at = now() - interval '1 minute' where token_hash = encode(extensions.digest(tests.str('tok_old'), 'sha256'), 'hex');

select tests.act_as(tests.id('t1'));
select throws_ok($$select public.create_team_invite(tests.id('a'), 'teacher')$$, 'P0001', 'not_allowed', 'a teacher cannot invite');
select is((select count(*)::int from public.team_invites), 0, 'a teacher cannot see invites');
select throws_ok($$select * from public.team_members(tests.id('a'))$$, 'P0001', 'not_allowed', 'a teacher cannot list the team');
select tests.reset();

select tests.act_as(tests.id('joiner'));
select is(public.accept_team_invite(tests.str('tok')), 'tt-a', 'accepting an invite returns the club');
select throws_ok($$select public.accept_team_invite(tests.str('tok'))$$, 'P0001', 'invite_invalid', 'an invite works once');
select throws_ok($$select public.accept_team_invite(tests.str('tok_revoke'))$$, 'P0001', 'invite_invalid', 'a revoked invite fails');
select throws_ok($$select public.accept_team_invite(tests.str('tok_old'))$$, 'P0001', 'invite_invalid', 'an expired invite fails');
select throws_ok($$select public.accept_team_invite('not-a-real-token')$$, 'P0001', 'invite_invalid', 'a made-up token fails');
select tests.reset();
select ok(exists (select 1 from public.memberships where organization_id = tests.id('a') and user_id = tests.id('joiner') and role = 'teacher' and status = 'active'), 'the joiner is now a teacher');
select ok(exists (select 1 from public.notifications where recipient_id = tests.id('admin') and kind = 'team_joined'), 'the Org Admin hears about it');

select tests.act_as(tests.id('u_kid'));
select throws_ok($$select public.accept_team_invite(tests.str('tok_kid'))$$, 'P0001', 'not_allowed', 'a kid can never join a team');
select tests.reset();

-- ---------- roles ----------
select tests.act_as(tests.id('admin'));
select is((select count(*)::int from public.team_members(tests.id('a'))), 3, 'admin lists the team');
select throws_ok($$select public.change_member_role((select membership_id from public.team_members(tests.id('a')) where is_me), 'teacher')$$, 'P0001', 'last_admin', 'the last Org Admin cannot step down');
select throws_ok($$select public.remove_member((select membership_id from public.team_members(tests.id('a')) where is_me))$$, 'P0001', 'last_admin', 'the last Org Admin cannot be removed');
select lives_ok($$select public.change_member_role((select membership_id from public.team_members(tests.id('a')) where user_id = tests.id('joiner')), 'org_admin')$$, 'promote a teacher');
select tests.reset();
select ok(exists (select 1 from public.memberships where user_id = tests.id('joiner') and role = 'org_admin' and status = 'active'), 'promoted to Org Admin');
select tests.act_as(tests.id('admin'));
select lives_ok($$select public.remove_member((select membership_id from public.team_members(tests.id('a')) where user_id = tests.id('t1')))$$, 'remove a teacher');
select tests.reset();
select ok(not exists (select 1 from public.class_teachers where user_id = tests.id('t1')), 'a removed teacher loses their classes');
select is((select status from public.memberships where user_id = tests.id('t1') and organization_id = tests.id('a')), 'removed', 'membership marked removed');
select ok(exists (select 1 from public.audit_log where organization_id = tests.id('a') and action = 'team.removed'), 'removal is audited');
select tests.act_as(tests.id('admin_b'));
select throws_ok($$select public.remove_member((select id from public.memberships where user_id = tests.id('joiner') and role = 'org_admin'))$$, 'P0001', 'not_allowed', 'another club cannot touch this team');
select tests.reset();
-- put t1 back for the attendance tests
update public.memberships set status = 'active' where user_id = tests.id('t1') and organization_id = tests.id('a');

-- ---------- check-in and pickup codes ----------
select tests.act_as(tests.id('t1'));
insert into tests.v select 'att_kid', attendance_id from public.check_in_kid(tests.id('kid'));
insert into tests.v select 'att_new', attendance_id from public.check_in_kid(tests.id('newkid'));
insert into tests.v select 'att_third', attendance_id from public.check_in_kid(tests.id('third'));
select ok((select already from public.check_in_kid(tests.id('kid'))), 'checking in twice returns the same visit');
select throws_ok($$select pickup_code from public.attendance$$, '42501', null, 'staff cannot read pickup codes from the table');
select is((select count(*)::int from public.attendance where organization_id = tests.id('a')), 3, 'staff see the register');
select tests.reset();
select ok((select confirmed_at is not null from public.kids where id = tests.id('newkid')), 'check-in confirms a new kid');
select is((select points from public.point_events where kid_id = tests.id('kid') and source = 'attendance'), 10, 'attendance is worth 10 Champ Points');
insert into tests.s select 'code_kid', pickup_code from public.attendance where id = tests.id('att_kid');
insert into tests.s select 'code_new', pickup_code from public.attendance where id = tests.id('att_new');
insert into tests.s select 'code_third', pickup_code from public.attendance where id = tests.id('att_third');
select ok(tests.str('code_kid') ~ '^[0-9]{4}$', 'pickup code is 4 digits');
select ok(exists (select 1 from public.notifications where recipient_id = tests.id('parent') and kind = 'checked_in' and body like '%' || tests.str('code_kid') || '%'), 'the parent gets the pickup code');

select tests.act_as(tests.id('parent'));
select is((select pickup_code from public.my_pickup_codes()), tests.str('code_kid'), 'the parent can see their own child''s code');
select is((select count(*)::int from public.my_pickup_codes()), 1, 'only their own child');
select tests.reset();
select tests.act_as(tests.id('admin_b'));
select is((select count(*)::int from public.my_pickup_codes()), 0, 'other adults see no codes');
select throws_ok($$select * from public.check_in_kid(tests.id('kid'))$$, 'P0001', 'not_allowed', 'another club cannot check in this kid');
select tests.reset();

select tests.act_as(tests.id('t1'));
select is(public.check_out_kid(tests.id('att_kid'), case when tests.str('code_kid') = '0000' then '1111' else '0000' end), 'wrong_code', 'a wrong code is refused');
select tests.reset();
select is((select failed_pickups from public.attendance where id = tests.id('att_kid')), 1, 'the wrong try is counted');
select tests.act_as(tests.id('t1'));
select is(public.check_out_kid(tests.id('att_kid'), tests.str('code_kid')), 'ok', 'the right code releases the child');
select throws_ok($$select public.check_out_kid(tests.id('att_kid'), tests.str('code_kid'))$$, 'P0001', 'already_checked_out', 'cannot check out twice');
select public.check_out_kid(tests.id('att_new'), 'abcd') from generate_series(1, 4);
select is(public.check_out_kid(tests.id('att_new'), 'abcd'), 'locked', 'five wrong codes lock the pickup');
select is(public.check_out_kid(tests.id('att_new'), tests.str('code_new')), 'locked', 'even the right code is refused once locked');
select throws_ok($$select public.check_out_override(tests.id('att_new'), 'Mum lost her phone')$$, 'P0001', 'not_allowed', 'only an Org Admin can release without a code');
select tests.reset();
select ok(exists (select 1 from public.notifications where recipient_id = tests.id('parent') and kind = 'checked_out'), 'the parent hears their child was collected');
select tests.act_as(tests.id('admin'));
select throws_ok($$select public.check_out_override(tests.id('att_new'), '')$$, 'P0001', 'reason_required', 'an override needs a reason');
select lives_ok($$select public.check_out_override(tests.id('att_new'), 'Mum lost her phone, ID checked')$$, 'Org Admin releases with a reason');
select tests.reset();
select ok(exists (select 1 from public.audit_log where action = 'attendance.override_checkout' and organization_id = tests.id('a')), 'the override is audited');

-- read-only club: no new check-ins, but a checked-in child can still go home
update public.organizations set status = 'read_only' where id = tests.id('a');
select tests.act_as(tests.id('t1'));
select throws_ok($$select * from public.check_in_kid(tests.id('kid'))$$, 'P0001', 'organization_not_active', 'no check-ins while read-only');
select is(public.check_out_kid(tests.id('att_third'), tests.str('code_third')), 'ok', 'check-out still works while read-only');
select tests.reset();
update public.organizations set status = 'active' where id = tests.id('a');

select tests.act_as(tests.id('u_kid'));
select is((select count(*)::int from public.attendance), 1, 'a kid sees only their own attendance');
select tests.reset();

-- ---------- certificates ----------
select tests.act_as(tests.id('t1'));
insert into tests.v select 'cert', public.issue_certificate(tests.id('kid'), 'Memory Verse Champion', 'Learned 10 verses');
select tests.reset();
select ok(exists (select 1 from public.notifications where recipient_id = tests.id('u_kid') and kind = 'certificate'), 'the kid is told');
select ok(exists (select 1 from public.notifications where recipient_id = tests.id('parent') and kind = 'certificate'), 'the parent is told');
select tests.act_as(tests.id('u_kid'));
select is((select title from public.certificates), 'Memory Verse Champion', 'the kid sees their certificate');
select throws_ok($$insert into public.certificates (organization_id, kid_id, title) values (tests.id('a'), tests.id('kid'), 'Fake')$$, '42501', null, 'a kid cannot make certificates');
select tests.reset();
select tests.act_as(tests.id('admin_b'));
select is((select count(*)::int from public.certificates), 0, 'another club sees no certificates');
select throws_ok($$select public.issue_certificate(tests.id('kid'), 'Nope')$$, 'P0001', 'not_allowed', 'another club cannot issue one');
select tests.reset();

-- ---------- seasons ----------
select tests.act_as(tests.id('admin'));
select lives_ok($$insert into public.seasons (organization_id, name, starts_on, ends_on) values (tests.id('a'), 'Spring', current_date - 1, current_date + 90)$$, 'admin starts a season');
select tests.reset();
select tests.act_as(tests.id('t1'));
select throws_ok($$insert into public.seasons (organization_id, name, starts_on, ends_on) values (tests.id('a'), 'Mine', current_date, current_date + 1)$$, '42501', null, 'a teacher cannot create seasons');
select is((select points from public.hall_of_champs(tests.id('c1'), 'season') where first_name = 'Ada'), 10, 'season Hall counts points since the season began');
select tests.reset();
select tests.act_as(tests.id('u_kid'));
select is((select count(*)::int from public.seasons), 1, 'kids see their club''s seasons');
select tests.reset();
select tests.act_as(tests.id('admin_b'));
select is((select count(*)::int from public.seasons), 0, 'another club sees no seasons');
select tests.reset();

-- ---------- insights ----------
select tests.act_as(tests.id('t1'));
select is((public.club_insights(tests.id('a')) ->> 'kids_active')::int, 3, 'insights count active kids');
select is((public.club_insights(tests.id('a')) ->> 'here_today')::int, 3, 'insights count today''s check-ins');
select is(jsonb_array_length(public.club_insights(tests.id('a')) -> 'weekly_attendance'), 8, 'eight weeks of attendance');
select tests.reset();
select tests.act_as(tests.id('admin_b'));
select throws_ok($$select public.club_insights(tests.id('a'))$$, 'P0001', 'not_allowed', 'another club cannot read insights');
select tests.reset();

-- ---------- motto ----------
select tests.act_as(tests.id('admin'));
update public.org_branding set motto = 'Brave hearts, kind hands' where organization_id = tests.id('a');
select tests.reset();
select is((select motto from public.get_clubhouse('tt-a')), 'Brave hearts, kind hands', 'the motto shows on the Clubhouse');

select * from finish();
rollback;
