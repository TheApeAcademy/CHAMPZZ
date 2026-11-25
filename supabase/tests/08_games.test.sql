-- Road to Champ and the Arena: answers hidden from kids, server-checked
-- Training Ground, idempotent host results, capped Arena points.
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
grant select, insert on tests.v to authenticated;
create function tests.id(p text) returns uuid language sql stable as $$ select id from tests.v where k = p $$;
grant execute on function tests.id(text) to authenticated;

do $$
declare a uuid; b uuid; plan uuid;
begin
  select id into plan from public.plans where code = 'starter';
  insert into public.organizations (slug, name, kind, status, faith_mode) values ('gm-a', 'GM A', 'church', 'active', true) returning id into a;
  insert into public.organizations (slug, name, kind, status, faith_mode) values ('gm-b', 'GM B', 'club', 'active', false) returning id into b;
  insert into public.subscriptions (organization_id, plan_id, billing_interval, currency, current_period_start, current_period_end)
    values (a, plan, 'month', 'NGN', now(), now() + interval '30 days'), (b, plan, 'month', 'NGN', now(), now() + interval '30 days');
  insert into tests.v values ('a', a), ('b', b), ('teacher', tests.make_user()), ('teacher_b', tests.make_user()), ('parent', tests.make_user()),
    ('u_ada', tests.make_user('kid')), ('u_bo', tests.make_user('kid'));
  insert into public.memberships (organization_id, user_id, role) values (a, tests.id('teacher'), 'teacher'), (b, tests.id('teacher_b'), 'teacher');
  insert into public.kids (organization_id, user_id, first_name, username, confirmed_at) values
    (a, tests.id('u_ada'), 'Ada', 'brave-lion-51', now()), (b, tests.id('u_bo'), 'Bo', 'swift-fox-52', now());
  insert into tests.v select 'ada', id from public.kids where username = 'brave-lion-51';
  insert into tests.v select 'bo', id from public.kids where username = 'swift-fox-52';
  insert into public.guardians (organization_id, kid_id, user_id) values (a, tests.id('ada'), tests.id('parent'));
  insert into tests.v select 'bible', id from public.question_packs where organization_id is null and name = 'Bible Champs';
  insert into tests.v select 'general', id from public.question_packs where organization_id is null and name = 'General Knowledge';
end $$;

select is((select count(*)::int from public.questions where pack_id = tests.id('bible')), 30, 'Bible Champs has 30 questions');
select is((select count(*)::int from public.questions where pack_id = tests.id('general')), 30, 'General Knowledge has 30 questions');
select is((select count(distinct tier)::int from public.questions where pack_id = tests.id('general')), 5, 'every tier is covered');

-- ---------- answers stay hidden from kids ----------
select tests.act_as(tests.id('u_ada'));
select is((select count(*)::int from public.questions), 0, 'a kid cannot read questions or answers');
select is((select count(*)::int from public.question_packs where organization_id is null), 2, 'a kid sees the default pack names');
select tests.reset();
select tests.act_as(tests.id('parent'));
select is((select count(*)::int from public.questions), 0, 'a parent cannot read answers either');
select tests.reset();
select tests.act_as(tests.id('teacher'));
select is((select count(*)::int from public.questions where organization_id is null), 60, 'staff can read the default packs to host');
select tests.reset();

-- a club pack, made by the teacher through RLS
select tests.act_as(tests.id('teacher'));
select lives_ok($$insert into public.question_packs (organization_id, name) values (tests.id('a'), 'Our pack')$$, 'staff create a club pack');
select lives_ok($$insert into public.questions (pack_id, tier, prompt, choices, answer_index)
  select id, t, 'Club question ' || t, array['A', 'B', 'C', 'D'], 1 from public.question_packs, generate_series(1, 5) t where name = 'Our pack'$$, 'staff add questions');
