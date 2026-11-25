-- Champ Points, Fire Streak, Trophies, Hall of Champs, stars, My Champ.
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

-- fixture: org A with classes 1 and 2, org B; a teacher; kids
do $$
declare a uuid; b uuid; c1 uuid; c2 uuid; t uuid; tb uuid; plan uuid;
begin
  select id into plan from public.plans where code = 'starter';
  insert into public.organizations (slug, name, kind, status, timezone) values ('kc-a', 'KC A', 'club', 'active', 'Africa/Lagos') returning id into a;
  insert into public.organizations (slug, name, kind, status) values ('kc-b', 'KC B', 'club', 'active') returning id into b;
  insert into public.subscriptions (organization_id, plan_id, billing_interval, currency, current_period_start, current_period_end)
    values (a, plan, 'month', 'NGN', now(), now() + interval '30 days'), (b, plan, 'month', 'NGN', now(), now() + interval '30 days');
  insert into public.classes (organization_id, name) values (a, 'One') returning id into c1;
  insert into public.classes (organization_id, name) values (a, 'Two') returning id into c2;
  t := tests.make_user(); tb := tests.make_user();
  insert into public.memberships (organization_id, user_id, role) values (a, t, 'teacher'), (b, tb, 'teacher');
  insert into tests.v values ('a', a), ('b', b), ('c1', c1), ('c2', c2), ('teacher', t), ('teacher_b', tb);
  insert into tests.v values ('u_ada', tests.make_user('kid')), ('u_bola', tests.make_user('kid')), ('u_new', tests.make_user('kid')),
    ('u_other', tests.make_user('kid')), ('u_bkid', tests.make_user('kid'));
  insert into public.kids (organization_id, user_id, first_name, last_initial, username, class_id, confirmed_at) values
    (a, tests.id('u_ada'), 'Ada', 'O', 'brave-lion-11', c1, now()),
    (a, tests.id('u_bola'), 'Bola', 'T', 'swift-fox-12', c1, now()),
    (a, tests.id('u_new'), 'Newbie', null, 'calm-otter-13', c1, null),
    (a, tests.id('u_other'), 'Other', null, 'kind-panda-14', c2, now()),
    (b, tests.id('u_bkid'), 'Bravo', null, 'bold-hawk-15', null, now());
  insert into tests.v select 'ada', id from public.kids where username = 'brave-lion-11';
  insert into tests.v select 'bola', id from public.kids where username = 'swift-fox-12';
  insert into tests.v select 'bkid', id from public.kids where username = 'bold-hawk-15';
end $$;

-- daily visit: points once per day, streak, Welcome trophy
select lives_ok($$select app.record_activity(tests.id('ada'), current_date - 2)$$, 'visit day 1');
select lives_ok($$select app.record_activity(tests.id('ada'), current_date - 2)$$, 'same day again is a no-op');
select is((select points_total from public.kid_stats where kid_id = tests.id('ada')), 5, 'daily visit gives 5 Champ Points once per day');
select ok(exists (select 1 from public.kid_badges kb join public.badges b on b.id = kb.badge_id where kb.kid_id = tests.id('ada') and b.code = 'welcome'), 'first visit earns Welcome, Champ');
select app.record_activity(tests.id('ada'), current_date - 1);
select app.record_activity(tests.id('ada'), current_date);
select is((select streak_current from public.kid_stats where kid_id = tests.id('ada')), 3, 'three days in a row: Fire Streak 3');
select ok(exists (select 1 from public.kid_badges kb join public.badges b on b.id = kb.badge_id where kb.kid_id = tests.id('ada') and b.code = 'streak_3'), 'a 3 day streak earns On Fire');
select app.record_activity(tests.id('bola'), current_date - 5);
select app.record_activity(tests.id('bola'), current_date);
select is((select streak_current from public.kid_stats where kid_id = tests.id('bola')), 1, 'a gap resets the streak to 1');
select is((select streak_best from public.kid_stats where kid_id = tests.id('bola')), 1, 'best streak is kept');
select is((select points_total from public.kid_stats where kid_id = tests.id('ada')), 15, '3 visits = 15 points');

