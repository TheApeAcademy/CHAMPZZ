-- Take-Home on lessons, parents reading their own child's lessons, the weekly report.
begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

create schema tests;
create function tests.make_user(p_kind text default 'adult') returns uuid language plpgsql as $$
declare v uuid := gen_random_uuid();
begin
  insert into auth.users (id, instance_id, aud, role, email, raw_app_meta_data, raw_user_meta_data, email_confirmed_at)
  values (v, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v || '@t.local', jsonb_build_object('kind', p_kind), '{}'::jsonb, now());
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
grant usage on schema tests to authenticated;
grant select on tests.v to authenticated;
create function tests.id(p text) returns uuid language sql stable as $$ select id from tests.v where k = p $$;
grant execute on function tests.id(text) to authenticated;

do $$
declare a uuid; b uuid; c1 uuid; c2 uuid; plan uuid;
begin
  select id into plan from public.plans where code = 'starter';
  insert into public.organizations (slug, name, kind, status, faith_mode) values ('pr-a', 'PR A', 'church', 'active', true) returning id into a;
  insert into public.organizations (slug, name, kind, status, faith_mode) values ('pr-b', 'PR B', 'club', 'active', false) returning id into b;
  insert into public.subscriptions (organization_id, plan_id, billing_interval, currency, current_period_start, current_period_end)
    values (a, plan, 'month', 'NGN', now(), now() + interval '30 days'), (b, plan, 'month', 'NGN', now(), now() + interval '30 days');
  insert into public.classes (organization_id, name) values (a, 'One') returning id into c1;
  insert into public.classes (organization_id, name) values (a, 'Two') returning id into c2;
  insert into tests.v values ('a', a), ('b', b), ('c1', c1), ('c2', c2),
    ('teacher', tests.make_user()), ('parent', tests.make_user()), ('parent2', tests.make_user()), ('parent_b', tests.make_user()),
    ('u_ada', tests.make_user('kid')), ('u_bo', tests.make_user('kid')), ('u_cy', tests.make_user('kid'));
  insert into public.memberships (organization_id, user_id, role) values (a, tests.id('teacher'), 'teacher');
  insert into public.kids (organization_id, user_id, first_name, last_initial, username, class_id, confirmed_at) values
    (a, tests.id('u_ada'), 'Ada', 'O', 'brave-lion-41', c1, now()),
    (a, tests.id('u_bo'), 'Bo', null, 'swift-fox-42', c2, now()),
    (b, tests.id('u_cy'), 'Cy', null, 'calm-otter-43', null, now());
  insert into tests.v select 'ada', id from public.kids where username = 'brave-lion-41';
  insert into tests.v select 'bo', id from public.kids where username = 'swift-fox-42';
  insert into tests.v select 'cy', id from public.kids where username = 'calm-otter-43';
  insert into public.guardians (organization_id, kid_id, user_id) values
    (a, tests.id('ada'), tests.id('parent')), (a, tests.id('bo'), tests.id('parent2')), (b, tests.id('cy'), tests.id('parent_b'));
  insert into public.lessons (organization_id, class_id, title, memory_verse, status, take_home_talk, take_home_do, take_home_pray) values
    (a, c1, 'L1 brave', 'Be strong', 'published', 'When did you feel brave?', 'Draw it', 'Thank God for courage'),
    (a, c2, 'L2 kind', null, 'published', null, null, null),
    (a, null, 'L3 club', null, 'published', null, null, null),
    (a, c1, 'L4 draft', null, 'draft', null, null, null);
  insert into public.lessons (organization_id, class_id, title, memory_verse, status, take_home_talk) values
    (b, null, 'Club lesson', 'Hidden verse', 'published', 'Talk about teamwork');
end $$;