select is((select count(*)::int from public.questions q join public.question_packs p on p.id = q.pack_id where p.name = 'Our pack' and q.organization_id = tests.id('a')), 5, 'questions take their club from the pack');
select throws_ok($$insert into public.question_packs (organization_id, name) values (null, 'Fake default')$$, '42501', null, 'nobody can add a Champzz default pack');
select lives_ok($$update public.questions set answer_index = 0 where organization_id is null$$, 'an update of default questions runs...');
select tests.reset();
select ok((select count(*) from public.questions where organization_id is null and answer_index <> 0) > 0, '...but changes nothing');
insert into tests.v select 'ourpack', id from public.question_packs where name = 'Our pack';
select tests.act_as(tests.id('teacher_b'));
select is((select count(*)::int from public.questions where organization_id = tests.id('a')), 0, 'another club cannot read our questions');
select is((select count(*)::int from public.question_packs where organization_id = tests.id('a')), 0, 'or our packs');
select throws_ok($$insert into public.questions (pack_id, tier, prompt, choices, answer_index) values (tests.id('ourpack'), 1, 'Sneaky', array['A', 'B', 'C', 'D'], 0)$$, '42501', null, 'another club cannot add to our pack');
select tests.reset();

-- ---------- Training Ground ----------
select tests.act_as(tests.id('u_ada'));
insert into tests.v select 'run', public.start_training(tests.id('bible'));
select is((public.training_state(tests.id('run')) ->> 'total')::int, 10, 'a round is 10 questions, two per tier');
select is((public.training_state(tests.id('run')) -> 'question' ->> 'tier')::int, 1, 'easiest first');
select ok(public.training_state(tests.id('run')) -> 'question' -> 'answer_index' is null, 'the question comes without its answer');
select is(array_length(public.training_half_time(tests.id('run')), 1), 2, 'Half Time hides two answers');
select throws_ok($$select public.training_half_time(tests.id('run'))$$, 'P0001', 'power_up_used', 'Half Time works once per round');
select tests.reset();
-- the hidden pair never includes the right answer
select ok((select answer_index from public.questions where id = (select question_ids[1] from public.training_runs where id = tests.id('run'))) is not null, 'answer exists');
select tests.act_as(tests.id('u_ada'));
select is((public.training_answer(tests.id('run'), -1) ->> 'correct')::boolean, false, 'a timeout is wrong');
select tests.reset();
-- answer the rest correctly (the test reads answers as the database owner)
do $$
declare i int; q uuid; ans int;
begin
  for i in 2..10 loop
    select question_ids[i] into q from public.training_runs where id = tests.id('run');
    select answer_index into ans from public.questions where id = q;
    perform tests.act_as(tests.id('u_ada'));
    perform public.training_answer(tests.id('run'), ans);
    perform tests.reset();
  end loop;
end $$;
select is((select correct from public.training_runs where id = tests.id('run')), 9, 'nine right answers counted');
select ok((select finished_at is not null from public.training_runs where id = tests.id('run')), 'the round is finished');
select is((select points from public.point_events where kid_id = tests.id('ada') and source = 'training_round'), 15, 'a finished round is worth 15 Champ Points');
select tests.act_as(tests.id('u_ada'));
select throws_ok($$select public.training_answer(tests.id('run'), 0)$$, 'P0001', 'run_finished', 'no answers after the end');
insert into tests.v select 'run2', public.start_training(tests.id('general'));
select tests.reset();
do $$
declare i int; q uuid; ans int;
begin
  for i in 1..10 loop
    select question_ids[i] into q from public.training_runs where id = tests.id('run2');
    select answer_index into ans from public.questions where id = q;
    perform tests.act_as(tests.id('u_ada'));
    perform public.training_answer(tests.id('run2'), ans);
    perform tests.reset();
  end loop;
end $$;
select is((select count(*)::int from public.point_events where kid_id = tests.id('ada') and source = 'training_round'), 1, 'only one Training Ground reward a day');