-- teacher stars
select tests.act_as(tests.id('teacher'));
select is(public.give_star(tests.id('ada'), 'Great memory verse'), 10, 'a star is worth 10 points');
select tests.reset();
select is((select points_total from public.kid_stats where kid_id = tests.id('ada')), 25, 'points total includes the star');
select ok(exists (select 1 from public.kid_badges kb join public.badges b on b.id = kb.badge_id where kb.kid_id = tests.id('ada') and b.code = 'first_star'), 'first star earns Shining Star');
select tests.act_as(tests.id('teacher'));
select public.give_star(tests.id('ada')) from generate_series(1, 4);
select throws_ok($$select public.give_star(tests.id('ada'))$$, 'P0001', 'star_limit_reached', 'max 5 stars per kid per teacher per day');
select throws_ok($$select public.give_star(tests.id('bkid'))$$, 'P0001', 'not_allowed', 'a teacher cannot star another club''s kid');
select tests.reset();
select tests.act_as(tests.id('u_ada'));
select throws_ok($$select public.give_star(tests.id('bola'))$$, 'P0001', 'not_allowed', 'a kid cannot give stars');
select throws_ok($$insert into public.point_events (organization_id, kid_id, source, ref, points) values (tests.id('a'), tests.id('ada'), 'hack', 'x', 9999)$$, '42501', null, 'a kid cannot write points directly');
select throws_ok($$update public.kid_stats set points_total = 99999 where kid_id = tests.id('ada')$$, '42501', null, 'a kid cannot edit their stats');
select tests.reset();

-- replay protection
select is(app.award_points(tests.id('ada'), 'daily_visit', (current_date)::text), 0, 'replaying an award adds nothing');

-- Hall of Champs: own class only, confirmed kids only (plus self), no other clubs
select tests.act_as(tests.id('u_ada'));
select is((select array_agg(first_name order by first_name) from public.hall_of_champs()), array['Ada', 'Bola'], 'kid sees own class, confirmed kids only');
select ok((select is_me from public.hall_of_champs() where first_name = 'Ada'), 'kid is marked as me');
select is((select points from public.hall_of_champs(null, 'all') where first_name = 'Ada'), 65, 'all-time points shown: 3 visits (15) + 5 stars (50)');
select tests.reset();
select tests.act_as(tests.id('u_new'));
select is((select array_agg(first_name order by first_name) from public.hall_of_champs()), array['Ada', 'Bola', 'Newbie'], 'a new kid sees themselves too');
select tests.reset();
select tests.act_as(tests.id('teacher'));
select is((select array_agg(first_name) from public.hall_of_champs(tests.id('c2'))), array['Other'], 'teacher can view another class in their club');
select tests.reset();
select tests.act_as(tests.id('teacher_b'));
select throws_ok($$select * from public.hall_of_champs(tests.id('c1'))$$, 'P0001', 'not_allowed', 'a teacher from another club cannot view this Hall');
select tests.reset();

-- reads: kids see only their own stats
select tests.act_as(tests.id('u_ada'));
select is((select array_agg(kid_id) from public.kid_stats), array[tests.id('ada')], 'kid sees only their own stats');
select is((select count(*)::int from public.point_events where kid_id <> tests.id('ada')), 0, 'kid sees only their own point history');
select tests.reset();

-- My Champ: valid saves, locked extras refused
select tests.act_as(tests.id('u_ada'));
select lives_ok($$select public.update_my_champ('{"skin":"2","hair":"1","hairColor":"3","outfit":"4","extra":"none"}')$$, 'avatar saves');
select throws_ok($$select public.update_my_champ('{"skin":"2","extra":"crown"}')$$, 'P0001', 'locked_item', 'the crown is locked until Champ level');
select throws_ok($$select public.update_my_champ('{"skin":"9"}')$$, 'P0001', 'bad_avatar', 'out-of-range values are refused');
select throws_ok($$select public.update_my_champ('{"evil":"<script>"}')$$, 'P0001', 'bad_avatar', 'unknown keys are refused');
select tests.reset();
select is((select avatar ->> 'outfit' from public.kids where id = tests.id('ada')), '4', 'avatar stored');

-- levels
select is((app.level_of(0)).code, 'rookie', '0 points: Rookie');
select is((app.level_of(100)).code, 'rising_star', '100 points: Rising Star');
select is((app.level_of(1500)).code, 'champ', '1500 points: Champ');

-- record_my_visit works for a signed-in kid and does nothing for an adult
select tests.act_as(tests.id('u_other'));
select lives_ok($$select public.record_my_visit()$$, 'kid records a visit');
select tests.reset();
select is((select visits from public.kid_stats where kid_id = (select id from public.kids where username = 'kind-panda-14')), 1, 'visit counted');
select tests.act_as(tests.id('teacher'));
select lives_ok($$select public.record_my_visit()$$, 'an adult calling it is a harmless no-op');
select tests.reset();

select * from finish();
rollback;