-- ---------- parents read their own child's lessons ----------
select tests.act_as(tests.id('parent'));
select is((select array_agg(title order by title) from public.lessons), array['L1 brave', 'L3 club'], 'a parent sees published lessons for their child''s class and the whole club');
select throws_ok($$insert into public.lessons (organization_id, title) values (tests.id('a'), 'x')$$, '42501', null, 'a parent cannot write lessons');
select tests.reset();
select tests.act_as(tests.id('parent2'));
select is((select array_agg(title order by title) from public.lessons), array['L2 kind', 'L3 club'], 'another parent sees their own child''s class');
select tests.reset();
select tests.act_as(tests.id('parent_b'));
select is((select array_agg(title order by title) from public.lessons), array['Club lesson'], 'a parent in another club sees only their club');
select tests.reset();

-- ---------- the weekly report ----------
select app.record_activity(tests.id('ada'), app.org_today(tests.id('a')));
select tests.act_as(tests.id('teacher'));
select public.give_star(tests.id('ada'), 'Great listening');
select tests.reset();

select tests.act_as(tests.id('parent'));
select is((public.kid_report(tests.id('ada')) ->> 'points_week')::int, 15, 'this week''s points: a visit (5) and a star (10)');
select is((public.kid_report(tests.id('ada')) ->> 'stars_week')::int, 1, 'stars this week');
select is((public.kid_report(tests.id('ada')) ->> 'visits_week')::int, 1, 'visits this week');
select is((public.kid_report(tests.id('ada')) -> 'lessons' -> 0 ->> 'talk'), 'When did you feel brave?', 'the Take-Home card is in the report');
select is((select array_agg(x ->> 'title' order by x ->> 'title') from jsonb_array_elements(public.kid_report(tests.id('ada')) -> 'lessons') x), array['L1 brave', 'L3 club'], 'only this child''s published lessons');
select is((public.kid_report(tests.id('ada')) -> 'lessons' -> 0 ->> 'memory_verse'), 'Be strong', 'memory verse shown in faith mode');
select ok(jsonb_array_length(public.kid_report(tests.id('ada')) -> 'badges_week') >= 2, 'new trophies this week are listed');
select is(public.kid_report(tests.id('ada')) ->> 'level', 'Rookie', 'current level');
select is((public.kid_report(tests.id('ada')) ->> 'points_to_next')::int, 85, 'points to the next level');
select is((public.kid_report(tests.id('ada'), app_today_minus_week.d) ->> 'points_week')::int, 0, 'last week is a separate report')
  from (select (current_date - 7) as d) app_today_minus_week;
select throws_ok($$select public.kid_report(tests.id('bo'))$$, 'P0001', 'not_allowed', 'a parent cannot read another child''s report');
select tests.reset();

select tests.act_as(tests.id('parent_b'));
select is((public.kid_report(tests.id('cy')) -> 'lessons' -> 0 ->> 'memory_verse'), null, 'no memory verse when faith mode is off');
select is((public.kid_report(tests.id('cy')) -> 'lessons' -> 0 ->> 'talk'), 'Talk about teamwork', 'Take-Home still works in a secular club');
select throws_ok($$select public.kid_report(tests.id('ada'))$$, 'P0001', 'not_allowed', 'another club cannot read the report');
select tests.reset();

select tests.act_as(tests.id('teacher'));
select lives_ok($$select public.kid_report(tests.id('ada'))$$, 'the club''s teacher can read it');
select tests.reset();
select tests.act_as(tests.id('u_ada'));
select lives_ok($$select public.kid_report(tests.id('ada'))$$, 'the kid can read their own');
select throws_ok($$select public.kid_report(tests.id('bo'))$$, 'P0001', 'not_allowed', 'but not a classmate''s');
select tests.reset();

-- ---------- Sunday alert ----------
select ok(app.weekly_report_notify() >= 3, 'every parent of an active kid is told');
select ok(exists (select 1 from public.notifications where recipient_id = tests.id('parent') and kind = 'weekly_report'
                  and link = '/p/kids/' || tests.id('ada') || '/report'), 'the alert links to the report');
select is((select schedule from cron.job where jobname = 'champzz-weekly-report'), '0 17 * * 0', 'scheduled for Sunday evening');

select * from finish();
rollback;