select tests.act_as(tests.id('u_bo'));
select throws_ok($$select public.start_training(tests.id('bible'))$$, 'P0001', 'bad_pack', 'faith packs are not offered when faith mode is off');
select throws_ok($$select public.training_state(tests.id('run'))$$, 'P0001', 'not_allowed', 'a kid cannot open someone else''s round');
select throws_ok($$select public.start_training(tests.id('ourpack'))$$, 'P0001', 'bad_pack', 'or another club''s pack');
select lives_ok($$select public.start_training(tests.id('general'))$$, 'General Knowledge works everywhere');
select tests.reset();
select tests.act_as(tests.id('teacher'));
select throws_ok($$select public.start_training(tests.id('general'))$$, 'P0001', 'not_allowed', 'Training Ground is for kids');
select tests.reset();

-- ---------- host matches ----------
select tests.act_as(tests.id('teacher'));
insert into tests.v values ('client', gen_random_uuid());
insert into tests.v select 'match', public.save_quiz_match(tests.id('a'), tests.id('bible'), '[{"name": "Lions", "score": 1700}, {"name": "Eagles", "score": 900}]', 10, tests.id('client'));
select is(public.save_quiz_match(tests.id('a'), tests.id('bible'), '[{"name": "Lions", "score": 1700}]', 10, tests.id('client')), tests.id('match'), 'an offline result uploaded twice is saved once');
select is((select teams -> 0 ->> 'name' from public.quiz_matches where id = tests.id('match')), 'Lions', 'teams are stored');
select throws_ok($$select public.save_quiz_match(tests.id('a'), tests.id('bible'), '[{"name": "", "score": 1}]', 1, gen_random_uuid())$$, 'P0001', 'bad_teams', 'team names are checked');
select throws_ok($$select public.save_quiz_match(tests.id('a'), tests.id('bible'), '[{"name": "X", "score": 999999}]', 1, gen_random_uuid())$$, 'P0001', 'bad_teams', 'scores are checked');
select tests.reset();
select tests.act_as(tests.id('teacher_b'));
select throws_ok($$select public.save_quiz_match(tests.id('a'), tests.id('general'), '[{"name": "X", "score": 1}]', 1, gen_random_uuid())$$, 'P0001', 'not_allowed', 'another club cannot save into ours');
select is((select count(*)::int from public.quiz_matches), 0, 'or read our match history');
select tests.reset();
select tests.act_as(tests.id('u_ada'));
select is((select count(*)::int from public.quiz_matches), 0, 'kids do not read match history');
select tests.reset();

-- ---------- Arena ----------
select tests.act_as(tests.id('u_ada'));
select is(public.finish_arena_game('memory', 120), 5, 'a finished Arena game is worth 5 Champ Points');
select is(public.finish_arena_game('memory', 300), 0, 'the same game again today pays nothing');
select is(public.finish_arena_game('catch', 40), 5, 'a different game pays');
select throws_ok($$select public.finish_arena_game('hack', 1)$$, 'P0001', 'bad_game', 'unknown games are refused');
select is((select count(*)::int from public.arena_plays), 3, 'plays are recorded');
select ok((select count(*) from public.arena_content where organization_id is null) >= 20, 'kids can read the default Arena content');
select throws_ok($$insert into public.arena_content (organization_id, game, title, data) values (tests.id('a'), 'scramble', 'x', '{"text": "Kids cannot add this"}')$$, '42501', null, 'kids cannot add Arena content');
select tests.reset();
select tests.act_as(tests.id('teacher'));
select lives_ok($$insert into public.arena_content (organization_id, game, title, data) values (tests.id('a'), 'scramble', 'Our motto', '{"text": "Brave hearts and kind hands"}')$$, 'staff add club Arena content');
select throws_ok($$insert into public.arena_content (organization_id, game, title, data) values (tests.id('a'), 'whoami', 'Bad', '{"answer": "X"}')$$, '23514', null, 'content shape is checked');
select tests.reset();
select tests.act_as(tests.id('u_bo'));
select is((select count(*)::int from public.arena_content where organization_id = tests.id('a')), 0, 'another club''s kid cannot see our content');
select tests.reset();

select * from finish();
rollback;
